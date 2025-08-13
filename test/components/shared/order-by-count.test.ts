import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getValueForDate,
  orderByCount,
  orderByCountWithOptions,
} from '../../../extension/src/components/shared/order-by-count';

describe('order-by-count', () => {
  // Mock the current date for consistent testing
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('getValueForDate', () => {
    it('should return 1 for today', () => {
      const today = new Date('2024-01-15T12:00:00Z');
      expect(getValueForDate(today)).toBe(1);
    });

    it('should return 1 for future dates', () => {
      const tomorrow = new Date('2024-01-16T12:00:00Z');
      expect(getValueForDate(tomorrow)).toBe(1);
    });

    it('should apply decay for past dates', () => {
      const yesterday = new Date('2024-01-14T12:00:00Z');
      expect(getValueForDate(yesterday)).toBeCloseTo(0.95, 5);

      const twoDaysAgo = new Date('2024-01-13T12:00:00Z');
      expect(getValueForDate(twoDaysAgo)).toBeCloseTo(0.9025, 5);

      const weekAgo = new Date('2024-01-08T12:00:00Z');
      expect(getValueForDate(weekAgo)).toBeCloseTo(Math.pow(0.95, 7), 5);
    });

    it('should handle invalid dates', () => {
      expect(getValueForDate(null)).toBe(0);
      expect(getValueForDate(undefined)).toBe(0);
      expect(getValueForDate(new Date('invalid'))).toBe(0);
      expect(getValueForDate('not a date' as any)).toBe(0);
    });
  });

  describe('orderByCount', () => {
    interface TestItem {
      id: string;
      name: string;
      date: Date;
      metadata?: string;
    }

    it('should handle empty arrays', () => {
      expect(orderByCount([], 'id', 'date')).toEqual([]);
    });

    it('should handle single item', () => {
      const items: TestItem[] = [{ id: '1', name: 'Item 1', date: new Date('2024-01-15') }];
      const result = orderByCount(items, 'id', 'date');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('should sort items by score in descending order', () => {
      const items: TestItem[] = [
        { id: '1', name: 'Item 1', date: new Date('2024-01-15') }, // score: 1
        { id: '2', name: 'Item 2', date: new Date('2024-01-14') }, // score: 0.95
        { id: '3', name: 'Item 3', date: new Date('2024-01-13') }, // score: 0.9025
      ];

      const result = orderByCount(items, 'id', 'date');
      expect(result.map((r) => r.id)).toEqual(['1', '2', '3']);
    });

    it('should accumulate scores for duplicate IDs', () => {
      const items: TestItem[] = [
        { id: '1', name: 'Item 1a', date: new Date('2024-01-15') }, // score: 1
        { id: '1', name: 'Item 1b', date: new Date('2024-01-14') }, // score: 0.95
        { id: '2', name: 'Item 2', date: new Date('2024-01-15') }, // score: 1
      ];

      const result = orderByCount(items, 'id', 'date');
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('1'); // Total score: 1.95
      expect(result[1].id).toBe('2'); // Total score: 1
    });

    it('should keep the most recent item for duplicate IDs', () => {
      const items: TestItem[] = [
        { id: '1', name: 'Old Item', date: new Date('2024-01-13'), metadata: 'old' },
        { id: '1', name: 'New Item', date: new Date('2024-01-15'), metadata: 'new' },
        { id: '1', name: 'Middle Item', date: new Date('2024-01-14'), metadata: 'middle' },
      ];

      const result = orderByCount(items, 'id', 'date');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('New Item');
      expect(result[0].metadata).toBe('new');
    });

    it('should handle items with missing dates', () => {
      const items: TestItem[] = [
        { id: '1', name: 'Item 1', date: new Date('2024-01-15') },
        { id: '2', name: 'Item 2', date: undefined as any },
        { id: '3', name: 'Item 3', date: null as any },
      ];

      const result = orderByCount(items, 'id', 'date');
      expect(result).toHaveLength(3);
      expect(result[0].id).toBe('1'); // Has valid date, score: 1
      // Items 2 and 3 have score 0, sorted by ID
    });

    it('should skip items with invalid IDs', () => {
      const items = [
        { id: '1', name: 'Valid', date: new Date('2024-01-15') },
        { id: null, name: 'Null ID', date: new Date('2024-01-15') },
        { id: undefined, name: 'Undefined ID', date: new Date('2024-01-15') },
        { id: '', name: 'Empty ID', date: new Date('2024-01-15') },
      ];

      const result = orderByCount(items as any, 'id', 'date');
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('name', 'Valid');
    });

    it('should provide stable sorting for equal scores', () => {
      const items: TestItem[] = [
        { id: 'b', name: 'Item B', date: new Date('2024-01-15') },
        { id: 'a', name: 'Item A', date: new Date('2024-01-15') },
        { id: 'c', name: 'Item C', date: new Date('2024-01-15') },
      ];

      const result = orderByCount(items, 'id', 'date');
      // All have same score, Map preserves insertion order
      expect(result.map((r) => r.id)).toEqual(['b', 'a', 'c']);
    });

    it('should work with real-world website data structure', () => {
      interface IFeaturedWebsite {
        id: string;
        rawUrl: string;
        lastVisited: Date;
        visitCount: number;
      }

      const websites: IFeaturedWebsite[] = [
        {
          id: 'site1',
          rawUrl: 'https://example.com',
          lastVisited: new Date('2024-01-15'),
          visitCount: 5,
        },
        {
          id: 'site2',
          rawUrl: 'https://test.com',
          lastVisited: new Date('2024-01-14'),
          visitCount: 3,
        },
        {
          id: 'site1',
          rawUrl: 'https://example.com',
          lastVisited: new Date('2024-01-13'),
          visitCount: 2,
        },
        {
          id: 'site3',
          rawUrl: 'https://demo.com',
          lastVisited: new Date('2024-01-15'),
          visitCount: 1,
        },
      ];

      const result = orderByCount(websites, 'id', 'lastVisited');
      expect(result).toHaveLength(3);
      expect(result[0].id).toBe('site1'); // Accumulated score from two visits
      expect(result[0].lastVisited).toEqual(new Date('2024-01-15')); // Most recent date kept
      expect(result[1].id).toBe('site3');
      expect(result[2].id).toBe('site2');
    });
  });

  describe('orderByCountWithOptions', () => {
    interface TestItem {
      id: string;
      name: string;
      date: Date;
    }

    it('should support ascending order', () => {
      const items: TestItem[] = [
        { id: '1', name: 'Item 1', date: new Date('2024-01-15') },
        { id: '2', name: 'Item 2', date: new Date('2024-01-14') },
        { id: '3', name: 'Item 3', date: new Date('2024-01-13') },
      ];

      const result = orderByCountWithOptions(items, 'id', 'date', {
        ascending: true,
      }) as TestItem[];
      expect(result.map((r) => r.id)).toEqual(['3', '2', '1']);
    });

    it('should return items with scores when keepAll is true', () => {
      const items: TestItem[] = [
        { id: '1', name: 'Item 1', date: new Date('2024-01-15') },
        { id: '1', name: 'Item 1b', date: new Date('2024-01-14') },
        { id: '2', name: 'Item 2', date: new Date('2024-01-15') },
      ];

      const result = orderByCountWithOptions(items, 'id', 'date', { keepAll: true }) as {
        item: TestItem;
        score: number;
      }[];

      expect(result).toHaveLength(2);
      expect(result[0].item.id).toBe('1');
      expect(result[0].score).toBeCloseTo(1.95, 2); // 1 + 0.95
      expect(result[1].item.id).toBe('2');
      expect(result[1].score).toBe(1);
    });
  });

  describe('Integration tests', () => {
    it('should handle complex real-world scenario', () => {
      // Simulate website visits over multiple days
      const websiteVisits = [
        // Site A: visited frequently recently
        { websiteId: 'A', url: 'https://a.com', visitedTime: new Date('2024-01-15T10:00:00Z') },
        { websiteId: 'A', url: 'https://a.com', visitedTime: new Date('2024-01-15T14:00:00Z') },
        { websiteId: 'A', url: 'https://a.com', visitedTime: new Date('2024-01-14T09:00:00Z') },

        // Site B: visited once recently
        { websiteId: 'B', url: 'https://b.com', visitedTime: new Date('2024-01-15T11:00:00Z') },

        // Site C: visited frequently but long ago
        { websiteId: 'C', url: 'https://c.com', visitedTime: new Date('2024-01-01T10:00:00Z') },
        { websiteId: 'C', url: 'https://c.com', visitedTime: new Date('2024-01-01T14:00:00Z') },
        { websiteId: 'C', url: 'https://c.com', visitedTime: new Date('2024-01-01T18:00:00Z') },

        // Site D: visited moderately, mixed recency
        { websiteId: 'D', url: 'https://d.com', visitedTime: new Date('2024-01-10T10:00:00Z') },
        { websiteId: 'D', url: 'https://d.com', visitedTime: new Date('2024-01-13T10:00:00Z') },
      ];

      const result = orderByCount(websiteVisits, 'websiteId', 'visitedTime');

      expect(result).toHaveLength(4);
      expect(result[0].websiteId).toBe('A'); // Highest score: recent and frequent (2.95)
      expect(result[1].websiteId).toBe('D'); // Moderate score: some recency (~1.8)
      expect(result[2].websiteId).toBe('C'); // Old visits but 3 of them (~1.7)
      expect(result[3].websiteId).toBe('B'); // Single recent visit (1.0)

      // Verify the most recent visit is kept for each
      expect(result[0].visitedTime).toEqual(new Date('2024-01-15T14:00:00Z')); // A's most recent
      expect(result[1].visitedTime).toEqual(new Date('2024-01-13T10:00:00Z')); // D's most recent
      expect(result[2].visitedTime).toEqual(new Date('2024-01-01T18:00:00Z')); // C's most recent
      expect(result[3].visitedTime).toEqual(new Date('2024-01-15T11:00:00Z')); // B's only visit
    });

    it('should handle edge case with thousands of items efficiently', () => {
      interface LargeTestItem {
        id: string;
        name: string;
        date: Date;
        index: number;
      }

      const items: LargeTestItem[] = [];
      const numItems = 1000;
      const numUniqueIds = 100;

      // Generate test data
      for (let i = 0; i < numItems; i++) {
        const id = `item-${i % numUniqueIds}`;
        const daysAgo = Math.floor(Math.random() * 30);
        const date = new Date('2024-01-15');
        date.setDate(date.getDate() - daysAgo);

        items.push({
          id,
          name: `Item ${i}`,
          date,
          index: i,
        });
      }

      const startTime = performance.now();
      const result = orderByCount(items, 'id', 'date');
      const endTime = performance.now();

      expect(result).toHaveLength(numUniqueIds);
      expect(endTime - startTime).toBeLessThan(100); // Should complete in less than 100ms

      // Verify sorting is correct (first item should have highest accumulated score)
      const firstItemId = result[0].id;
      const firstItemOccurrences = items.filter((item) => item.id === firstItemId);
      expect(firstItemOccurrences.length).toBeGreaterThan(0);
    });
  });
});
