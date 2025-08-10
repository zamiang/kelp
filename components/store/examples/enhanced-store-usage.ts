/**
 * Examples demonstrating how to use the new enhanced store features
 * This file shows practical usage patterns for the BaseStoreImpl functionality
 */

import { QueryOptions } from '../types/store-types';
import EnhancedWebsiteStore from '../models/enhanced-website-store';
import { dbType } from '../db';

/**
 * Example usage of the enhanced WebsiteStore features
 */
export class EnhancedStoreUsageExamples {
  private websiteStore: EnhancedWebsiteStore;

  constructor(db: dbType) {
    this.websiteStore = new EnhancedWebsiteStore(db);
  }

  /**
   * Example 1: Using pagination to load websites in chunks
   */
  async loadWebsitesPaginated() {
    console.log('=== Pagination Example ===');

    // Load first page of 20 websites, sorted by title
    const options: QueryOptions = {
      limit: 20,
      offset: 0,
      orderBy: 'title',
      orderDirection: 'asc',
    };

    const result = await this.websiteStore.getAll(options);

    if (result.success) {
      const { data, total, hasMore, nextOffset } = result.data;
      console.log(`Loaded ${data.length} websites out of ${total} total`);
      console.log(`Has more pages: ${hasMore}`);
      console.log(`Next offset: ${nextOffset}`);

      // Load next page if available
      if (hasMore && nextOffset) {
        const nextPageResult = await this.websiteStore.getAll({
          ...options,
          offset: nextOffset,
        });

        if (nextPageResult.success) {
          console.log(`Next page loaded: ${nextPageResult.data.data.length} items`);
        }
      }
    } else {
      console.error('Failed to load websites - check logs for details');
    }
  }

  /**
   * Example 2: Using filtered pagination with blocklists
   */
  async loadFilteredWebsites(domainBlocklistStore: any, websiteBlocklistStore: any) {
    console.log('=== Filtered Pagination Example ===');

    const options: QueryOptions = {
      limit: 50,
      offset: 0,
      orderBy: 'domain',
      orderDirection: 'asc',
    };

    const result = await this.websiteStore.getAllFiltered(
      domainBlocklistStore,
      websiteBlocklistStore,
      options,
    );

    if (result.success) {
      console.log(`Loaded ${result.data.data.length} filtered websites`);
      console.log(`Total after filtering: ${result.data.total}`);
    } else {
      console.error('Failed to load filtered websites - check logs for details');
    }
  }

  /**
   * Example 3: Enhanced error handling with automatic retry
   */
  async demonstrateErrorHandling() {
    console.log('=== Error Handling Example ===');

    // This will automatically retry on failure and provide detailed error info
    const result = await this.websiteStore.getById('some-website-id');

    if (result.success) {
      console.log('Website found:', result.data?.title);
    } else {
      // The error details are automatically logged by the error handler
      console.error('Operation failed - detailed error information logged');
    }
  }

  /**
   * Example 4: Bulk operations for better performance
   */
  async demonstrateBulkOperations() {
    console.log('=== Bulk Operations Example ===');

    // Bulk add multiple websites
    const websites = [
      {
        id: 'example1.com',
        title: 'Example 1',
        domain: 'example1.com',
        rawUrl: 'https://example1.com',
        tags: 'example test',
      },
      {
        id: 'example2.com',
        title: 'Example 2',
        domain: 'example2.com',
        rawUrl: 'https://example2.com',
        tags: 'example demo',
      },
    ];

    const bulkAddResult = await this.websiteStore.addBulk(websites);

    if (bulkAddResult.success) {
      console.log('Bulk add completed successfully');

      // Bulk delete
      const bulkDeleteResult = await this.websiteStore.deleteBulk(['example1.com', 'example2.com']);

      if (bulkDeleteResult.success) {
        console.log('Bulk delete completed successfully');
      }
    }
  }

  /**
   * Example 5: Health monitoring and performance tracking
   */
  async monitorStoreHealth() {
    console.log('=== Health Monitoring Example ===');

    // Get store health metrics
    const health = await this.websiteStore.getHealth();

    console.log('Store Health Report:', {
      isHealthy: health.isHealthy,
      lastChecked: health.lastChecked,
      issues: health.issues,
      performance: {
        avgQueryTime: `${health.performance.avgQueryTime.toFixed(2)}ms`,
        slowQueries: health.performance.slowQueries,
      },
    });

    // Health monitoring alerts
    if (!health.isHealthy) {
      console.warn('⚠️ Store health issues detected:');
      health.issues.forEach((issue) => console.warn(`  - ${issue}`));
    }

    if (health.performance.avgQueryTime > 500) {
      console.warn('⚠️ Performance warning: Average query time is high');
    }
  }

  /**
   * Example 6: Enhanced visit tracking with error handling
   */
  async trackWebsiteVisit() {
    console.log('=== Enhanced Visit Tracking Example ===');

    const websiteData = {
      domain: 'example.com',
      pathname: '/page',
      url: 'https://example.com/page',
      title: 'Example Page',
      description: 'An example page for demonstration',
    };

    const result = await this.websiteStore.trackVisit(websiteData, 'demo');

    if (result.success) {
      console.log('Visit tracked successfully:', result.data.title);
    } else {
      console.error('Failed to track visit - check logs for details');
    }
  }

  /**
   * Example 7: Store cleanup with performance monitoring
   */
  async performStoreCleanup() {
    console.log('=== Store Cleanup Example ===');

    const cleanupResult = await this.websiteStore.cleanup();

    if (cleanupResult.success) {
      console.log('Store cleanup completed successfully');
    } else {
      console.error('Cleanup failed - check logs for details');
    }
  }

  /**
   * Example 8: Domain-based queries with enhanced error handling
   */
  async queryByDomain() {
    console.log('=== Domain Query Example ===');

    const result = await this.websiteStore.getByDomain('example.com');

    if (result.success) {
      console.log(`Found ${result.data.length} websites for domain example.com`);
      result.data.forEach((website) => {
        console.log(`  - ${website.title} (${website.rawUrl})`);
      });
    } else {
      console.error('Domain query failed - check logs for details');
    }
  }

  /**
   * Example 9: Comprehensive usage pattern
   */
  async comprehensiveExample(domainBlocklistStore: any, websiteBlocklistStore: any) {
    console.log('=== Comprehensive Usage Example ===');

    try {
      // 1. Check store health first
      const health = await this.websiteStore.getHealth();
      if (!health.isHealthy) {
        console.warn('Store health issues detected, proceeding with caution');
      }

      // 2. Load paginated, filtered data
      const websitesResult = await this.websiteStore.getAllFiltered(
        domainBlocklistStore,
        websiteBlocklistStore,
        {
          limit: 10,
          offset: 0,
          orderBy: 'title',
          orderDirection: 'asc',
        },
      );

      if (websitesResult.success) {
        console.log(`Loaded ${websitesResult.data.data.length} websites`);

        // 3. Process each website with error handling
        for (const website of websitesResult.data.data) {
          const updateResult = await this.websiteStore.updateTags(
            website.id,
            `${website.tags} processed`,
          );

          if (updateResult.success && updateResult.data) {
            console.log(`Updated tags for: ${updateResult.data.title}`);
          }
        }

        // 4. Perform cleanup if needed
        if (websitesResult.data.total > 1000) {
          console.log('Large dataset detected, performing cleanup...');
          await this.websiteStore.cleanup();
        }
      }

      // 5. Final health check
      const finalHealth = await this.websiteStore.getHealth();
      console.log('Final performance metrics:', finalHealth.performance);
    } catch (error) {
      console.error('Comprehensive example failed:', error);
    }
  }
}

/**
 * Usage in React components
 */
export const useEnhancedWebsiteStore = () => {
  // Example React hook pattern
  const handleLoadWebsites = async (store: EnhancedWebsiteStore, options: QueryOptions = {}) => {
    const result = await store.getAll(options);

    if (result.success) {
      return {
        websites: result.data.data,
        total: result.data.total,
        hasMore: result.data.hasMore,
        nextOffset: result.data.nextOffset,
      };
    } else {
      // Handle error appropriately in UI
      throw new Error('Failed to load websites - check console for details');
    }
  };

  const handleStoreHealth = async (store: EnhancedWebsiteStore) => {
    const health = await store.getHealth();

    return {
      isHealthy: health.isHealthy,
      issues: health.issues,
      avgQueryTime: health.performance.avgQueryTime,
      slowQueries: health.performance.slowQueries,
    };
  };

  return {
    handleLoadWebsites,
    handleStoreHealth,
  };
};

/**
 * Key Benefits Summary:
 *
 * 1. **Pagination**: Load large datasets efficiently with built-in pagination
 * 2. **Error Handling**: Automatic retry with exponential backoff and detailed error logging
 * 3. **Performance Monitoring**: Track query times and identify performance issues
 * 4. **Health Monitoring**: Monitor store health and get alerts for issues
 * 5. **Bulk Operations**: Efficient batch processing for large operations
 * 6. **Type Safety**: Full TypeScript support with proper error handling
 * 7. **Backward Compatibility**: All existing functionality preserved
 *
 * Usage Tips:
 * - Always check result.success before accessing result.data
 * - Use pagination for large datasets to prevent UI freezing
 * - Monitor store health regularly in production
 * - Use bulk operations for better performance when processing many items
 * - Error details are automatically logged - check console for debugging
 */
