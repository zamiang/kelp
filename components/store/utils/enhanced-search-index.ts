import { IDocument, IPerson, ISegment, IWebsiteItem } from '../data-types';
import { IStore } from '../use-store';
import { safeOperation } from './error-handler';

export interface ISearchItem {
  text: string;
  type: 'segment' | 'document' | 'person' | 'website';
  item: IPerson | ISegment | IDocument | IWebsiteItem;
  score?: number;
}

export interface SearchOptions {
  limit?: number;
  offset?: number;
  types?: Array<'segment' | 'document' | 'person' | 'website'>;
  minScore?: number;
}

export interface SearchResult {
  items: ISearchItem[];
  total: number;
  hasMore: boolean;
  nextOffset?: number;
}

/**
 * Enhanced search index with lazy loading, caching, and better performance
 */
export class EnhancedSearchIndex {
  private searchCache = new Map<string, SearchResult>();
  private indexCache = new Map<string, ISearchItem[]>();
  private lastIndexUpdate = new Map<string, number>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_CACHE_SIZE = 100;

  constructor() {
    console.log('Enhanced search index initialized');
  }

  /**
   * Search across all data types with enhanced performance
   */
  async search(
    query: string,
    store: IStore,
    options: SearchOptions = {},
  ): Promise<{ success: true; data: SearchResult } | { success: false; error: Error }> {
    return safeOperation(async () => {
      const {
        limit = 50,
        offset = 0,
        types = ['segment', 'document', 'person', 'website'],
        minScore = 0.1,
      } = options;

      const cacheKey = `${query}-${JSON.stringify(options)}`;

      // Check cache first
      const cachedResult = this.searchCache.get(cacheKey);
      if (cachedResult && this.isCacheValid(cacheKey)) {
        return cachedResult;
      }

      // Get search items for requested types
      const searchItems = await this.getSearchItems(store, types);

      // Perform search with scoring
      const results = this.performSearch(query, searchItems, minScore);

      // Apply pagination
      const paginatedResults = results.slice(offset, offset + limit);
      const hasMore = offset + limit < results.length;

      const searchResult: SearchResult = {
        items: paginatedResults,
        total: results.length,
        hasMore,
        nextOffset: hasMore ? offset + limit : undefined,
      };

      // Cache the result
      this.cacheResult(cacheKey, searchResult);

      return searchResult;
    }, 'enhanced-search');
  }

  /**
   * Get search items for specific types with lazy loading
   */
  private async getSearchItems(
    store: IStore,
    types: Array<'segment' | 'document' | 'person' | 'website'>,
  ): Promise<ISearchItem[]> {
    const allItems: ISearchItem[] = [];

    // Load data for each requested type
    for (const type of types) {
      const cacheKey = `index-${type}`;
      const lastUpdate = this.lastIndexUpdate.get(cacheKey) || 0;
      const now = Date.now();

      // Check if we need to refresh this type's index
      if (now - lastUpdate > this.CACHE_TTL || !this.indexCache.has(cacheKey)) {
        const items = await this.loadTypeData(store, type);
        this.indexCache.set(cacheKey, items);
        this.lastIndexUpdate.set(cacheKey, now);

        // Manage cache size
        this.manageCacheSize();
      }

      const cachedItems = this.indexCache.get(cacheKey) || [];
      allItems.push(...cachedItems);
    }

    return allItems;
  }

  /**
   * Load data for a specific type
   */
  private async loadTypeData(store: IStore, type: string): Promise<ISearchItem[]> {
    const items: ISearchItem[] = [];

    try {
      switch (type) {
        case 'document': {
          const documents = await store.documentDataStore.getAll();
          documents?.forEach((document) => {
            if (document?.name) {
              items.push({
                text: document.name.toLowerCase(),
                type: 'website', // Convert to website for compatibility
                item: this.documentToWebsite(document),
              });
            }
          });
          break;
        }

        case 'segment': {
          const segments = await store.timeDataStore.getAll();
          segments.forEach((segment) => {
            if (segment?.summary) {
              items.push({
                text: segment.summary.toLowerCase(),
                type: 'segment',
                item: segment,
              });
            }
          });
          break;
        }

        case 'person': {
          const people = await store.personDataStore.getAll(false);
          people.forEach((person) => {
            if (person?.name?.toLowerCase().indexOf('unknown contributor') < 0) {
              items.push({
                text: person.name.toLowerCase(),
                type: 'person',
                item: person,
              });
            }
          });
          break;
        }

        case 'website': {
          const websites = await store.websiteStore.getAll(
            store.domainBlocklistStore,
            store.websiteBlocklistStore,
          );
          websites.forEach((website) => {
            items.push({
              text: website.title.toLowerCase(),
              type: 'website',
              item: website,
            });
          });
          break;
        }
      }
    } catch (error) {
      console.warn(`Failed to load ${type} data for search:`, error);
      // Don't throw - just return empty array for this type
    }

    return items;
  }

  /**
   * Perform search with scoring algorithm
   */
  private performSearch(query: string, items: ISearchItem[], minScore: number): ISearchItem[] {
    const normalizedQuery = query.toLowerCase().trim();

    if (!normalizedQuery) {
      return [];
    }

    const queryTerms = normalizedQuery.split(/\s+/);
    const results: ISearchItem[] = [];

    for (const item of items) {
      const score = this.calculateScore(item.text, queryTerms);

      if (score >= minScore) {
        results.push({
          ...item,
          score,
        });
      }
    }

    // Sort by score (descending) and then by text (ascending)
    return results.sort((a, b) => {
      if (b.score !== a.score) {
        return (b.score || 0) - (a.score || 0);
      }
      return a.text.localeCompare(b.text);
    });
  }

  /**
   * Calculate relevance score for a text against query terms
   */
  private calculateScore(text: string, queryTerms: string[]): number {
    let score = 0;
    const textLength = text.length;

    for (const term of queryTerms) {
      // Exact match bonus
      if (text === term) {
        score += 1.0;
        continue;
      }

      // Starts with bonus
      if (text.startsWith(term)) {
        score += 0.8;
        continue;
      }

      // Contains term
      const index = text.indexOf(term);
      if (index !== -1) {
        // Earlier matches score higher
        const positionScore = 1 - index / textLength;
        // Longer matches score higher
        const lengthScore = term.length / textLength;
        score += 0.5 * positionScore * lengthScore;
      }

      // Fuzzy matching for typos (simple implementation)
      if (term.length > 3 && this.fuzzyMatch(text, term)) {
        score += 0.3;
      }
    }

    // Normalize score by number of query terms
    return score / queryTerms.length;
  }

  /**
   * Simple fuzzy matching for typos
   */
  private fuzzyMatch(text: string, term: string): boolean {
    // Allow one character difference for terms longer than 3 characters
    if (Math.abs(text.length - term.length) > 1) {
      return false;
    }

    let differences = 0;
    const maxLength = Math.max(text.length, term.length);

    for (let i = 0; i < maxLength; i++) {
      if (text[i] !== term[i]) {
        differences++;
        if (differences > 1) {
          return false;
        }
      }
    }

    return differences <= 1;
  }

  /**
   * Convert document to website format for compatibility
   */
  private documentToWebsite(document: IDocument): IWebsiteItem {
    return {
      id: document.link || document.id,
      title: document.name || 'Untitled Document',
      rawUrl: document.link || '',
      documentId: document.id,
      domain: document.link || '',
    };
  }

  /**
   * Cache search result
   */
  private cacheResult(key: string, result: SearchResult): void {
    this.searchCache.set(key, result);

    // Manage cache size
    if (this.searchCache.size > this.MAX_CACHE_SIZE) {
      const firstKey = this.searchCache.keys().next().value;
      this.searchCache.delete(firstKey);
    }
  }

  /**
   * Check if cache entry is still valid
   */
  private isCacheValid(key: string): boolean {
    // For search results, we use a shorter TTL
    const entry = this.searchCache.get(key);
    return entry !== undefined; // Simple validity check for now
  }

  /**
   * Manage cache size to prevent memory bloat
   */
  private manageCacheSize(): void {
    if (this.indexCache.size > this.MAX_CACHE_SIZE) {
      // Remove oldest entries
      const entries = Array.from(this.lastIndexUpdate.entries());
      entries.sort((a, b) => a[1] - b[1]); // Sort by timestamp

      const toRemove = entries.slice(0, entries.length - this.MAX_CACHE_SIZE);
      for (const [key] of toRemove) {
        this.indexCache.delete(key);
        this.lastIndexUpdate.delete(key);
      }
    }
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.searchCache.clear();
    this.indexCache.clear();
    this.lastIndexUpdate.clear();
  }

  /**
   * Get cache statistics for monitoring
   */
  getCacheStats(): {
    searchCacheSize: number;
    indexCacheSize: number;
    lastUpdates: Record<string, number>;
  } {
    return {
      searchCacheSize: this.searchCache.size,
      indexCacheSize: this.indexCache.size,
      lastUpdates: Object.fromEntries(this.lastIndexUpdate),
    };
  }
}

// Export singleton instance
export const enhancedSearchIndex = new EnhancedSearchIndex();
