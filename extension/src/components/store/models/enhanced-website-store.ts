import { uniq } from 'lodash';
import config from '../../../../../constants/config';
import ErrorTracking from '../../error-tracking/error-tracking';
import { IChromeWebsite } from '../../fetch/chrome/fetch-history';
import { cleanupUrl } from '../../shared/cleanup-url';
import { cleanText } from '../../shared/tfidf';
import { IFeaturedWebsite } from '../../website/get-featured-websites';
import { IWebsiteItem } from '../data-types';
import { dbType } from '../db';
import { IStore } from '../use-store';
import { BaseStoreImpl } from './base-store';
import { PaginatedResult, QueryOptions, StoreResult } from '../types/store-types';
import { safeOperation, withRetry } from '../utils/error-handler';

/**
 * Type guard to check if a StoreResult is a failure
 */
function isFailure<T>(result: StoreResult<T>): result is { success: false; error: any } {
  return !result.success;
}

interface IWebsiteItemNotFormatted {
  domain: string;
  pathname: string;
  url: string;
  title?: string;
  description?: string;
  ogImage?: string;
}

/**
 * Enhanced WebsiteStore that extends BaseStoreImpl
 * Provides pagination, error handling, performance monitoring, and bulk operations
 */
export default class EnhancedWebsiteStore extends BaseStoreImpl<IWebsiteItem> {
  constructor(db: dbType) {
    super(db, 'websiteItem');
  }

  /**
   * Override to specify valid sort fields for websites
   */
  protected isValidSortField(field: string): boolean {
    return ['id', 'title', 'domain', 'visitedTime', 'index'].includes(field);
  }

  /**
   * Get websites by domain with enhanced error handling
   */
  async getByDomain(domain: string): Promise<StoreResult<IWebsiteItem[]>> {
    return this.getByIndex('domain', domain);
  }

  /**
   * Get all websites with filtering and pagination
   */
  async getAllFiltered(
    domainBlocklistStore: IStore['domainBlocklistStore'],
    websiteBlocklistStore: IStore['websiteBlocklistStore'],
    options: QueryOptions = {},
  ): Promise<StoreResult<PaginatedResult<IWebsiteItem>>> {
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

        const result: PaginatedResult<IWebsiteItem> = {
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
   * Enhanced cleanup with better error handling and performance tracking
   */
  async cleanup(): Promise<StoreResult<void>> {
    return safeOperation(async () => {
      const startTime = performance.now();

      try {
        const websites = await withRetry(
          () => this.db.getAll('websiteItem'),
          { maxAttempts: 2 },
          'cleanup-getWebsites',
        );

        const visits = await withRetry(
          () => this.db.getAll('websiteVisit'),
          { maxAttempts: 2 },
          'cleanup-getVisits',
        );

        const websiteIdByLastVisited: { [websiteId: string]: Date } = {};
        visits.forEach((v) => {
          const currentValue = websiteIdByLastVisited[v.websiteId];
          if (currentValue) {
            if (v.visitedTime > currentValue) {
              websiteIdByLastVisited[v.websiteId] = v.visitedTime;
            }
          } else {
            websiteIdByLastVisited[v.websiteId] = v.visitedTime;
          }
        });

        const websiteIdsToDelete = websites.filter((w) => {
          const lastVisited = websiteIdByLastVisited[w.id];
          if (!lastVisited || lastVisited < config.startDate) {
            return true;
          }
          return false;
        });

        if (websiteIdsToDelete.length > 0) {
          // Use bulk delete for better performance
          await this.deleteBulk(websiteIdsToDelete.map((w) => w.id));
        }

        this.recordQueryTime(performance.now() - startTime);
        console.log(`Cleaned up ${websiteIdsToDelete.length} old websites`);
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
    websites: IWebsiteItem[],
    domainBlocklistStore: IStore['domainBlocklistStore'],
    websiteBlocklistStore: IStore['websiteBlocklistStore'],
  ): Promise<IWebsiteItem[]> {
    try {
      const domainBlocklistArray = await domainBlocklistStore.getAll();
      const websiteBlocklistArray = await websiteBlocklistStore.getAll();
      const domainBlocklist: { [id: string]: boolean } = {};
      const websiteBlocklist: { [id: string]: boolean } = {};

      // Make some hashes
      domainBlocklistArray.forEach((item) => (domainBlocklist[item.id] = true));
      websiteBlocklistArray.forEach((item) => (websiteBlocklist[item.id] = true));

      return websites.filter((item) => !domainBlocklist[item.domain] && !websiteBlocklist[item.id]);
    } catch (error) {
      ErrorTracking.logError(error as Error);
      // Return unfiltered results if filtering fails
      return websites;
    }
  }

  /**
   * Enhanced history import with bulk operations
   */
  async addHistoryToStore(websites: IChromeWebsite[]): Promise<StoreResult<void>> {
    return safeOperation(async () => {
      const startTime = performance.now();

      try {
        const formattedWebsites = websites.map((website): IWebsiteItem => {
          const cleanTitle = cleanText(website.title || '');
          const tags = uniq(cleanTitle).join(' ');
          return {
            id: website.id,
            domain: website.domain,
            title: website.title,
            rawUrl: website.rawUrl,
            tags,
          };
        });

        // Use bulk operation for better performance
        await this.addBulk(formattedWebsites);

        this.recordQueryTime(performance.now() - startTime);
        console.log(`Added ${formattedWebsites.length} websites from history`);
      } catch (error) {
        this.performanceMetrics.errorCount++;
        throw error;
      }
    }, `addHistoryToStore-${this.storeName}`);
  }

  /**
   * Enhanced visit tracking with better error handling
   */
  async trackVisit(
    website: IWebsiteItemNotFormatted,
    tag?: string,
  ): Promise<StoreResult<IWebsiteItem>> {
    return safeOperation(async () => {
      const startTime = performance.now();

      try {
        const id = cleanupUrl(website.url);
        const existingItemResult = await this.getById(id);

        if (isFailure(existingItemResult)) {
          throw existingItemResult.error;
        }

        const existingItem = existingItemResult.data;

        let websiteItem: IWebsiteItem;

        if (existingItem?.userEdited) {
          // Only overwrite title, description, ogImage
          websiteItem = {
            ...existingItem,
            title: website.title || '',
            description: website.description,
            rawUrl: website.url,
            ogImage: website.ogImage,
          };
          if (tag) {
            websiteItem = { ...websiteItem, tags: `${websiteItem.tags} ${tag}` };
          }
        } else {
          const cleanDescription = cleanText(website.description || '');
          const cleanTitle = cleanText(website.title || '');
          let tags = uniq(cleanTitle.concat(cleanDescription)).join(' ');

          if (tag) {
            tags = `${tags} ${tag}`;
          }

          websiteItem = {
            id,
            title: website.title || '',
            description: website.description,
            rawUrl: website.url,
            domain: website.domain,
            tags,
            ogImage: website.ogImage,
          };
        }
        const addResult = await this.add(websiteItem);
        if (isFailure(addResult)) {
          throw addResult.error;
        }

        this.recordQueryTime(performance.now() - startTime);
        return websiteItem;
      } catch (error) {
        this.performanceMetrics.errorCount++;
        throw error;
      }
    }, `trackVisit-${this.storeName}`);
  }

  /**
   * Enhanced tag update with better error handling
   */
  async updateTags(
    websiteId: string,
    tags: string,
  ): Promise<StoreResult<IWebsiteItem | undefined>> {
    return safeOperation(async () => {
      const startTime = performance.now();

      try {
        const existingItemResult = await this.getById(websiteId);

        if (isFailure(existingItemResult)) {
          throw existingItemResult.error;
        }

        const existingItem = existingItemResult.data;
        if (!existingItem) {
          return undefined;
        }

        const updatedItem = { ...existingItem, tags, userEdited: true };
        const updateResult = await this.update(websiteId, { tags, userEdited: true });

        if (isFailure(updateResult)) {
          throw updateResult.error;
        }

        this.recordQueryTime(performance.now() - startTime);
        return updatedItem;
      } catch (error) {
        this.performanceMetrics.errorCount++;
        throw error;
      }
    }, `updateTags-${this.storeName}`);
  }

  /**
   * Enhanced order saving with bulk operations
   */
  async saveOrder(
    websiteItems: IFeaturedWebsite[],
  ): Promise<StoreResult<(IWebsiteItem | undefined)[]>> {
    return safeOperation(async () => {
      const startTime = performance.now();

      try {
        const updates: Promise<IWebsiteItem | undefined>[] = websiteItems.map(
          async (featuredWebsite, index) => {
            const existingItemResult = await this.getById(featuredWebsite.id);

            if (!existingItemResult.success || !existingItemResult.data) {
              return undefined;
            }

            const existingItem = existingItemResult.data;
            const updatedItem = { ...existingItem, index, userEdited: true };

            const updateResult = await this.update(featuredWebsite.id, { index, userEdited: true });
            if (isFailure(updateResult)) {
              throw updateResult.error;
            }

            return updatedItem;
          },
        );

        const results = await Promise.all(updates);
        this.recordQueryTime(performance.now() - startTime);
        return results;
      } catch (error) {
        this.performanceMetrics.errorCount++;
        throw error;
      }
    }, `saveOrder-${this.storeName}`);
  }

  /**
   * Enhanced move to front with better error handling
   */
  async moveToFront(websiteId: string): Promise<StoreResult<IWebsiteItem | undefined>> {
    return safeOperation(async () => {
      const startTime = performance.now();

      try {
        const existingItemResult = await this.getById(websiteId);

        if (isFailure(existingItemResult)) {
          throw existingItemResult.error;
        }

        const existingItem = existingItemResult.data;
        if (!existingItem) {
          return undefined;
        }

        const updatedItem = { ...existingItem, index: 0, userEdited: true };
        const updateResult = await this.update(websiteId, { index: 0, userEdited: true });

        if (isFailure(updateResult)) {
          throw updateResult.error;
        }

        this.recordQueryTime(performance.now() - startTime);
        return updatedItem;
      } catch (error) {
        this.performanceMetrics.errorCount++;
        throw error;
      }
    }, `moveToFront-${this.storeName}`);
  }

  /**
   * Track visit from Chrome tab with enhanced error handling
   */
  async trackVisitFromTab(tab: chrome.tabs.Tab, tag: string): Promise<StoreResult<IWebsiteItem>> {
    return safeOperation(async () => {
      if (!tab.url) {
        throw new Error('Tab URL is required');
      }

      const urlFormat = new URL(tab.url);
      const websiteData: IWebsiteItemNotFormatted = {
        domain: urlFormat.host,
        pathname: urlFormat.pathname,
        url: tab.url,
        title: tab.title,
      };

      const result = await this.trackVisit(websiteData, tag);
      if (isFailure(result)) {
        throw result.error;
      }

      return result.data;
    }, `trackVisitFromTab-${this.storeName}`);
  }
}
