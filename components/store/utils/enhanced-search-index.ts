import { IDocument, IPerson, ISegment, IWebsiteItem } from '../data-types';
import { IStore } from '../use-store';
import { safeOperation } from './error-handler';

export interface ISearchItem {
  text: string;
  type: 'segment' | 'document' | 'person' | 'website';
  item: IPerson | ISegment | IDocument | IWebsiteItem;
  score?: number;
}

interface SearchOptions {
  limit?: number;
  offset?: number;
  types?: Array<'segment' | 'document' | 'person' | 'website'>;
  minScore?: number;
}

interface SearchResult {
  items: ISearchItem[];
  total: number;
  hasMore: boolean;
  nextOffset?: number;
}

/**
 * Enhanced search index with lazy loading, caching, and better performance
 */
class EnhancedSearchIndex {
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
          const websitesResult = await store.websiteStore.getAll();
          if (websitesResult.success) {
            websitesResult.data.data.forEach((website: IWebsiteItem) => {
              items.push({
                text: website.title.toLowerCase(),
                type: 'website',
                item: website,
              });
            });
          }
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
      return items.map((item) => ({ ...item, score: 1 }));
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
    let totalScore = 0;
    const textLength = text.length;
    const fullQuery = queryTerms.join(' ');

    // Check for exact match of full query first
    if (text === fullQuery) {
      return 1.0;
    }

    // Check if text contains the full query as a phrase
    if (text.includes(fullQuery)) {
      totalScore += 0.9;
    }

    // Score individual terms
    for (const term of queryTerms) {
      let termScore = 0;

      // Exact match bonus (only if the entire text matches the term exactly)
      if (text === term) {
        termScore = 1.0;
      }
      // Starts with bonus (but not exact match)
      else if (text.startsWith(term) && text !== term) {
        termScore = 0.8;
      }
      // Contains term (but not exact match or starts with)
      else if (text.includes(term) && !text.startsWith(term) && text !== term) {
        const index = text.indexOf(term);
        // Earlier matches score higher
        const positionScore = 1 - index / textLength;
        // Longer matches score higher relative to text length
        const lengthScore = Math.min(term.length / textLength, 1);
        termScore = 0.6 * positionScore * (0.5 + 0.5 * lengthScore);
      }
      // Fuzzy matching for typos
      else if (term.length > 3 && this.fuzzyMatch(text, term)) {
        termScore = 0.3;
      }

      totalScore += termScore;
    }

    // Average the score across all terms, but give bonus for matching more terms
    const averageScore = totalScore / queryTerms.length;
    const matchedTerms = queryTerms.filter(
      (term) => text.includes(term) || (term.length > 3 && this.fuzzyMatch(text, term)),
    ).length;
    const completenessBonus = matchedTerms / queryTerms.length;

    // Ensure partial matches never get a perfect score
    const finalScore = averageScore * (0.7 + 0.3 * completenessBonus);

    // If it's not an exact match of the full query or any individual term, cap at 0.95
    const isExactMatch = text === fullQuery || queryTerms.some((term) => text === term);
    if (!isExactMatch) {
      return Math.min(finalScore, 0.95);
    }

    return Math.min(finalScore, 1.0);
  }

  /**
   * Simple fuzzy matching for typos
   */
  private fuzzyMatch(text: string, term: string): boolean {
    // For short terms, require exact match
    if (term.length <= 3) {
      return false;
    }

    // Split text into words and check each word
    const words = text.split(/\s+/);

    for (const word of words) {
      // Check if this word is similar to the term
      if (this.editDistance(word, term) <= 1) {
        return true;
      }
    }

    // Also check if the term could match with one character insertion/deletion in the whole text
    if (Math.abs(text.length - term.length) <= 1) {
      return this.editDistance(text, term) <= 1;
    }

    // Try to find the term within the text allowing for one edit
    for (let i = 0; i <= text.length - term.length + 1; i++) {
      const substring = text.substring(i, i + term.length);
      if (this.editDistance(substring, term) <= 1) {
        return true;
      }
    }

    return false;
  }

  /**
   * Calculate edit distance (Levenshtein distance) between two strings
   */
  private editDistance(str1: string, str2: string): number {
    const m = str1.length;
    const n = str2.length;

    // Create a matrix to store distances
    const dp: number[][] = Array(m + 1)
      .fill(null)
      .map(() => Array(n + 1).fill(0));

    // Initialize base cases
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    // Fill the matrix
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] =
            1 +
            Math.min(
              dp[i - 1][j], // deletion
              dp[i][j - 1], // insertion
              dp[i - 1][j - 1], // substitution
            );
        }
      }
    }

    return dp[m][n];
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

// Also export the class for testing
export { EnhancedSearchIndex };
