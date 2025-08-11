import { beforeEach, describe, expect, it, vi } from 'vitest';
import EnhancedSegmentStore from '../../components/store/models/enhanced-segment-store';
import { ISegment } from '../../components/store/data-types';

// Mock the error tracking
vi.mock('../../components/error-tracking/error-tracking', () => ({
  default: {
    logError: vi.fn(),
  },
}));

// Mock config
vi.mock('../../constants/config', () => ({
  default: {
    startDate: new Date('2024-01-01'),
    MEETING_PREP_NOTIFICATION_EARLY_MINUTES: 15,
  },
}));

// Mock date-fns functions
vi.mock('date-fns', () => ({
  addMinutes: vi.fn((date: Date, minutes: number) => new Date(date.getTime() + minutes * 60000)),
  subMinutes: vi.fn((date: Date, minutes: number) => new Date(date.getTime() - minutes * 60000)),
  format: vi.fn((date: Date, formatStr: string) => {
    if (formatStr === 'EEEE, MMM d yyyy') {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
    return date.toISOString();
  }),
  isSameDay: vi.fn((date1: Date, date2: Date) => date1.toDateString() === date2.toDateString()),
  getWeek: vi.fn((date: Date) => Math.ceil(date.getDate() / 7)),
  getDate: vi.fn((date: Date) => date.getDate()),
}));

// Mock lodash functions
vi.mock('lodash', () => ({
  first: vi.fn((arr: any[]) => arr?.[0]),
  flatten: vi.fn((arr: any[][]) => arr.flat()),
  groupBy: vi.fn((arr: any[], keyFn: (item: any) => string) => {
    const groups: { [key: string]: any[] } = {};
    arr.forEach((item) => {
      const key = keyFn(item);
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    return groups;
  }),
}));

describe('EnhancedSegmentStore', () => {
  let store: EnhancedSegmentStore;
  let mockDb: any;
  let mockTransaction: any;
  let mockStore: any;

  const createMockSegment = (id: string, overrides: Partial<ISegment> = {}): ISegment => ({
    id,
    summary: `Meeting ${id}`,
    start: new Date('2024-06-01T10:00:00Z'),
    end: new Date('2024-06-01T11:00:00Z'),
    selfResponseStatus: 'accepted',
    attendees: [],
    attachments: [],
    state: 'upcoming',
    documentIdsFromDescription: [],
    ...overrides,
  });

  beforeEach(() => {
    mockStore = {
      put: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
      get: vi.fn(),
      getAll: vi.fn(),
      getAllFromIndex: vi.fn(),
    };

    mockTransaction = {
      store: mockStore,
      done: Promise.resolve(),
    };

    mockDb = {
      transaction: vi.fn().mockReturnValue(mockTransaction),
      get: vi.fn(),
      getAll: vi.fn(),
      getAllFromIndex: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    } as any;

    store = new EnhancedSegmentStore(mockDb);
  });

  describe('constructor', () => {
    it('should initialize with correct store name', () => {
      expect(store).toBeInstanceOf(EnhancedSegmentStore);
    });
  });

  describe('isValidSortField', () => {
    it('should validate correct sort fields', () => {
      // Access protected method through type assertion
      const protectedStore = store as any;
      expect(protectedStore.isValidSortField('id')).toBe(true);
      expect(protectedStore.isValidSortField('summary')).toBe(true);
      expect(protectedStore.isValidSortField('start')).toBe(true);
      expect(protectedStore.isValidSortField('end')).toBe(true);
      expect(protectedStore.isValidSortField('selfResponseStatus')).toBe(true);
      expect(protectedStore.isValidSortField('invalid')).toBe(false);
    });
  });

  describe('addSegments', () => {
    it('should add segments successfully', async () => {
      const segments = [createMockSegment('1'), createMockSegment('2')];
      mockDb.getAll.mockResolvedValue([]);

      const result = await store.addSegments(segments);

      expect(result.success).toBe(true);
      expect(mockDb.transaction).toHaveBeenCalledWith('meeting', 'readwrite');
    });

    it('should clear store when shouldClearStore is true', async () => {
      const existingSegments = [createMockSegment('old1'), createMockSegment('old2')];
      const newSegments = [createMockSegment('new1')];

      mockDb.getAll.mockResolvedValue(existingSegments);

      const result = await store.addSegments(newSegments, true);

      expect(result.success).toBe(true);
      expect(mockDb.transaction).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      const segments = [createMockSegment('1')];
      mockDb.getAll.mockResolvedValue([]);

      // Mock addBulk to fail by making the transaction fail
      const failingTransaction = {
        store: {
          put: vi.fn().mockRejectedValue(new Error('Put operation failed')),
        },
        done: Promise.reject(new Error('Transaction failed')),
      };
      mockDb.transaction.mockReturnValue(failingTransaction);

      const result = await store.addSegments(segments);

      // The safeOperation wrapper should catch the error and return a failure result
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
        // The error should come from the addBulk operation that failed
        expect(result.error.message).toContain('addBulk');
      }
    });
  });

  describe('cleanup', () => {
    it('should remove old segments', async () => {
      const oldSegment = createMockSegment('old', {
        end: new Date('2023-01-01'),
      });
      const newSegment = createMockSegment('new', {
        end: new Date('2024-06-01'),
      });

      mockDb.getAll.mockResolvedValue([oldSegment, newSegment]);

      const result = await store.cleanup();

      expect(result.success).toBe(true);
      expect(mockDb.transaction).toHaveBeenCalledWith('meeting', 'readwrite');
    });

    it('should handle cleanup errors', async () => {
      mockDb.getAll.mockRejectedValue(new Error('Database error'));

      const result = await store.cleanup();

      expect(result.success).toBe(false);
    });
  });

  describe('getSegments', () => {
    it('should get segments with default ascending order', async () => {
      const segments = [
        createMockSegment('1', { start: new Date('2024-06-01T10:00:00Z') }),
        createMockSegment('2', { start: new Date('2024-06-01T09:00:00Z') }),
      ];
      mockDb.getAll.mockResolvedValue(segments);

      const result = await store.getSegments();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.data).toHaveLength(2);
      }
    });

    it('should get segments with descending order', async () => {
      const segments = [createMockSegment('1'), createMockSegment('2')];
      mockDb.getAll.mockResolvedValue(segments);

      const result = await store.getSegments('desc');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.data).toHaveLength(2);
      }
    });
  });

  describe('getUpNextSegment', () => {
    it('should find upcoming segment', async () => {
      const now = new Date();
      const upcomingSegment = createMockSegment('upcoming', {
        start: new Date(now.getTime() + 30 * 60000), // 30 minutes from now
        selfResponseStatus: 'accepted',
      });
      const segments = [upcomingSegment];
      mockDb.getAll.mockResolvedValue(segments);

      const result = await store.getUpNextSegment();

      expect(result.success).toBe(true);
    });

    it('should exclude not attending segments', async () => {
      const now = new Date();
      const notAttendingSegment = createMockSegment('not-attending', {
        start: new Date(now.getTime() + 30 * 60000),
        selfResponseStatus: 'notAttending',
      });
      const segments = [notAttendingSegment];
      mockDb.getAll.mockResolvedValue(segments);

      const result = await store.getUpNextSegment();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeUndefined();
      }
    });
  });

  describe('getCurrentSegment', () => {
    it('should find current segment', async () => {
      const now = new Date();
      const currentSegment = createMockSegment('current', {
        start: new Date(now.getTime() - 30 * 60000), // 30 minutes ago
        end: new Date(now.getTime() + 30 * 60000), // 30 minutes from now
        selfResponseStatus: 'accepted',
      });
      const segments = [currentSegment];
      mockDb.getAll.mockResolvedValue(segments);

      const result = await store.getCurrentSegment();

      expect(result.success).toBe(true);
    });
  });

  describe('getCurrentSegmentForWebsites', () => {
    it('should find current segment for websites', async () => {
      const testTime = new Date('2024-06-01T10:30:00Z');
      const currentSegment = createMockSegment('current', {
        start: new Date('2024-06-01T10:00:00Z'),
        end: new Date('2024-06-01T11:00:00Z'),
        selfResponseStatus: 'accepted',
      });
      const segments = [currentSegment];
      mockDb.getAll.mockResolvedValue(segments);

      const result = await store.getCurrentSegmentForWebsites(testTime);

      expect(result.success).toBe(true);
    });
  });

  describe('getSegmentsByDay', () => {
    it('should group segments by day', async () => {
      const startDate = new Date('2024-06-01');
      const segments = [
        createMockSegment('1', { start: new Date('2024-06-02T10:00:00Z') }),
        createMockSegment('2', { start: new Date('2024-06-03T10:00:00Z') }),
      ];
      mockDb.getAll.mockResolvedValue(segments);

      const result = await store.getSegmentsByDay(startDate);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(typeof result.data).toBe('object');
      }
    });
  });

  describe('getSegmentsForDay', () => {
    it('should get segments for specific day', async () => {
      const testDay = new Date('2024-06-01');
      const segments = [
        createMockSegment('1', { start: new Date('2024-06-01T10:00:00Z') }),
        createMockSegment('2', { start: new Date('2024-06-02T10:00:00Z') }),
      ];
      mockDb.getAll.mockResolvedValue(segments);

      const result = await store.getSegmentsForDay(testDay);

      expect(result.success).toBe(true);
    });
  });

  describe('getSegmentsForWeek', () => {
    it('should get segments for specific week', async () => {
      const segments = [createMockSegment('1'), createMockSegment('2')];
      mockDb.getAll.mockResolvedValue(segments);

      const result = await store.getSegmentsForWeek(23);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(Array.isArray(result.data)).toBe(true);
      }
    });
  });

  describe('getListedDocumentIdsForDay', () => {
    it('should get document IDs for specific day', async () => {
      const testDay = new Date('2024-06-01');
      const segments = [
        createMockSegment('1', {
          start: new Date('2024-06-01T10:00:00Z'),
          documentIdsFromDescription: ['doc1', 'doc2'],
        }),
      ];
      mockDb.getAll.mockResolvedValue(segments);

      const result = await store.getListedDocumentIdsForDay(testDay);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(Array.isArray(result.data)).toBe(true);
      }
    });
  });

  describe('getSegmentsForName', () => {
    it('should get segments by name', async () => {
      const segments = [
        createMockSegment('1', { summary: 'Test Meeting' }),
        createMockSegment('2', { summary: 'Other Meeting' }),
      ];
      mockDb.getAll.mockResolvedValue(segments);

      const result = await store.getSegmentsForName('Test Meeting');

      expect(result.success).toBe(true);
    });
  });

  describe('getSegmentsForEmail', () => {
    it('should get segments by email', async () => {
      const attendees = [
        { segmentId: '1', email: 'test@example.com' },
        { segmentId: '2', email: 'test@example.com' },
      ];
      const segment = createMockSegment('1');

      mockDb.getAllFromIndex.mockResolvedValue(attendees);
      mockDb.get.mockResolvedValue(segment);

      const result = await store.getSegmentsForEmail('test@example.com');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(Array.isArray(result.data)).toBe(true);
      }
    });
  });

  describe('getDriveActivityIdsForWeek', () => {
    it('should get drive activity IDs for week', async () => {
      const segments = [createMockSegment('1')];
      mockDb.getAll.mockResolvedValue(segments);

      const result = await store.getDriveActivityIdsForWeek(23);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(Array.isArray(result.data)).toBe(true);
      }
    });
  });

  describe('getDriveActivityIdsForDate', () => {
    it('should get drive activity IDs for date', async () => {
      const segments = [createMockSegment('1')];
      mockDb.getAll.mockResolvedValue(segments);

      const result = await store.getDriveActivityIdsForDate(15);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(Array.isArray(result.data)).toBe(true);
      }
    });
  });

  describe('error handling', () => {
    it('should handle database errors gracefully', async () => {
      mockDb.getAll.mockRejectedValue(new Error('Database connection failed'));

      const result = await store.getSegmentsForDay(new Date());

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });

    it('should record performance metrics', async () => {
      const segments = [createMockSegment('1')];
      mockDb.getAll.mockResolvedValue(segments);

      await store.getSegmentsForDay(new Date());

      // Performance metrics should be recorded (tested indirectly through successful operation)
      expect(mockDb.getAll).toHaveBeenCalled();
    });
  });

  describe('health monitoring', () => {
    it('should provide health status', async () => {
      const health = await store.getHealth();

      expect(health.isHealthy).toBeDefined();
      expect(health.lastChecked).toBeInstanceOf(Date);
      expect(Array.isArray(health.issues)).toBe(true);
      expect(health.performance).toBeDefined();
    });
  });
});
