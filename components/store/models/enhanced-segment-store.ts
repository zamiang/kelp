import { addMinutes, format, getDate, getWeek, isSameDay, subMinutes } from 'date-fns';
import { first, flatten, groupBy } from 'lodash';
import config from '../../../constants/config';
import ErrorTracking from '../../error-tracking/error-tracking';
import { ISegment } from '../data-types';
import { dbType } from '../db';
import { BaseStoreImpl } from './base-store';
import { PaginatedResult, QueryOptions, StoreResult } from '../types/store-types';
import { safeOperation, withRetry } from '../utils/error-handler';

/**
 * Type guard to check if a StoreResult is a failure
 */
function isFailure<T>(result: StoreResult<T>): result is { success: false; error: any } {
  return !result.success;
}

/**
 * Enhanced SegmentStore that extends BaseStoreImpl
 * Provides pagination, error handling, performance monitoring, and bulk operations
 */
export default class EnhancedSegmentStore extends BaseStoreImpl<ISegment> {
  constructor(db: dbType) {
    super(db, 'meeting');
  }

  /**
   * Override to specify valid sort fields for segments
   */
  protected isValidSortField(field: string): boolean {
    return ['id', 'summary', 'start', 'end', 'selfResponseStatus'].includes(field);
  }

  /**
   * Enhanced segment addition with bulk operations and better error handling
   */
  async addSegments(segments: ISegment[], shouldClearStore?: boolean): Promise<StoreResult<void>> {
    return safeOperation(async () => {
      const startTime = performance.now();

      try {
        if (shouldClearStore) {
          const existingSegmentsResult = await this.getAll();
          if (isFailure(existingSegmentsResult)) {
            throw existingSegmentsResult.error;
          }

          const existingSegments = existingSegmentsResult.data.data;
          const existingSegmentIds = existingSegments.map((s) => s.id);
          const newSegmentIds = segments.map((s) => s.id);
          const idsToDelete = existingSegmentIds.filter(
            (existingSegmentId) => !newSegmentIds.includes(existingSegmentId),
          );

          if (idsToDelete.length > 0) {
            const deleteResult = await this.deleteBulk(idsToDelete);
            if (isFailure(deleteResult)) {
              throw deleteResult.error;
            }
          }
        }

        // Use bulk operation for better performance
        const addResult = await this.addBulk(segments);
        if (isFailure(addResult)) {
          throw addResult.error;
        }

        this.recordQueryTime(performance.now() - startTime);
        console.log(`Added ${segments.length} segments to store`);
      } catch (error) {
        this.performanceMetrics.errorCount++;
        throw error;
      }
    }, `addSegments-${this.storeName}`);
  }

  /**
   * Enhanced cleanup with better error handling and performance tracking
   */
  async cleanup(): Promise<StoreResult<void>> {
    return safeOperation(async () => {
      const startTime = performance.now();

      try {
        const segmentsResult = await this.getAll();
        if (isFailure(segmentsResult)) {
          throw segmentsResult.error;
        }

        const segments = segmentsResult.data.data;
        const segmentsToDelete = segments.filter((a) => a.end < config.startDate);

        if (segmentsToDelete.length > 0) {
          const deleteResult = await this.deleteBulk(segmentsToDelete.map((item) => item.id));
          if (isFailure(deleteResult)) {
            throw deleteResult.error;
          }
        }

        this.recordQueryTime(performance.now() - startTime);
        console.log(`Cleaned up ${segmentsToDelete.length} old segments`);
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
   * Get segments with enhanced sorting and optional pagination
   */
  async getSegments(
    order: 'asc' | 'desc' = 'asc',
    options: QueryOptions = {},
  ): Promise<StoreResult<PaginatedResult<ISegment>>> {
    return safeOperation(async () => {
      const startTime = performance.now();

      try {
        const queryOptions: QueryOptions = {
          ...options,
          orderBy: 'start',
          orderDirection: order,
        };

        const result = await this.getAll(queryOptions);
        if (isFailure(result)) {
          throw result.error;
        }

        this.recordQueryTime(performance.now() - startTime);
        return result.data;
      } catch (error) {
        this.performanceMetrics.errorCount++;
        throw error;
      }
    }, `getSegments-${this.storeName}`);
  }

  /**
   * Enhanced up next segment detection with better error handling
   */
  async getUpNextSegment(): Promise<StoreResult<ISegment | undefined>> {
    return safeOperation(async () => {
      const startTime = performance.now();

      try {
        const segmentsResult = await this.getAll();
        if (isFailure(segmentsResult)) {
          throw segmentsResult.error;
        }

        const segments = segmentsResult.data.data;
        const start = subMinutes(new Date(), config.MEETING_PREP_NOTIFICATION_EARLY_MINUTES);

        const upNextSegment = first(
          segments.filter((segment) => {
            const isUpNext =
              start < segment.start &&
              new Date() >
                subMinutes(segment.start, config.MEETING_PREP_NOTIFICATION_EARLY_MINUTES);
            return segment.selfResponseStatus !== 'notAttending' && isUpNext;
          }),
        );

        this.recordQueryTime(performance.now() - startTime);
        return upNextSegment;
      } catch (error) {
        this.performanceMetrics.errorCount++;
        throw error;
      }
    }, `getUpNextSegment-${this.storeName}`);
  }

  /**
   * Enhanced current segment detection with better error handling
   */
  async getCurrentSegment(): Promise<StoreResult<ISegment | undefined>> {
    return safeOperation(async () => {
      const startTime = performance.now();

      try {
        const segmentsResult = await this.getAll();
        if (isFailure(segmentsResult)) {
          throw segmentsResult.error;
        }

        const segments = segmentsResult.data.data;
        const start = subMinutes(new Date(), config.MEETING_PREP_NOTIFICATION_EARLY_MINUTES);
        const end = addMinutes(new Date(), 30 + config.MEETING_PREP_NOTIFICATION_EARLY_MINUTES);

        const currentSegment = first(
          segments.filter((segment) => {
            const isUpNext = segment.start > start && segment.start < end;
            const isCurrent = start > segment.start && start < segment.end;
            return segment.selfResponseStatus !== 'notAttending' && (isUpNext || isCurrent);
          }),
        );

        this.recordQueryTime(performance.now() - startTime);
        return currentSegment;
      } catch (error) {
        this.performanceMetrics.errorCount++;
        throw error;
      }
    }, `getCurrentSegment-${this.storeName}`);
  }

  /**
   * Enhanced current segment detection for websites with better error handling
   */
  async getCurrentSegmentForWebsites(start: Date): Promise<StoreResult<ISegment | undefined>> {
    return safeOperation(async () => {
      const startTime = performance.now();

      try {
        const segmentsResult = await this.getAll();
        if (isFailure(segmentsResult)) {
          throw segmentsResult.error;
        }

        const segments = segmentsResult.data.data;
        const currentSegment = first(
          segments.filter((segment) => {
            const isCurrent = start > segment.start && start < segment.end;
            return segment.selfResponseStatus !== 'notAttending' && isCurrent;
          }),
        );

        this.recordQueryTime(performance.now() - startTime);
        return currentSegment;
      } catch (error) {
        this.performanceMetrics.errorCount++;
        throw error;
      }
    }, `getCurrentSegmentForWebsites-${this.storeName}`);
  }

  /**
   * Enhanced segments by day with optional pagination
   */
  async getSegmentsByDay(
    start: Date,
    options: QueryOptions = {},
  ): Promise<StoreResult<{ [key: string]: ISegment[] }>> {
    return safeOperation(async () => {
      const startTime = performance.now();

      try {
        const segmentsResult = await this.getAll(options);
        if (isFailure(segmentsResult)) {
          throw segmentsResult.error;
        }

        const segments = segmentsResult.data.data;
        const filteredSegments = segments.filter((s) => s.start > start);

        const groupedSegments = groupBy(
          filteredSegments.sort((a, b) => (new Date(a.start) > new Date(b.start) ? 1 : -1)),
          (segment) => format(segment.start, 'EEEE, MMM d yyyy'),
        );

        this.recordQueryTime(performance.now() - startTime);
        return groupedSegments;
      } catch (error) {
        this.performanceMetrics.errorCount++;
        throw error;
      }
    }, `getSegmentsByDay-${this.storeName}`);
  }

  /**
   * Enhanced segments for specific day with better error handling
   */
  async getSegmentsForDay(day: Date): Promise<StoreResult<ISegment[]>> {
    return safeOperation(async () => {
      const startTime = performance.now();

      try {
        const segmentsResult = await this.getAll();
        if (isFailure(segmentsResult)) {
          throw segmentsResult.error;
        }

        const segments = segmentsResult.data.data;
        const daySegments = segments.filter((segment) => isSameDay(segment.start, day));

        this.recordQueryTime(performance.now() - startTime);
        return daySegments;
      } catch (error) {
        this.performanceMetrics.errorCount++;
        throw error;
      }
    }, `getSegmentsForDay-${this.storeName}`);
  }

  /**
   * Enhanced segments for specific week with better error handling
   */
  async getSegmentsForWeek(week: number): Promise<StoreResult<ISegment[]>> {
    return safeOperation(async () => {
      const startTime = performance.now();

      try {
        const segmentsResult = await this.getAll();
        if (isFailure(segmentsResult)) {
          throw segmentsResult.error;
        }

        const segments = segmentsResult.data.data;
        const weekSegments = segments.filter((segment) => getWeek(segment.start) === week);

        this.recordQueryTime(performance.now() - startTime);
        return weekSegments;
      } catch (error) {
        this.performanceMetrics.errorCount++;
        throw error;
      }
    }, `getSegmentsForWeek-${this.storeName}`);
  }

  /**
   * Enhanced document IDs retrieval for day with better error handling
   */
  async getListedDocumentIdsForDay(date: Date): Promise<StoreResult<string[]>> {
    return safeOperation(async () => {
      const startTime = performance.now();

      try {
        const segmentsResult = await this.getAll();
        if (isFailure(segmentsResult)) {
          throw segmentsResult.error;
        }

        const segments = segmentsResult.data.data;
        const documentIds = flatten(
          segments
            .filter((segment) => isSameDay(segment.start, date))
            .map((segment) => segment.documentIdsFromDescription),
        );

        this.recordQueryTime(performance.now() - startTime);
        return documentIds;
      } catch (error) {
        this.performanceMetrics.errorCount++;
        throw error;
      }
    }, `getListedDocumentIdsForDay-${this.storeName}`);
  }

  /**
   * Enhanced segments by name with better error handling
   */
  async getSegmentsForName(summary: string): Promise<StoreResult<ISegment[]>> {
    return safeOperation(async () => {
      const startTime = performance.now();

      try {
        const segmentsResult = await this.getAll();
        if (isFailure(segmentsResult)) {
          throw segmentsResult.error;
        }

        const segments = segmentsResult.data.data;
        const namedSegments = segments.filter((segment) => segment.summary === summary);

        this.recordQueryTime(performance.now() - startTime);
        return namedSegments;
      } catch (error) {
        this.performanceMetrics.errorCount++;
        throw error;
      }
    }, `getSegmentsForName-${this.storeName}`);
  }

  /**
   * Enhanced segments by email with better error handling and index usage
   */
  async getSegmentsForEmail(email: string): Promise<StoreResult<(ISegment | undefined)[]>> {
    return safeOperation(async () => {
      const startTime = performance.now();

      try {
        const attendees = await withRetry(
          () => this.db.getAllFromIndex('attendee', 'by-email', email),
          { maxAttempts: 2 },
          `getSegmentsForEmail-getAttendees-${this.storeName}`,
        );

        const segmentPromises = attendees.map(async (attendee) => {
          const segmentResult = await this.getById(attendee.segmentId);
          return isFailure(segmentResult) ? undefined : segmentResult.data;
        });

        const segments = await Promise.all(segmentPromises);

        this.recordQueryTime(performance.now() - startTime);
        return segments;
      } catch (error) {
        this.performanceMetrics.errorCount++;
        throw error;
      }
    }, `getSegmentsForEmail-${this.storeName}`);
  }

  /**
   * Enhanced drive activity IDs for week with better error handling
   */
  async getDriveActivityIdsForWeek(week: number): Promise<StoreResult<string[]>> {
    return safeOperation(async () => {
      const startTime = performance.now();

      try {
        const segmentsResult = await this.getAll();
        if (isFailure(segmentsResult)) {
          throw segmentsResult.error;
        }

        const segments = segmentsResult.data.data;
        const driveActivityIds = flatten(
          segments.filter((segment) => getWeek(segment.start) === week).map((): string[] => []),
        );

        this.recordQueryTime(performance.now() - startTime);
        return driveActivityIds;
      } catch (error) {
        this.performanceMetrics.errorCount++;
        throw error;
      }
    }, `getDriveActivityIdsForWeek-${this.storeName}`);
  }

  /**
   * Enhanced drive activity IDs for date with better error handling
   */
  async getDriveActivityIdsForDate(date: number): Promise<StoreResult<string[]>> {
    return safeOperation(async () => {
      const startTime = performance.now();

      try {
        const segmentsResult = await this.getAll();
        if (isFailure(segmentsResult)) {
          throw segmentsResult.error;
        }

        const segments = segmentsResult.data.data;
        const driveActivityIds = flatten(
          segments.filter((segment) => getDate(segment.start) === date).map((): string[] => []),
        );

        this.recordQueryTime(performance.now() - startTime);
        return driveActivityIds;
      } catch (error) {
        this.performanceMetrics.errorCount++;
        throw error;
      }
    }, `getDriveActivityIdsForDate-${this.storeName}`);
  }

  // Legacy compatibility methods - these maintain the old interface for backward compatibility

  /**
   * Legacy method - returns raw data for backward compatibility
   * @deprecated Use the enhanced methods that return StoreResult<T> instead
   */
  async getAll_legacy(): Promise<ISegment[]> {
    try {
      const result = await this.getAll();
      return isFailure(result) ? [] : result.data.data;
    } catch (error) {
      ErrorTracking.logError(error as Error);
      return [];
    }
  }

  /**
   * Legacy method - returns raw data for backward compatibility
   * @deprecated Use the enhanced getById method that returns StoreResult<T> instead
   */
  async getById_legacy(id: string): Promise<ISegment | undefined> {
    try {
      const result = await this.getById(id);
      return isFailure(result) ? undefined : result.data;
    } catch (error) {
      ErrorTracking.logError(error as Error);
      return undefined;
    }
  }
}
