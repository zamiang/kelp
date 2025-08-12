# Enhanced Store System

This document explains how to utilize the new enhanced store features built on top of the `BaseStoreImpl` class.

## Overview

The enhanced store system provides:

- **Pagination**: Efficient loading of large datasets
- **Enhanced Error Handling**: Automatic retry with exponential backoff
- **Performance Monitoring**: Query time tracking and health metrics
- **Bulk Operations**: Optimized batch processing
- **Type Safety**: Full TypeScript support with proper error handling

## Quick Start

### 1. Basic Usage

```typescript
import EnhancedWebsiteStore from './models/enhanced-website-store';
import { QueryOptions } from './types/store-types';

// Initialize the store
const websiteStore = new EnhancedWebsiteStore(db);

// Load paginated data
const result = await websiteStore.getAll({
  limit: 20,
  offset: 0,
  orderBy: 'title',
  orderDirection: 'asc',
});

if (result.success) {
  const { data, total, hasMore, nextOffset } = result.data;
  console.log(`Loaded ${data.length} of ${total} websites`);
} else {
  console.error('Failed to load websites');
}
```

### 2. Error Handling Pattern

All enhanced store methods return a `StoreResult<T>` type:

```typescript
type StoreResult<T> = { success: true; data: T } | { success: false; error: DatabaseError };
```

Always check `result.success` before accessing `result.data`:

```typescript
const result = await store.getById('website-id');

if (result.success) {
  // TypeScript knows result.data is available
  console.log(result.data?.title);
} else {
  // Error details are automatically logged
  console.error('Operation failed');
}
```

## Key Features

### Pagination

Load large datasets efficiently without blocking the UI:

```typescript
const options: QueryOptions = {
  limit: 50, // Items per page
  offset: 0, // Starting position
  orderBy: 'title', // Sort field
  orderDirection: 'asc', // Sort direction
};

const result = await store.getAll(options);

if (result.success) {
  const { data, total, hasMore, nextOffset } = result.data;

  // Load next page
  if (hasMore) {
    const nextPage = await store.getAll({
      ...options,
      offset: nextOffset,
    });
  }
}
```

### Enhanced Error Handling

Automatic retry with exponential backoff and detailed error logging:

```typescript
// Automatically retries failed operations
const result = await store.getById('website-id');

// Errors include detailed context:
// - Error code and severity
// - Whether the operation is retryable
// - Context information for debugging
// - Automatic logging to ErrorTracking
```

### Performance Monitoring

Track query performance and identify bottlenecks:

```typescript
const health = await store.getHealth();

console.log({
  isHealthy: health.isHealthy,
  avgQueryTime: health.performance.avgQueryTime,
  slowQueries: health.performance.slowQueries,
  issues: health.issues,
});

// Set up monitoring alerts
if (!health.isHealthy) {
  health.issues.forEach((issue) => {
    console.warn(`Store issue: ${issue}`);
  });
}
```

### Bulk Operations

Optimize performance for large operations:

```typescript
// Bulk add
const websites = [
  { id: '1', title: 'Site 1', domain: 'site1.com', rawUrl: 'https://site1.com', tags: 'test' },
  { id: '2', title: 'Site 2', domain: 'site2.com', rawUrl: 'https://site2.com', tags: 'demo' },
];

const addResult = await store.addBulk(websites);

// Bulk delete
const deleteResult = await store.deleteBulk(['1', '2']);
```

## Advanced Usage

### Filtered Pagination

Combine pagination with filtering:

```typescript
const result = await websiteStore.getAllFiltered(domainBlocklistStore, websiteBlocklistStore, {
  limit: 20,
  offset: 0,
  orderBy: 'domain',
  orderDirection: 'asc',
});
```

### Health Monitoring Dashboard

Create a health monitoring component:

```typescript
const StoreHealthMonitor = () => {
  const [health, setHealth] = useState<StoreHealth>();

  useEffect(() => {
    const checkHealth = async () => {
      const storeHealth = await websiteStore.getHealth();
      setHealth(storeHealth);
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h3>Store Health</h3>
      <p>Status: {health?.isHealthy ? '✅ Healthy' : '⚠️ Issues Detected'}</p>
      <p>Avg Query Time: {health?.performance.avgQueryTime.toFixed(2)}ms</p>
      {health?.issues.map(issue => (
        <p key={issue} style={{ color: 'red' }}>⚠️ {issue}</p>
      ))}
    </div>
  );
};
```

### React Hook Pattern

Create reusable hooks for store operations:

```typescript
const useWebsites = (options: QueryOptions = {}) => {
  const [websites, setWebsites] = useState<IWebsiteItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadWebsites = useCallback(async () => {
    setLoading(true);
    setError(null);

    const result = await websiteStore.getAll(options);

    if (result.success) {
      setWebsites(result.data.data);
    } else {
      setError('Failed to load websites');
    }

    setLoading(false);
  }, [options]);

  useEffect(() => {
    loadWebsites();
  }, [loadWebsites]);

  return { websites, loading, error, refetch: loadWebsites };
};
```

## Migration Guide

### From Old Store to Enhanced Store

1. **Replace the store class**:

   ```typescript
   // Old
   import WebsiteItemModel from './models/website-item-model';
   const store = new WebsiteItemModel(db);

   // New
   import EnhancedWebsiteStore from './models/enhanced-website-store';
   const store = new EnhancedWebsiteStore(db);
   ```

2. **Update method calls**:

   ```typescript
   // Old - direct method calls
   const websites = await store.getAll(domainBlocklist, websiteBlocklist);

   // New - with result checking
   const result = await store.getAllFiltered(domainBlocklist, websiteBlocklist);
   if (result.success) {
     const websites = result.data.data;
   }
   ```

3. **Add pagination**:

   ```typescript
   // Old - load everything
   const websites = await store.getAll();

   // New - paginated loading
   const result = await store.getAll({ limit: 50, offset: 0 });
   ```

### Backward Compatibility

The enhanced store maintains backward compatibility:

- All existing methods are preserved
- Method signatures remain the same where possible
- New features are opt-in through new methods

## Performance Best Practices

### 1. Use Pagination

```typescript
// ❌ Don't load everything at once
const allWebsites = await store.getAll({ limit: 10000 });

// ✅ Use pagination
const firstPage = await store.getAll({ limit: 50, offset: 0 });
```

### 2. Monitor Performance

```typescript
// Set up regular health checks
setInterval(async () => {
  const health = await store.getHealth();
  if (health.performance.avgQueryTime > 1000) {
    console.warn('Store performance degraded');
  }
}, 60000);
```

### 3. Use Bulk Operations

```typescript
// ❌ Individual operations
for (const item of items) {
  await store.add(item);
}

// ✅ Bulk operations
await store.addBulk(items);
```

### 4. Handle Errors Gracefully

```typescript
// ❌ Assume success
const result = await store.getById(id);
const title = result.data.title; // Could crash

// ✅ Check results
const result = await store.getById(id);
if (result.success && result.data) {
  const title = result.data.title;
}
```

## Troubleshooting

### Common Issues

1. **TypeScript Errors with StoreResult**

   ```typescript
   // ❌ Wrong
   if (!result.success) {
     console.error(result.error); // TypeScript error
   }

   // ✅ Correct
   if (!result.success) {
     console.error('Operation failed'); // Error details auto-logged
   }
   ```

2. **Performance Issues**

   ```typescript
   // Check store health
   const health = await store.getHealth();
   console.log('Performance issues:', health.issues);
   ```

3. **Memory Usage**
   ```typescript
   // Regular cleanup
   await store.cleanup();
   ```

### Debug Mode

Enable detailed logging:

```typescript
// Error details are automatically logged to ErrorTracking
// Check browser console for detailed error information
```

## Examples

See `components/store/examples/enhanced-store-usage.ts` for comprehensive examples of all features.

## API Reference

### BaseStoreImpl Methods

- `getAll(options?: QueryOptions): Promise<StoreResult<PaginatedResult<T>>>`
- `getById(id: string): Promise<StoreResult<T | undefined>>`
- `add(item: T): Promise<StoreResult<void>>`
- `update(id: string, updates: Partial<T>): Promise<StoreResult<void>>`
- `delete(id: string): Promise<StoreResult<void>>`
- `addBulk(items: T[]): Promise<StoreResult<void>>`
- `cleanup(): Promise<StoreResult<void>>`
- `getHealth(): Promise<StoreHealth>`

### EnhancedWebsiteStore Additional Methods

- `getAllFiltered(domainBlocklist, websiteBlocklist, options?): Promise<StoreResult<PaginatedResult<IWebsiteItem>>>`
- `getByDomain(domain: string): Promise<StoreResult<IWebsiteItem[]>>`
- `trackVisit(website, tag?): Promise<StoreResult<IWebsiteItem>>`
- `updateTags(id: string, tags: string): Promise<StoreResult<IWebsiteItem | undefined>>`
- `moveToFront(id: string): Promise<StoreResult<IWebsiteItem | undefined>>`

### Types

```typescript
interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

interface PaginatedResult<T> {
  data: T[];
  total: number;
  hasMore: boolean;
  nextOffset?: number;
}

interface StoreHealth {
  isHealthy: boolean;
  lastChecked: Date;
  issues: string[];
  performance: {
    avgQueryTime: number;
    slowQueries: number;
  };
}
```
