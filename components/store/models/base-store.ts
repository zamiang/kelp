import { StoreError, safeOperation, withRetry } from '../utils/error-handler';
import {
  BaseStore,
  PaginatedResult,
  QueryOptions,
  StoreHealth,
  StoreResult,
} from '../types/store-types';
import { dbType } from '../db';

/**
 * Base store class that provides common functionality for all data stores
 * Implements enhanced error handling, pagination, and health monitoring
 */
export abstract class BaseStoreImpl<T extends { id: string }> implements BaseStore<T> {
  protected db: dbType;
  protected storeName: string;
  protected performanceMetrics: {
    queryTimes: number[];
    errorCount: number;
    lastHealthCheck?: Date;
  } = {
    queryTimes: [],
    errorCount: 0,
  };

  constructor(db: dbType, storeName: string) {
    this.db = db;
    this.storeName = storeName;
  }

  /**
   * Get all items with optional pagination and sorting
   */
  async getAll(options: QueryOptions = {}): Promise<StoreResult<PaginatedResult<T>>> {
    return safeOperation(async () => {
      const startTime = performance.now();

      try {
        const { limit = 10000, offset = 0, orderBy, orderDirection = 'asc' } = options;

        // Get all items from the store
        const allItems = await withRetry(
          () => this.db.getAll(this.storeName as any),
          { maxAttempts: 2 },
          `getAll-${this.storeName}`,
        );

        // Apply sorting if specified
        let sortedItems = allItems;
        if (orderBy && this.isValidSortField(orderBy)) {
          sortedItems = allItems.sort((a, b) => {
            const aValue = (a as any)[orderBy];
            const bValue = (b as any)[orderBy];

            if (aValue < bValue) return orderDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return orderDirection === 'asc' ? 1 : -1;
            return 0;
          });
        }

        // Apply pagination
        const paginatedItems = sortedItems.slice(offset, offset + limit);
        const hasMore = offset + limit < sortedItems.length;

        const result: PaginatedResult<T> = {
          data: paginatedItems,
          total: sortedItems.length,
          hasMore,
          nextOffset: hasMore ? offset + limit : undefined,
        };

        this.recordQueryTime(performance.now() - startTime);
        return result;
      } catch (error) {
        this.performanceMetrics.errorCount++;
        throw error;
      }
    }, `getAll-${this.storeName}`);
  }

  /**
   * Get item by ID
   */
  async getById(id: string): Promise<StoreResult<T | undefined>> {
    return safeOperation(async () => {
      const startTime = performance.now();

      try {
        const item = await withRetry(
          () => this.db.get(this.storeName as any, id),
          { maxAttempts: 2 },
          `getById-${this.storeName}`,
        );

        this.recordQueryTime(performance.now() - startTime);
        return item;
      } catch (error) {
        this.performanceMetrics.errorCount++;
        throw error;
      }
    }, `getById-${this.storeName}`);
  }

  /**
   * Add new item
   */
  async add(item: T): Promise<StoreResult<void>> {
    return safeOperation(async () => {
      const startTime = performance.now();

      try {
        await withRetry(
          () => this.db.put(this.storeName as any, item),
          { maxAttempts: 2 },
          `add-${this.storeName}`,
        );

        this.recordQueryTime(performance.now() - startTime);
      } catch (error) {
        this.performanceMetrics.errorCount++;
        throw error;
      }
    }, `add-${this.storeName}`);
  }

  /**
   * Update existing item
   */
  async update(id: string, updates: Partial<T>): Promise<StoreResult<void>> {
    return safeOperation(async () => {
      const startTime = performance.now();

      try {
        // Get existing item
        const existingItem = await this.db.get(this.storeName as any, id);
        if (!existingItem) {
          throw new StoreError(`Item not found: ${id}`, {
            code: 'ITEM_NOT_FOUND',
            severity: 'medium',
            context: { id, storeName: this.storeName },
            retryable: false,
          });
        }

        // Merge updates
        const updatedItem = { ...existingItem, ...updates };

        await withRetry(
          () => this.db.put(this.storeName as any, updatedItem),
          { maxAttempts: 2 },
          `update-${this.storeName}`,
        );

        this.recordQueryTime(performance.now() - startTime);
      } catch (error) {
        this.performanceMetrics.errorCount++;
        throw error;
      }
    }, `update-${this.storeName}`);
  }

  /**
   * Delete item by ID
   */
  async delete(id: string): Promise<StoreResult<void>> {
    return safeOperation(async () => {
      const startTime = performance.now();

      try {
        await withRetry(
          () => this.db.delete(this.storeName as any, id),
          { maxAttempts: 2 },
          `delete-${this.storeName}`,
        );

        this.recordQueryTime(performance.now() - startTime);
      } catch (error) {
        this.performanceMetrics.errorCount++;
        throw error;
      }
    }, `delete-${this.storeName}`);
  }

  /**
   * Bulk operations for better performance
   */
  async addBulk(items: T[]): Promise<StoreResult<void>> {
    return safeOperation(async () => {
      const startTime = performance.now();

      try {
        const tx = this.db.transaction(this.storeName as any, 'readwrite');

        await Promise.all([...items.map((item) => tx.store.put(item)), tx.done]);

        this.recordQueryTime(performance.now() - startTime);
      } catch (error) {
        this.performanceMetrics.errorCount++;
        throw error;
      }
    }, `addBulk-${this.storeName}`);
  }

  /**
   * Clean up old or invalid data
   */
  async cleanup(): Promise<StoreResult<void>> {
    return safeOperation(async () => {
      // Default implementation - can be overridden by subclasses
      console.log(`No cleanup implementation for ${this.storeName}`);
    }, `cleanup-${this.storeName}`);
  }

  /**
   * Get store health metrics
   */
  async getHealth(): Promise<StoreHealth> {
    const now = new Date();
    const avgQueryTime =
      this.performanceMetrics.queryTimes.length > 0
        ? this.performanceMetrics.queryTimes.reduce((a, b) => a + b, 0) /
          this.performanceMetrics.queryTimes.length
        : 0;

    const slowQueries = this.performanceMetrics.queryTimes.filter((time) => time > 1000).length;
    const issues: string[] = [];

    if (avgQueryTime > 500) {
      issues.push(`Average query time is high: ${avgQueryTime.toFixed(2)}ms`);
    }

    if (this.performanceMetrics.errorCount > 10) {
      issues.push(`High error count: ${this.performanceMetrics.errorCount}`);
    }

    if (slowQueries > 5) {
      issues.push(`Multiple slow queries detected: ${slowQueries}`);
    }

    this.performanceMetrics.lastHealthCheck = now;

    return {
      isHealthy: issues.length === 0,
      lastChecked: now,
      issues,
      performance: {
        avgQueryTime,
        slowQueries,
      },
    };
  }

  /**
   * Record query performance metrics
   */
  protected recordQueryTime(time: number): void {
    this.performanceMetrics.queryTimes.push(time);

    // Keep only the last 100 query times to prevent memory bloat
    if (this.performanceMetrics.queryTimes.length > 100) {
      this.performanceMetrics.queryTimes = this.performanceMetrics.queryTimes.slice(-100);
    }
  }

  /**
   * Check if a field is valid for sorting - should be overridden by subclasses
   */
  protected isValidSortField(field: string): boolean {
    return ['id'].includes(field);
  }

  /**
   * Get items by index with enhanced error handling
   */
  protected async getByIndex<K>(indexName: string, key: K): Promise<StoreResult<T[]>> {
    return safeOperation(async () => {
      const startTime = performance.now();

      try {
        const items = await withRetry(
          () => this.db.getAllFromIndex(this.storeName as any, indexName as any, key as any),
          { maxAttempts: 2 },
          `getByIndex-${this.storeName}-${indexName}`,
        );

        this.recordQueryTime(performance.now() - startTime);
        return items;
      } catch (error) {
        this.performanceMetrics.errorCount++;
        throw error;
      }
    }, `getByIndex-${this.storeName}-${indexName}`);
  }
}
