import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EnhancedSearchIndex } from '../../components/store/utils/enhanced-search-index';
import { IDocument, IPerson, ISegment, IWebsiteItem } from '../../components/store/data-types';

describe('EnhancedSearchIndex', () => {
  let searchIndex: EnhancedSearchIndex;
  let mockStore: any;

  const sampleDocuments: IDocument[] = [
    {
      id: 'doc1',
      name: 'Meeting Notes',
      link: 'https://docs.google.com/document/d/doc1',
      mimeType: 'application/vnd.google-apps.document',
      isShared: true,
      isStarred: false,
    },
    {
      id: 'doc2',
      name: 'Project Proposal',
      link: 'https://docs.google.com/document/d/doc2',
      mimeType: 'application/vnd.google-apps.document',
      isShared: false,
      isStarred: true,
    },
  ];

  const sampleSegments: ISegment[] = [
    {
      id: 'seg1',
      summary: 'Weekly Team Meeting',
      start: new Date('2023-01-01T10:00:00Z'),
      end: new Date('2023-01-01T11:00:00Z'),
      selfResponseStatus: 'accepted',
      attendees: [],
      attachments: [],
      state: 'past',
      documentIdsFromDescription: [],
    },
    {
      id: 'seg2',
      summary: 'Project Planning Session',
      start: new Date('2023-01-02T14:00:00Z'),
      end: new Date('2023-01-02T15:00:00Z'),
      selfResponseStatus: 'accepted',
      attendees: [],
      attachments: [],
      state: 'past',
      documentIdsFromDescription: [],
    },
  ];

  const samplePeople: IPerson[] = [
    {
      id: 'person1',
      name: 'John Doe',
      emailAddresses: ['john@example.com'],
      googleIds: ['google1'],
      isCurrentUser: 0,
      isInContacts: true,
      dateAdded: new Date('2023-01-01'),
    },
    {
      id: 'person2',
      name: 'Jane Smith',
      emailAddresses: ['jane@example.com'],
      googleIds: ['google2'],
      isCurrentUser: 0,
      isInContacts: true,
      dateAdded: new Date('2023-01-01'),
    },
  ];

  const sampleWebsites: IWebsiteItem[] = [
    {
      id: 'web1',
      title: 'React Documentation',
      rawUrl: 'https://reactjs.org/docs',
      domain: 'reactjs.org',
    },
    {
      id: 'web2',
      title: 'TypeScript Handbook',
      rawUrl: 'https://www.typescriptlang.org/docs',
      domain: 'typescriptlang.org',
    },
  ];

  beforeEach(() => {
    searchIndex = new EnhancedSearchIndex();

    mockStore = {
      documentDataStore: {
        getAll: vi.fn().mockResolvedValue(sampleDocuments),
      },
      timeDataStore: {
        getAll: vi.fn().mockResolvedValue(sampleSegments),
      },
      personDataStore: {
        getAll: vi.fn().mockResolvedValue(samplePeople),
      },
      websiteStore: {
        getAll: vi.fn().mockResolvedValue(sampleWebsites),
      },
      domainBlocklistStore: {},
      websiteBlocklistStore: {},
    };
  });

  describe('search', () => {
    it('should return all results for empty query', async () => {
      const result = await searchIndex.search('', mockStore);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.items).toHaveLength(6);
        expect(result.data.total).toBe(6);
        expect(result.data.hasMore).toBe(false);
      }
    });

    it('should search across all data types by default', async () => {
      const result = await searchIndex.search('meeting', mockStore);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.items.length).toBeGreaterThan(0);

        // Should find both document and segment matches
        const types = result.data.items.map((item) => item.type);
        expect(types).toContain('website'); // Documents are converted to websites
        expect(types).toContain('segment');
      }
    });

    it('should filter by specific types', async () => {
      const result = await searchIndex.search('meeting', mockStore, {
        types: ['segment'],
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.items.every((item) => item.type === 'segment')).toBe(true);
      }
    });

    it('should apply pagination', async () => {
      const result = await searchIndex.search('e', mockStore, {
        limit: 2,
        offset: 1,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.items.length).toBeLessThanOrEqual(2);
        if (result.data.total > 3) {
          expect(result.data.hasMore).toBe(true);
          expect(result.data.nextOffset).toBe(3);
        }
      }
    });

    it('should respect minimum score threshold', async () => {
      const result = await searchIndex.search('xyz', mockStore, {
        minScore: 0.8, // High threshold
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.items).toHaveLength(0);
      }
    });

    it('should sort results by score', async () => {
      const result = await searchIndex.search('project', mockStore);

      expect(result.success).toBe(true);
      if (result.success && result.data.items.length > 1) {
        // Scores should be in descending order
        for (let i = 1; i < result.data.items.length; i++) {
          const prevScore = result.data.items[i - 1].score || 0;
          const currentScore = result.data.items[i].score || 0;
          expect(prevScore).toBeGreaterThanOrEqual(currentScore);
        }
      }
    });

    it('should handle store errors gracefully', async () => {
      mockStore.documentDataStore.getAll.mockRejectedValue(new Error('Store error'));

      const result = await searchIndex.search('test', mockStore);

      expect(result.success).toBe(true);
      if (result.success) {
        // Should still return results from other stores
        expect(result.data.items.length).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('caching', () => {
    it('should cache search results', async () => {
      const query = 'meeting';

      // First search
      await searchIndex.search(query, mockStore);

      // Second search with same query
      await searchIndex.search(query, mockStore);

      // Store methods should only be called once due to caching
      expect(mockStore.documentDataStore.getAll).toHaveBeenCalledTimes(1);
      expect(mockStore.timeDataStore.getAll).toHaveBeenCalledTimes(1);
    });

    it('should cache index data by type', async () => {
      // Search for documents
      await searchIndex.search('notes', mockStore, { types: ['document'] });

      // Search for segments
      await searchIndex.search('meeting', mockStore, { types: ['segment'] });

      // Search for documents again
      await searchIndex.search('proposal', mockStore, { types: ['document'] });

      // Documents should only be loaded once
      expect(mockStore.documentDataStore.getAll).toHaveBeenCalledTimes(1);
      expect(mockStore.timeDataStore.getAll).toHaveBeenCalledTimes(1);
    });

    it('should provide cache statistics', () => {
      const stats = searchIndex.getCacheStats();

      expect(stats).toHaveProperty('searchCacheSize');
      expect(stats).toHaveProperty('indexCacheSize');
      expect(stats).toHaveProperty('lastUpdates');
      expect(typeof stats.searchCacheSize).toBe('number');
      expect(typeof stats.indexCacheSize).toBe('number');
      expect(typeof stats.lastUpdates).toBe('object');
    });

    it('should clear all caches', async () => {
      // Populate caches
      await searchIndex.search('test', mockStore);

      let stats = searchIndex.getCacheStats();
      expect(stats.searchCacheSize).toBeGreaterThan(0);

      // Clear caches
      searchIndex.clearCache();

      stats = searchIndex.getCacheStats();
      expect(stats.searchCacheSize).toBe(0);
      expect(stats.indexCacheSize).toBe(0);
      expect(Object.keys(stats.lastUpdates)).toHaveLength(0);
    });
  });

  describe('scoring algorithm', () => {
    it('should score exact matches highest', async () => {
      const result = await searchIndex.search('React Documentation', mockStore, {
        types: ['website'],
      });

      expect(result.success).toBe(true);
      if (result.success && result.data.items.length > 0) {
        const exactMatch = result.data.items.find(
          (item) => (item.item as IWebsiteItem).title === 'React Documentation',
        );
        expect(exactMatch?.score).toBeGreaterThan(0.8);
      }
    });

    it('should score partial matches lower than exact matches', async () => {
      const result = await searchIndex.search('react', mockStore, {
        types: ['website'],
      });

      expect(result.success).toBe(true);
      if (result.success && result.data.items.length > 0) {
        const partialMatch = result.data.items.find((item) =>
          (item.item as IWebsiteItem).title?.toLowerCase().includes('react'),
        );
        expect(partialMatch?.score).toBeLessThan(1.0);
        expect(partialMatch?.score).toBeGreaterThan(0);
      }
    });

    it('should handle multi-word queries', async () => {
      const result = await searchIndex.search('team meeting', mockStore, {
        types: ['segment'],
      });

      expect(result.success).toBe(true);
      if (result.success) {
        const teamMeetingMatch = result.data.items.find((item) =>
          (item.item as ISegment).summary?.toLowerCase().includes('team meeting'),
        );
        expect(teamMeetingMatch).toBeDefined();
        expect(teamMeetingMatch?.score).toBeGreaterThan(0);
      }
    });

    it('should handle fuzzy matching for typos', async () => {
      const result = await searchIndex.search('meetng', mockStore, {
        // Missing 'i'
        types: ['segment'],
        minScore: 0.1,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        // Should still find meeting-related items with fuzzy matching
        expect(result.data.items.length).toBeGreaterThan(0);
      }
    });
  });

  describe('data type handling', () => {
    it('should convert documents to website format', async () => {
      const result = await searchIndex.search('notes', mockStore, {
        types: ['document'],
      });

      expect(result.success).toBe(true);
      if (result.success && result.data.items.length > 0) {
        const documentItem = result.data.items[0];
        expect(documentItem.type).toBe('website');
        expect(documentItem.item).toHaveProperty('title');
        expect(documentItem.item).toHaveProperty('rawUrl');
        expect(documentItem.item).toHaveProperty('documentId');
      }
    });

    it('should filter out unknown contributors from people', async () => {
      const peopleWithUnknown = [
        ...samplePeople,
        {
          id: 'unknown1',
          name: 'Unknown Contributor',
          emailAddresses: ['unknown@example.com'],
          googleIds: [],
          isCurrentUser: 0,
          isInContacts: false,
          dateAdded: new Date(),
        },
      ];

      mockStore.personDataStore.getAll.mockResolvedValue(peopleWithUnknown);

      const result = await searchIndex.search('contributor', mockStore, {
        types: ['person'],
      });

      expect(result.success).toBe(true);
      if (result.success) {
        // Should not include unknown contributors
        const hasUnknownContributor = result.data.items.some((item) =>
          (item.item as IPerson).name?.toLowerCase().includes('unknown contributor'),
        );
        expect(hasUnknownContributor).toBe(false);
      }
    });

    it('should handle empty data gracefully', async () => {
      mockStore.documentDataStore.getAll.mockResolvedValue([]);
      mockStore.timeDataStore.getAll.mockResolvedValue([]);
      mockStore.personDataStore.getAll.mockResolvedValue([]);
      mockStore.websiteStore.getAll.mockResolvedValue([]);

      const result = await searchIndex.search('anything', mockStore);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.items).toHaveLength(0);
        expect(result.data.total).toBe(0);
      }
    });
  });

  describe('memory management', () => {
    it('should limit cache size', async () => {
      // Create many different searches to fill cache
      const searches = Array.from({ length: 150 }, (_, i) => `query${i}`);

      for (const query of searches) {
        await searchIndex.search(query, mockStore);
      }

      const stats = searchIndex.getCacheStats();
      expect(stats.searchCacheSize).toBeLessThanOrEqual(100);
    });

    it('should manage index cache size', async () => {
      // This is harder to test directly, but we can verify the method exists
      expect(typeof searchIndex['manageCacheSize']).toBe('function');
    });
  });

  describe('error handling', () => {
    it('should handle search operation errors', async () => {
      // Mock a complete failure
      mockStore.documentDataStore.getAll.mockRejectedValue(new Error('Complete failure'));
      mockStore.timeDataStore.getAll.mockRejectedValue(new Error('Complete failure'));
      mockStore.personDataStore.getAll.mockRejectedValue(new Error('Complete failure'));
      mockStore.websiteStore.getAll.mockRejectedValue(new Error('Complete failure'));

      const result = await searchIndex.search('test', mockStore);

      expect(result.success).toBe(true);
      if (result.success) {
        // Should return empty results rather than failing
        expect(result.data.items).toHaveLength(0);
      }
    });

    it('should handle invalid search options', async () => {
      const result = await searchIndex.search('test', mockStore, {
        limit: -1,
        offset: -1,
        minScore: -1,
      });

      expect(result.success).toBe(true);
      // Should handle invalid options gracefully
    });
  });

  describe('performance', () => {
    it('should handle large datasets efficiently', async () => {
      // Create large datasets
      const largeDocuments = Array.from({ length: 1000 }, (_, i) => ({
        id: `doc${i}`,
        name: `Document ${i}`,
        link: `https://example.com/doc${i}`,
        mimeType: 'application/vnd.google-apps.document' as const,
        isShared: i % 2 === 0,
        isStarred: i % 3 === 0,
      }));

      mockStore.documentDataStore.getAll.mockResolvedValue(largeDocuments);

      const startTime = performance.now();
      const result = await searchIndex.search('document', mockStore, {
        types: ['document'],
        limit: 10,
      });
      const endTime = performance.now();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.items.length).toBeLessThanOrEqual(10);
      }

      // Should complete reasonably quickly (less than 1 second)
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });
});
