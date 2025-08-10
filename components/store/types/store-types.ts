/**
 * Enhanced type definitions for the store system
 * Provides better type safety and eliminates 'any' usage
 */

export interface DatabaseError extends Error {
  code?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: Record<string, unknown>;
  retryable: boolean;
}

export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  hasMore: boolean;
  nextOffset?: number;
}

export interface StoreHealth {
  isHealthy: boolean;
  lastChecked: Date;
  issues: string[];
  performance: {
    avgQueryTime: number;
    slowQueries: number;
  };
}

export interface TransactionContext {
  id: string;
  startTime: Date;
  operations: string[];
  rollbackHandlers: (() => Promise<void>)[];
}

// Enhanced loading states
export interface LoadingState {
  isLoading: boolean;
  operation?: string;
  progress?: number;
  estimatedTimeRemaining?: number;
}

// Store operation results
export type StoreResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: DatabaseError;
    };

// Generic store interface for consistency
export interface BaseStore<T> {
  getAll(options?: QueryOptions): Promise<StoreResult<PaginatedResult<T>>>;
  getById(id: string): Promise<StoreResult<T | undefined>>;
  add(item: T): Promise<StoreResult<void>>;
  update(id: string, updates: Partial<T>): Promise<StoreResult<void>>;
  delete(id: string): Promise<StoreResult<void>>;
  cleanup(): Promise<StoreResult<void>>;
  getHealth(): Promise<StoreHealth>;
}
