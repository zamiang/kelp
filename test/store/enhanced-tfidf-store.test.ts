import { beforeEach, describe, expect, it, vi } from 'vitest';
import EnhancedTfidfStore, { ITfidfRow } from '../../components/store/models/enhanced-tfidf-store';

// Mock the database
const mockDb = {
  getAll: vi.fn(),
  get: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  transaction: vi.fn(),
  getAllFromIndex: vi.fn(),
} as any;

// Mock store for testing
const mockStore = {
  websiteStore: {
    getAllFiltered: vi.fn(),
  },
  timeDataStore: {
    getAll: vi.fn(),
  },
  domainBlocklistStore: {},
  websiteBlocklistStore: {},
} as any;

describe('EnhancedTfidfStore', () => {
  let store: EnhancedTfidfStore;

  beforeEach(() => {
    vi.clearAllMocks();
    store = new EnhancedTfidfStore(mockDb);
  });

  describe('getTfidfForDocuments', () => {
    it('should create TF-IDF instance from documents', async () => {
      const documents: ITfidfRow[] = [
        {
          id: 'doc1',
          key: 'test document one',
          text: 'test document one',
          type: 'website',
        },
        {
          id: 'doc2',
          key: 'test document two',
          text: 'test document two',
          type: 'meeting',
        },
      ];

      const result = await store.getTfidfForDocuments(documents);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeDefined();
        expect(typeof result.data.listTerms).toBe('function');
      }
    });

    it('should handle empty documents array', async () => {
      const result = await store.getTfidfForDocuments([]);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeDefined();
      }
    });
  });

  describe('getDocumentsForWebsites', () => {
    it('should format websites for TF-IDF processing', async () => {
      const websites = [
        {
          id: 'web1',
          title: 'Test Website',
          description: 'A test website description',
          domain: 'test.com',
          tags: 'test',
          rawUrl: 'https://test.com',
          url: 'https://test.com',
          visitedTime: new Date(),
        },
        {
          id: 'web2',
          title: 'Another Site',
          description: 'Another description',
          domain: 'another.com',
          tags: 'another',
          rawUrl: 'https://another.com',
          url: 'https://another.com',
          visitedTime: new Date(),
        },
      ];

      const result = await store.getDocumentsForWebsites(websites);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(2);
        expect(result.data[0]).toEqual({
          id: 'websites-web1',
          key: 'Test Website A test website description',
          text: 'Test Website A test website description',
          type: 'website',
        });
      }
    });

    it('should handle websites with missing title/description', async () => {
      const websites = [
        {
          id: 'web1',
          title: '',
          description: '',
          domain: 'test.com',
          tags: 'test',
          rawUrl: 'https://test.com',
          url: 'https://test.com',
          visitedTime: new Date(),
        },
      ];

      const result = await store.getDocumentsForWebsites(websites);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(1);
        expect(result.data[0].text).toBe(' ');
      }
    });
  });

  describe('getDocuments', () => {
    it('should combine website and meeting documents', async () => {
      // Mock successful responses
      mockStore.websiteStore.getAllFiltered.mockResolvedValue({
        success: true,
        data: {
          data: [
            {
              id: 'web1',
              title: 'Test Website',
              description: 'Test description',
              domain: 'test.com',
              tags: 'test',
              rawUrl: 'https://test.com',
            },
          ],
        },
      });

      mockStore.timeDataStore.getAll.mockResolvedValue({
        success: true,
        data: {
          data: [
            {
              id: 'meeting1',
              summary: 'Test meeting summary',
            },
          ],
        },
      });

      const result = await store.getDocuments(mockStore);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(2);
        expect(result.data[0]).toEqual({
          text: 'Test Website Test description',
          key: 'Test Website Test description',
        });
        expect(result.data[1]).toEqual({
          text: 'Test meeting summary',
          key: 'Test meeting summary',
        });
      }
    });

    it('should handle failed website store calls', async () => {
      mockStore.websiteStore.getAllFiltered.mockResolvedValue({
        success: false,
        error: new Error('Website store error'),
      });

      mockStore.timeDataStore.getAll.mockResolvedValue({
        success: true,
        data: { data: [] },
      });

      const result = await store.getDocuments(mockStore);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(0);
      }
    });
  });

  describe('invalidateCache', () => {
    it('should invalidate cache successfully', async () => {
      const result = await store.invalidateCache();

      expect(result.success).toBe(true);
    });
  });

  describe('getDocumentStats', () => {
    it('should return stats when no cache exists', async () => {
      const result = await store.getDocumentStats();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({
          totalDocuments: 0,
          totalTerms: 0,
          avgDocumentLength: 0,
          cacheHitRate: 0,
          lastComputationTime: 0,
        });
      }
    });
  });

  describe('cleanup', () => {
    it('should perform cleanup successfully', async () => {
      const result = await store.cleanup();

      expect(result.success).toBe(true);
    });
  });

  describe('bulkProcessDocuments', () => {
    it('should process documents with pagination', async () => {
      const documents: ITfidfRow[] = [
        {
          id: 'doc1',
          key: 'test document',
          text: 'test document',
          type: 'website',
        },
      ];

      const result = await store.bulkProcessDocuments(documents, {
        limit: 10,
        offset: 0,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.data).toBeDefined();
        expect(result.data.total).toBeGreaterThanOrEqual(0);
        expect(typeof result.data.hasMore).toBe('boolean');
      }
    });
  });

  describe('isValidSortField', () => {
    it('should validate sort fields correctly', () => {
      // Access protected method for testing
      const isValid = (store as any).isValidSortField('id');
      expect(isValid).toBe(true);

      const isInvalid = (store as any).isValidSortField('invalidField');
      expect(isInvalid).toBe(false);
    });
  });
});
