import { isSameDay, subDays } from 'date-fns';
import { uniqBy } from 'lodash';
import config from '../../../constants/config';
import ErrorTracking from '../../error-tracking/error-tracking';
import { IChromeWebsite } from '../../fetch/chrome/fetch-history';
import { cleanupUrl } from '../../shared/cleanup-url';
import { ISegment, IWebsite, IWebsiteVisit } from '../data-types';
import { dbType } from '../db';
import { IStore } from '../use-store';
import { formatSegmentTitle } from './segment-document-model';
import { BaseStoreImpl } from './base-store';
import { PaginatedResult, QueryOptions, StoreResult } from '../types/store-types';
import { safeOperation, withRetry } from '../utils/error-handler';

interface IWebsiteVisitNotFormatted {
  startAt: Date;
  url: string;
  domain: string;
}

/**
 * Type guard to check if a StoreResult is a failure
 */
function isFailure<T>(result: StoreResult<T>): result is { success: false; error: any } {
  return !result.success;
}

/**
 * Enhanced WebsiteVisitStore that extends BaseStoreImpl
 * Provides pagination, error handling, performance monitoring, and bulk operations
 */
export default class EnhancedWebsiteVisitStore extends BaseStoreImpl<IWebsiteVisit> {
  constructor(db: dbType) {
    super(db, 'websiteVisit');
  }

  /**
   * Override to specify valid sort fields for website visits
   */
  protected isValidSortField(field: string): boolean {
    return ['id', 'visitedTime', 'domain', 'websiteId', 'segmentId'].includes(field);
  }

  /**
   * Get all website visits for a specific segment with enhanced error handling and pagination
   */
  async getAllForSegment(
    segment: ISegment,
    domainBlocklistStore: IStore['domainBlocklistStore'],
    websiteBlocklistStore: IStore['websiteBlocklistStore'],
    options: QueryOptions = {},
  ): Promise<StoreResult<PaginatedResult<IWebsiteVisit>>> {
    return safeOperation(async () => {
      const startTime = performance.now();

      try {
        // Get visits by segment ID
        const websitesByIdResult = await this.getByIndex('by-segment-id', segment.id);
        if (isFailure(websitesByIdResult)) {
          throw websitesByIdResult.error;
        }

        let websitesByTitle: IWebsiteVisit[] = [];
        const formattedTitle = formatSegmentTitle(segment.summary);

        if (formattedTitle) {
          const websitesByTitleResult = await this.getByIndex('by-segment-title', formattedTitle);
          if (isFailure(websitesByTitleResult)) {
            throw websitesByTitleResult.error;
          }
          websitesByTitle = websitesByTitleResult.data;
        }

        // Combine and deduplicate
        const websites = uniqBy(websitesByTitle.concat(websitesByIdResult.data), 'id');

        // Apply filtering
        const filteredWebsites = await this.filterWebsites(
          websites,
          domainBlocklistStore,
          websiteBlocklistStore,
        );

        // Apply pagination and sorting
        const { limit = 100, offset = 0, orderBy, orderDirection = 'desc' } = options;

        let sortedWebsites = filteredWebsites;
        if (orderBy && this.isValidSortField(orderBy)) {
          sortedWebsites = filteredWebsites.sort((a, b) => {
            const aValue = (a as any)[orderBy];
            const bValue = (b as any)[orderBy];

            if (aValue < bValue) return orderDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return orderDirection === 'asc' ? 1 : -1;
            return 0;
          });
        } else {
          // Default sort by visitedTime descending
          sortedWebsites = filteredWebsites.sort(
            (a, b) => b.visitedTime.getTime() - a.visitedTime.getTime(),
          );
        }

        const paginatedWebsites = sortedWebsites.slice(offset, offset + limit);
        const hasMore = offset + limit < sortedWebsites.length;

        const result: PaginatedResult<IWebsiteVisit> = {
          data: paginatedWebsites,
          total: sortedWebsites.length,
          hasMore,
          nextOffset: hasMore ? offset + limit : undefined,
        };

        this.recordQueryTime(performance.now() - startTime);
        return result;
      } catch (error) {
        this.performanceMetrics.errorCount++;
        throw error;
      }
    }, `getAllForSegment-${this.storeName}`);
  }

  /**
   * Get all website visits with filtering and pagination
   */
  async getAllFiltered(
    domainBlocklistStore: IStore['domainBlocklistStore'],
    websiteBlocklistStore: IStore['websiteBlocklistStore'],
    options: QueryOptions = {},
  ): Promise<StoreResult<PaginatedResult<IWebsiteVisit>>> {
    return safeOperation(async () => {
      const startTime = performance.now();

      try {
        // Get paginated results first
        const paginatedResult = await this.getAll(options);

        if (isFailure(paginatedResult)) {
          throw paginatedResult.error;
        }

        // Apply filtering to the data
        const filteredData = await this.filterWebsites(
          paginatedResult.data.data,
          domainBlocklistStore,
          websiteBlocklistStore,
        );

        const result: PaginatedResult<IWebsiteVisit> = {
          ...paginatedResult.data,
          data: filteredData,
        };

        this.recordQueryTime(performance.now() - startTime);
        return result;
      } catch (error) {
        this.performanceMetrics.errorCount++;
        throw error;
      }
    }, `getAllFiltered-${this.storeName}`);
  }

  /**
   * Get all website visits for a specific day with enhanced error handling
   */
  async getAllForDay(
    domainBlocklistStore: IStore['domainBlocklistStore'],
    websiteBlocklistStore: IStore['websiteBlocklistStore'],
    day: Date,
    options: QueryOptions = {},
  ): Promise<StoreResult<PaginatedResult<IWebsiteVisit>>> {
    return safeOperation(async () => {
      const startTime = performance.now();

      try {
        const allWebsitesResult = await this.getAllFiltered(
          domainBlocklistStore,
          websiteBlocklistStore,
          { ...options, limit: undefined, offset: undefined }, // Get all for filtering
        );

        if (isFailure(allWebsitesResult)) {
          throw allWebsitesResult.error;
        }

        // Filter by day
        const dayWebsites = allWebsitesResult.data.data.filter((w) =>
          isSameDay(w.visitedTime, day),
        );

        // Apply pagination to filtered results
        const { limit = 100, offset = 0 } = options;
        const paginatedWebsites = dayWebsites.slice(offset, offset + limit);
        const hasMore = offset + limit < dayWebsites.length;

        const result: PaginatedResult<IWebsiteVisit> = {
          data: paginatedWebsites,
          total: dayWebsites.length,
          hasMore,
          nextOffset: hasMore ? offset + limit : undefined,
        };

        this.recordQueryTime(performance.now() - startTime);
        return result;
      } catch (error) {
        this.performanceMetrics.errorCount++;
        throw error;
      }
    }, `getAllForDay-${this.storeName}`);
  }

  /**
   * Enhanced cleanup with better error handling and performance tracking
   */
  async cleanup(): Promise<StoreResult<void>> {
    return safeOperation(async () => {
      const startTime = performance.now();

      try {
        const websites = await withRetry(
          () => this.db.getAll('websiteVisit'),
          { maxAttempts: 2 },
          'cleanup-getWebsiteVisits',
        );

        const websitesToDelete = websites.filter(
          (site) => !site.visitedTime || site.visitedTime < config.startDate,
        );

        if (websitesToDelete.length > 0) {
          // Use bulk delete for better performance
          await this.deleteBulk(websitesToDelete.map((w) => w.id));
        }

        this.recordQueryTime(performance.now() - startTime);
        console.log(`Cleaned up ${websitesToDelete.length} old website visits`);
      } catch (error) {
        this.performanceMetrics.errorCount++;
        throw error;
      }
    }, `cleanup-${this.storeName}`);
  }

  /**
   * Bulk delete operation with enhanced error handling
   */
  async deleteBulk(ids: string[]): Promise<StoreResult<void>> {
    return safeOperation(async () => {
      const startTime = performance.now();

      try {
        const tx = this.db.transaction(this.storeName as any, 'readwrite');

        await Promise.all([...ids.map((id) => tx.store.delete(id)), tx.done]);

        this.recordQueryTime(performance.now() - startTime);
      } catch (error) {
        this.performanceMetrics.errorCount++;
        throw error;
      }
    }, `deleteBulk-${this.storeName}`);
  }

  /**
   * Enhanced website filtering with better error handling
   */
  private async filterWebsites(
    websites: IWebsiteVisit[],
    domainBlocklistStore: IStore['domainBlocklistStore'],
    websiteBlocklistStore: IStore['websiteBlocklistStore'],
  ): Promise<IWebsiteVisit[]> {
    try {
      const domainBlocklistArray = await domainBlocklistStore.getAll();
      const websiteBlocklistArray = await websiteBlocklistStore.getAll();
      const domainBlocklist: { [id: string]: boolean } = {};
      const websiteBlocklist: { [id: string]: boolean } = {};

      // Make some hashes
      domainBlocklistArray.forEach((item) => (domainBlocklist[item.id] = true));
      websiteBlocklistArray.forEach((item) => (websiteBlocklist[item.id] = true));

      const currentDate = new Date();
      const filterTime = subDays(currentDate, config.NUMBER_OF_DAYS_BACK);

      return websites.filter(
        (item) =>
          item.visitedTime > filterTime &&
          !domainBlocklist[item.domain] &&
          !websiteBlocklist[item.url],
      );
    } catch (error) {
      ErrorTracking.logError(error as Error);
      // Return unfiltered results if filtering fails
      return websites;
    }
  }

  /**
   * Enhanced history import with bulk operations
   */
  async addHistoryToStore(
    websites: IChromeWebsite[],
    timeStore: IStore['timeDataStore'],
  ): Promise<StoreResult<void>> {
    return safeOperation(async () => {
      const startTime = performance.now();

      try {
        const formattedWebsites = await Promise.allSettled(
          websites.map(async (website): Promise<IWebsiteVisit> => {
            const currentMeetingResult = await timeStore.getCurrentSegmentForWebsites(
              website.visitedTime || new Date(),
            );
            const currentMeeting = currentMeetingResult.success
              ? currentMeetingResult.data
              : undefined;
            return {
              id: `${website.id}-${website.visitedTime.toDateString()}`,
              websiteId: website.id,
              url: website.rawUrl,
              domain: website.domain,
              visitedTime: website.visitedTime,
              segmentId: currentMeeting ? currentMeeting.id : undefined,
              segmentName: currentMeeting ? formatSegmentTitle(currentMeeting.summary) : undefined,
            };
          }),
        );

        const successfulWebsites = formattedWebsites
          .filter(
            (result): result is PromiseFulfilledResult<IWebsiteVisit> =>
              result.status === 'fulfilled',
          )
          .map((result) => result.value);

        if (successfulWebsites.length > 0) {
          // Use bulk operation for better performance
          await this.addBulk(successfulWebsites);
        }

        // Log any failures
        const failures = formattedWebsites.filter((result) => result.status === 'rejected');
        failures.forEach((failure) => {
          ErrorTracking.logError(failure.reason as Error);
        });

        this.recordQueryTime(performance.now() - startTime);
        console.log(`Added ${successfulWebsites.length} website visits from history`);
      } catch (error) {
        this.performanceMetrics.errorCount++;
        throw error;
      }
    }, `addHistoryToStore-${this.storeName}`);
  }

  /**
   * Enhanced old website migration with bulk operations
   */
  async addOldWebsites(websites: IWebsite[]): Promise<StoreResult<void>> {
    return safeOperation(async () => {
      const startTime = performance.now();

      try {
        const formattedWebsites = websites.map(
          (website): IWebsiteVisit => ({
            id: website.id,
            domain: website.domain,
            websiteId: website.url,
            segmentId: website.meetingId,
            segmentName: website.meetingName,
            url: website.rawUrl,
            visitedTime: website.visitedTime,
          }),
        );

        // Use bulk operation for better performance
        await this.addBulk(formattedWebsites);

        this.recordQueryTime(performance.now() - startTime);
        console.log(`Migrated ${formattedWebsites.length} old websites to visits`);
      } catch (error) {
        this.performanceMetrics.errorCount++;
        throw error;
      }
    }, `addOldWebsites-${this.storeName}`);
  }

  /**
   * Enhanced visit tracking with better error handling
   */
  async trackVisit(
    website: IWebsiteVisitNotFormatted,
    timeStore: IStore['timeDataStore'],
  ): Promise<StoreResult<IWebsiteVisit>> {
    return safeOperation(async () => {
      const startTime = performance.now();

      try {
        const currentMeetingResult = await timeStore.getCurrentSegmentForWebsites(
          website.startAt || new Date(),
        );
        const currentMeeting = currentMeetingResult.success ? currentMeetingResult.data : undefined;
        const websiteId = cleanupUrl(website.url);

        const websiteVisit: IWebsiteVisit = {
          id: `${website.url}-${website.startAt.toDateString()}`,
          websiteId,
          url: website.url,
          domain: website.domain,
          visitedTime: website.startAt,
          segmentId: currentMeeting ? currentMeeting.id : undefined,
          segmentName: currentMeeting ? formatSegmentTitle(currentMeeting.summary) : undefined,
        };

        const addResult = await this.add(websiteVisit);
        if (isFailure(addResult)) {
          throw addResult.error;
        }

        this.recordQueryTime(performance.now() - startTime);
        return websiteVisit;
      } catch (error) {
        this.performanceMetrics.errorCount++;
        throw error;
      }
    }, `trackVisit-${this.storeName}`);
  }

  /**
   * Get website visits by segment ID with enhanced error handling
   */
  async getBySegmentId(segmentId: string): Promise<StoreResult<IWebsiteVisit[]>> {
    return this.getByIndex('by-segment-id', segmentId);
  }

  /**
   * Get website visits by domain with enhanced error handling
   */
  async getByDomain(domain: string): Promise<StoreResult<IWebsiteVisit[]>> {
    return this.getByIndex('domain', domain);
  }
}
