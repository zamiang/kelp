import Tfidf from '../../shared/tfidf';
import { IWebsite } from '../data-types';
import { dbType } from '../db';
import { IStore } from '../use-store';
import { BaseStoreImpl } from './base-store';
import { PaginatedResult, QueryOptions, StoreResult } from '../types/store-types';
import { safeOperation } from '../utils/error-handler';

/**
 * Type guard to check if a StoreResult is a failure
 */
function isFailure<T>(result: StoreResult<T>): result is { success: false; error: any } {
  return !result.success;
}

/**
 * Used so that a person's unique first+last name combo makes it through TFIDF and common first or last names are not misrepresented
 */
export const uncommonPunctuation = 'æ';

export interface ITfidfRow {
  id: string;
  key: string;
  text: string;
  type: 'website' | 'meeting';
}

export interface ITfidfTag {
  term: string;
  tfidf: number;
}

export interface ITfidfCache {
  tfidf: Tfidf;
  lastUpdated: Date;
  documentCount: number;
  invalidated: boolean;
}

export interface ITfidfStats {
  totalDocuments: number;
  totalTerms: number;
  avgDocumentLength: number;
  cacheHitRate: number;
  lastComputationTime: number;
}

/**
 * Enhanced TfidfStore that extends BaseStoreImpl
 * Provides proper error handling, performance monitoring, and caching
 */
export default class EnhancedTfidfStore extends BaseStoreImpl<ITfidfRow> {
  private cache: ITfidfCache | null = null;
  private cacheHits = 0;
  private cacheMisses = 0;

  constructor(db: dbType) {
    super(db, 'tfidfDocument');
  }

  /**
   * Override to specify valid sort fields for TF-IDF documents
   */
  protected isValidSortField(field: string): boolean {
    return ['id', 'key', 'type'].includes(field);
  }

  /**
   * Get TF-IDF instance with enhanced caching and error handling
   */
  async getTfidf(store: IStore): Promise<StoreResult<Tfidf>> {
    return safeOperation(async () => {
      const startTime = performance.now();

      try {
        // Check if cache is valid
        if (this.cache && !this.cache.invalidated) {
          this.cacheHits++;
          this.recordQueryTime(performance.now() - startTime);
          return this.cache.tfidf;
        }

        // Get fresh documents
        const documentsResult = await this.getDocuments(store);
        if (isFailure(documentsResult)) {
          throw documentsResult.error;
        }

        const documents = documentsResult.data;
        const tfidf = new Tfidf(documents);

        // Update cache
        this.cache = {
          tfidf,
          lastUpdated: new Date(),
          documentCount: documents.length,
          invalidated: false,
        };

        this.cacheMisses++;
        this.recordQueryTime(performance.now() - startTime);
        return tfidf;
      } catch (error) {
        this.performanceMetrics.errorCount++;
        throw error;
      }
    }, 'getTfidf-tfidf');
  }

  /**
   * Get TF-IDF for specific documents with enhanced error handling
   */
  async getTfidfForDocuments(data: ITfidfRow[]): Promise<StoreResult<Tfidf>> {
    return safeOperation(async () => {
      const startTime = performance.now();

      try {
        const formattedData = data.map((row) => ({
          text: row.text,
          key: row.key,
        }));

        const tfidf = new Tfidf(formattedData);
        this.recordQueryTime(performance.now() - startTime);
        return tfidf;
      } catch (error) {
        this.performanceMetrics.errorCount++;
        throw error;
      }
    }, 'getTfidfForDocuments-tfidf');
  }

  /**
   * Get calculated documents with enhanced error handling
   */
  async getCalculatedDocuments(): Promise<StoreResult<string[]>> {
    return safeOperation(async () => {
      const startTime = performance.now();

      try {
        if (!this.cache || this.cache.invalidated) {
          return [];
        }

        const terms = this.cache.tfidf.listTerms();
        this.recordQueryTime(performance.now() - startTime);
        return terms;
      } catch (error) {
        this.performanceMetrics.errorCount++;
        throw error;
      }
    }, 'getCalculatedDocuments-tfidf');
  }

  /**
   * Get documents for websites with enhanced error handling
   */
  async getDocumentsForWebsites(websites: IWebsite[]): Promise<StoreResult<ITfidfRow[]>> {
    return safeOperation(async () => {
      const startTime = performance.now();

      try {
        const documents = websites.map((website): ITfidfRow => {
          const text = `${website.title || ''} ${website.description || ''}`;
          return {
            id: `websites-${website.id}`,
            key: text,
            type: 'website',
            text,
          };
        });

        this.recordQueryTime(performance.now() - startTime);
        return documents;
      } catch (error) {
        this.performanceMetrics.errorCount++;
        throw error;
      }
    }, 'getDocumentsForWebsites-tfidf');
  }

  /**
   * Get all documents with enhanced error handling and filtering
   */
  async getDocuments(store: IStore): Promise<StoreResult<{ text: string; key: string }[]>> {
    return safeOperation(async () => {
      const startTime = performance.now();

      try {
        // Get websites with proper error handling
        const websitesResult = await store.websiteStore.getAllFiltered(
          store.domainBlocklistStore,
          store.websiteBlocklistStore,
        );
        if (isFailure(websitesResult)) {
          throw websitesResult.error;
        }
        const websitesList = websitesResult.data.data;

        // Get meetings with proper error handling
        const segments = await store.timeDataStore.getAll();

        // Format website documents
        const websiteDocuments = websitesList.map((website) => {
          const text = `${website.title || ''} ${website.description || ''}`;
          return {
            text,
            key: text,
          };
        });

        // Format meeting documents
        const meetingDocuments = segments
          .filter((segment) => segment.summary)
          .map((segment) => ({
            text: segment.summary!,
            key: segment.summary!,
          }));

        const allDocuments = websiteDocuments.concat(meetingDocuments);
        this.recordQueryTime(performance.now() - startTime);
        return allDocuments;
      } catch (error) {
        this.performanceMetrics.errorCount++;
        throw error;
      }
    }, 'getDocuments-tfidf');
  }

  /**
   * Bulk process documents with enhanced error handling
   */
  async bulkProcessDocuments(
    documents: ITfidfRow[],
    options: QueryOptions = {},
  ): Promise<StoreResult<PaginatedResult<ITfidfTag>>> {
    return safeOperation(async () => {
      const startTime = performance.now();

      try {
        const { limit = 50, offset = 0 } = options;

        // Get TF-IDF for documents
        const tfidfResult = await this.getTfidfForDocuments(documents);
        if (isFailure(tfidfResult)) {
          throw tfidfResult.error;
        }

        const tfidf = tfidfResult.data;
        const allTerms = tfidf.listTermsWithValue(1000); // Get more terms for pagination

        // Apply pagination
        const paginatedTerms = allTerms.slice(offset, offset + limit);
        const hasMore = offset + limit < allTerms.length;

        const result: PaginatedResult<ITfidfTag> = {
          data: paginatedTerms,
          total: allTerms.length,
          hasMore,
          nextOffset: hasMore ? offset + limit : undefined,
        };

        this.recordQueryTime(performance.now() - startTime);
        return result;
      } catch (error) {
        this.performanceMetrics.errorCount++;
        throw error;
      }
    }, 'bulkProcessDocuments-tfidf');
  }

  /**
   * Invalidate cache with enhanced error handling
   */
  async invalidateCache(): Promise<StoreResult<void>> {
    return safeOperation(async () => {
      const startTime = performance.now();

      try {
        if (this.cache) {
          this.cache.invalidated = true;
        }

        // Reset cache statistics
        this.cacheHits = 0;
        this.cacheMisses = 0;

        this.recordQueryTime(performance.now() - startTime);
        console.log('TF-IDF cache invalidated');
      } catch (error) {
        this.performanceMetrics.errorCount++;
        throw error;
      }
    }, 'invalidateCache-tfidf');
  }

  /**
   * Get TF-IDF statistics with enhanced error handling
   */
  async getDocumentStats(): Promise<StoreResult<ITfidfStats>> {
    return safeOperation(async () => {
      const startTime = performance.now();

      try {
        const totalRequests = this.cacheHits + this.cacheMisses;
        const cacheHitRate = totalRequests > 0 ? this.cacheHits / totalRequests : 0;

        const stats: ITfidfStats = {
          totalDocuments: this.cache?.documentCount || 0,
          totalTerms: this.cache ? this.cache.tfidf.listTerms().length : 0,
          avgDocumentLength: 0, // Could be calculated if needed
          cacheHitRate,
          lastComputationTime: this.performanceMetrics.queryTimes.slice(-1)[0] || 0,
        };

        this.recordQueryTime(performance.now() - startTime);
        return stats;
      } catch (error) {
        this.performanceMetrics.errorCount++;
        throw error;
      }
    }, 'getDocumentStats-tfidf');
  }

  /**
   * Enhanced cleanup with cache management
   */
  async cleanup(): Promise<StoreResult<void>> {
    return safeOperation(async () => {
      const startTime = performance.now();

      try {
        // Clear cache if it's old (older than 1 hour)
        if (this.cache) {
          const cacheAge = Date.now() - this.cache.lastUpdated.getTime();
          const maxCacheAge = 60 * 60 * 1000; // 1 hour

          if (cacheAge > maxCacheAge) {
            this.cache = null;
            console.log('Cleared old TF-IDF cache');
          }
        }

        // Reset performance metrics if they're getting too large
        if (this.performanceMetrics.queryTimes.length > 1000) {
          this.performanceMetrics.queryTimes = this.performanceMetrics.queryTimes.slice(-100);
        }

        this.recordQueryTime(performance.now() - startTime);
      } catch (error) {
        this.performanceMetrics.errorCount++;
        throw error;
      }
    }, 'cleanup-tfidf');
  }

  /**
   * Get terms with TF-IDF values with enhanced error handling
   */
  async getTermsWithValues(store: IStore, maxTerms = 20): Promise<StoreResult<ITfidfTag[]>> {
    return safeOperation(async () => {
      const startTime = performance.now();

      try {
        const tfidfResult = await this.getTfidf(store);
        if (isFailure(tfidfResult)) {
          throw tfidfResult.error;
        }

        const tfidf = tfidfResult.data;
        const terms = tfidf.listTermsWithValue(maxTerms);

        this.recordQueryTime(performance.now() - startTime);
        return terms;
      } catch (error) {
        this.performanceMetrics.errorCount++;
        throw error;
      }
    }, 'getTermsWithValues-tfidf');
  }

  /**
   * Search terms with TF-IDF scoring
   */
  async searchTerms(
    store: IStore,
    query: string,
  ): Promise<StoreResult<{ term: string; value: number }[]>> {
    return safeOperation(async () => {
      const startTime = performance.now();

      try {
        const tfidfResult = await this.getTfidf(store);
        if (isFailure(tfidfResult)) {
          throw tfidfResult.error;
        }

        const tfidf = tfidfResult.data;
        const results = tfidf.tfidfs(query);

        this.recordQueryTime(performance.now() - startTime);
        return results;
      } catch (error) {
        this.performanceMetrics.errorCount++;
        throw error;
      }
    }, 'searchTerms-tfidf');
  }

  /**
   * Refresh cache with new data
   */
  async refreshCache(store: IStore): Promise<StoreResult<void>> {
    return safeOperation(async () => {
      const startTime = performance.now();

      try {
        // Invalidate current cache
        const invalidateResult = await this.invalidateCache();
        if (isFailure(invalidateResult)) {
          throw invalidateResult.error;
        }

        // Force refresh by getting new TF-IDF
        const tfidfResult = await this.getTfidf(store);
        if (isFailure(tfidfResult)) {
          throw tfidfResult.error;
        }

        this.recordQueryTime(performance.now() - startTime);
        console.log('TF-IDF cache refreshed successfully');
      } catch (error) {
        this.performanceMetrics.errorCount++;
        throw error;
      }
    }, 'refreshCache-tfidf');
  }
}
