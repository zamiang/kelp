import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BaseStoreImpl } from '../../extension/src/components/store/models/base-store';
import { StoreError } from '../../extension/src/components/store/utils/error-handler';

// Create a concrete implementation for testing
class TestStore extends BaseStoreImpl<{ id: string; name: string; createdAt: Date }> {
  constructor(db: any) {
    super(db, 'testStore');
  }

  protected isValidSortField(field: string): boolean {
    return ['id', 'name', 'createdAt'].includes(field);
  }
}

describe('BaseStoreImpl', () => {
  let mockDb: any;
  let store: TestStore;
  let mockTransaction: any;
  let mockObjectStore: any;

  const sampleData = [
    { id: '1', name: 'Item 1', createdAt: new Date('2023-01-01') },
    { id: '2', name: 'Item 2', createdAt: new Date('2023-01-02') },
    { id: '3', name: 'Item 3', createdAt: new Date('2023-01-03') },
  ];

  beforeEach(() => {
    mockObjectStore = {
      put: vi.fn().mockResolvedValue(undefined),
      get: vi.fn().mockResolvedValue(sampleData[0]),
      delete: vi.fn().mockResolvedValue(undefined),
      getAllFromIndex: vi.fn().mockResolvedValue(sampleData),
    };

    mockTransaction = {
      store: mockObjectStore,
      done: Promise.resolve(),
    };

    mockDb = {
      getAll: vi.fn().mockResolvedValue(sampleData),
      get: vi.fn().mockResolvedValue(sampleData[0]),
      put: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
      getAllFromIndex: vi.fn().mockResolvedValue(sampleData),
      transaction: vi.fn().mockReturnValue(mockTransaction),
    };

    store = new TestStore(mockDb);
  });

  describe('getAll', () => {
    it('should return all items with default pagination', async () => {
      const result = await store.getAll();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.data).toEqual(sampleData);
        expect(result.data.total).toBe(3);
        expect(result.data.hasMore).toBe(false);
        expect(result.data.nextOffset).toBeUndefined();
      }
    });

    it('should apply pagination correctly', async () => {
      const result = await store.getAll({ limit: 2, offset: 1 });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.data).toEqual([sampleData[1], sampleData[2]]);
        expect(result.data.total).toBe(3);
        expect(result.data.hasMore).toBe(false);
        expect(result.data.nextOffset).toBeUndefined();
      }
    });

    it('should indicate hasMore when there are more items', async () => {
      const result = await store.getAll({ limit: 2, offset: 0 });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.data).toEqual([sampleData[0], sampleData[1]]);
        expect(result.data.total).toBe(3);
        expect(result.data.hasMore).toBe(true);
        expect(result.data.nextOffset).toBe(2);
      }
    });

    it('should sort items when orderBy is specified', async () => {
      const result = await store.getAll({ orderBy: 'name', orderDirection: 'desc' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.data[0].name).toBe('Item 3');
        expect(result.data.data[1].name).toBe('Item 2');
        expect(result.data.data[2].name).toBe('Item 1');
      }
    });

    it('should ignore invalid sort fields', async () => {
      const result = await store.getAll({ orderBy: 'invalidField' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.data).toEqual(sampleData);
      }
    });

    it('should handle database errors', async () => {
      mockDb.getAll.mockRejectedValue(new Error('Database error'));

      const result = await store.getAll();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(StoreError);
      }
    });
  });

  describe('getById', () => {
    it('should return item by id', async () => {
      const result = await store.getById('1');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(sampleData[0]);
      }
      expect(mockDb.get).toHaveBeenCalledWith('testStore', '1');
    });

    it('should return undefined for non-existent item', async () => {
      mockDb.get.mockResolvedValue(undefined);

      const result = await store.getById('999');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeUndefined();
      }
    });

    it('should handle database errors', async () => {
      mockDb.get.mockRejectedValue(new Error('Database error'));

      const result = await store.getById('1');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(StoreError);
      }
    });
  });

  describe('add', () => {
    it('should add new item', async () => {
      const newItem = { id: '4', name: 'Item 4', createdAt: new Date() };

      const result = await store.add(newItem);

      expect(result.success).toBe(true);
      expect(mockDb.put).toHaveBeenCalledWith('testStore', newItem);
    });

    it('should handle database errors', async () => {
      mockDb.put.mockRejectedValue(new Error('Database error'));
      const newItem = { id: '4', name: 'Item 4', createdAt: new Date() };

      const result = await store.add(newItem);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(StoreError);
      }
    });
  });

  describe('update', () => {
    it('should update existing item', async () => {
      const updates = { name: 'Updated Item 1' };

      const result = await store.update('1', updates);

      expect(result.success).toBe(true);
      expect(mockDb.get).toHaveBeenCalledWith('testStore', '1');
      expect(mockDb.put).toHaveBeenCalledWith('testStore', {
        ...sampleData[0],
        ...updates,
      });
    });

    it('should throw error for non-existent item', async () => {
      mockDb.get.mockResolvedValue(undefined);

      const result = await store.update('999', { name: 'Updated' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(StoreError);
        expect(result.error.code).toBe('ITEM_NOT_FOUND');
        expect(result.error.retryable).toBe(false);
      }
    });

    it('should handle database errors', async () => {
      mockDb.get.mockRejectedValue(new Error('Database error'));

      const result = await store.update('1', { name: 'Updated' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(StoreError);
      }
    });
  });

  describe('delete', () => {
    it('should delete item by id', async () => {
      const result = await store.delete('1');

      expect(result.success).toBe(true);
      expect(mockDb.delete).toHaveBeenCalledWith('testStore', '1');
    });

    it('should handle database errors', async () => {
      mockDb.delete.mockRejectedValue(new Error('Database error'));

      const result = await store.delete('1');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(StoreError);
      }
    });
  });

  describe('addBulk', () => {
    it('should add multiple items in transaction', async () => {
      const newItems = [
        { id: '4', name: 'Item 4', createdAt: new Date() },
        { id: '5', name: 'Item 5', createdAt: new Date() },
      ];

      const result = await store.addBulk(newItems);

      expect(result.success).toBe(true);
      expect(mockDb.transaction).toHaveBeenCalledWith('testStore', 'readwrite');
      expect(mockObjectStore.put).toHaveBeenCalledTimes(2);
      expect(mockObjectStore.put).toHaveBeenCalledWith(newItems[0]);
      expect(mockObjectStore.put).toHaveBeenCalledWith(newItems[1]);
    });

    it('should handle transaction errors', async () => {
      mockObjectStore.put.mockRejectedValue(new Error('Transaction error'));
      const newItems = [{ id: '4', name: 'Item 4', createdAt: new Date() }];

      const result = await store.addBulk(newItems);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(StoreError);
      }
    });
  });

  describe('cleanup', () => {
    it('should execute default cleanup implementation', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const result = await store.cleanup();

      expect(result.success).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith('No cleanup implementation for testStore');

      consoleSpy.mockRestore();
    });
  });

  describe('getHealth', () => {
    it('should return healthy status with no issues', async () => {
      const health = await store.getHealth();

      expect(health.isHealthy).toBe(true);
      expect(health.issues).toHaveLength(0);
      expect(health.performance.avgQueryTime).toBe(0);
      expect(health.performance.slowQueries).toBe(0);
      expect(health.lastChecked).toBeInstanceOf(Date);
    });

    it('should detect high average query time', async () => {
      // Simulate some slow queries
      store['performanceMetrics'].queryTimes = [600, 700, 800];

      const health = await store.getHealth();

      expect(health.isHealthy).toBe(false);
      expect(health.issues).toContain('Average query time is high: 700.00ms');
      expect(health.performance.avgQueryTime).toBe(700);
    });

    it('should detect high error count', async () => {
      store['performanceMetrics'].errorCount = 15;

      const health = await store.getHealth();

      expect(health.isHealthy).toBe(false);
      expect(health.issues).toContain('High error count: 15');
    });

    it('should detect multiple slow queries', async () => {
      store['performanceMetrics'].queryTimes = [1100, 1200, 1300, 1400, 1500, 1600];

      const health = await store.getHealth();

      expect(health.isHealthy).toBe(false);
      expect(health.issues).toContain('Multiple slow queries detected: 6');
      expect(health.performance.slowQueries).toBe(6);
    });
  });

  describe('performance tracking', () => {
    it('should record query times', async () => {
      await store.getAll();
      await store.getById('1');

      expect(store['performanceMetrics'].queryTimes.length).toBe(2);
      expect(store['performanceMetrics'].queryTimes[0]).toBeGreaterThan(0);
      expect(store['performanceMetrics'].queryTimes[1]).toBeGreaterThan(0);
    });

    it('should limit query time history to 100 entries', async () => {
      // Fill with 150 entries
      for (let i = 0; i < 150; i++) {
        store['performanceMetrics'].queryTimes.push(i);
      }

      // Trigger recordQueryTime
      await store.getAll();

      expect(store['performanceMetrics'].queryTimes.length).toBe(100);
    });

    it('should increment error count on failures', async () => {
      mockDb.getAll.mockRejectedValue(new Error('Database error'));

      await store.getAll();

      expect(store['performanceMetrics'].errorCount).toBe(1);
    });
  });

  describe('getByIndex', () => {
    it('should get items by index', async () => {
      const result = await store['getByIndex']('by-name', 'Item 1');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(sampleData);
      }
      expect(mockDb.getAllFromIndex).toHaveBeenCalledWith('testStore', 'by-name', 'Item 1');
    });

    it('should handle index query errors', async () => {
      mockDb.getAllFromIndex.mockRejectedValue(new Error('Index error'));

      const result = await store['getByIndex']('by-name', 'Item 1');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(StoreError);
      }
    });
  });

  describe('retry behavior', () => {
    it('should retry failed operations', async () => {
      mockDb.getAll
        .mockRejectedValueOnce(new Error('Temporary failure'))
        .mockResolvedValue(sampleData);

      const result = await store.getAll();

      expect(result.success).toBe(true);
      expect(mockDb.getAll).toHaveBeenCalledTimes(2);
    });

    it('should not retry non-retryable errors', async () => {
      const nonRetryableError = new StoreError('Non-retryable', { retryable: false });
      mockDb.getAll.mockRejectedValue(nonRetryableError);

      const result = await store.getAll();

      expect(result.success).toBe(false);
      expect(mockDb.getAll).toHaveBeenCalledTimes(1);
    });
  });
});
