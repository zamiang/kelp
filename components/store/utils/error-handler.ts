import ErrorTracking from '../../error-tracking/error-tracking';
import { DatabaseError, RetryConfig } from '../types/store-types';

/**
 * Enhanced error handling utilities for the store system
 */

export class StoreError extends Error implements DatabaseError {
  code?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: Record<string, unknown>;
  retryable: boolean;

  constructor(
    message: string,
    options: {
      code?: string;
      severity?: 'low' | 'medium' | 'high' | 'critical';
      context?: Record<string, unknown>;
      retryable?: boolean;
      cause?: Error;
    } = {},
  ) {
    super(message);
    this.name = 'StoreError';
    this.code = options.code;
    this.severity = options.severity || 'medium';
    this.context = options.context;
    this.retryable = options.retryable ?? true;

    if (options.cause) {
      this.cause = options.cause;
    }
  }
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 100,
  maxDelay: 5000,
  backoffMultiplier: 2,
};

/**
 * Retry mechanism with exponential backoff
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {},
  operationName = 'unknown',
): Promise<T> {
  const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: Error;

  for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
    try {
      const result = await operation();
      return result;
    } catch (error) {
      lastError = error as Error;

      // Don't retry if it's not a retryable error
      if (error instanceof StoreError && !error.retryable) {
        throw error;
      }

      // Don't retry on the last attempt
      if (attempt === finalConfig.maxAttempts) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        finalConfig.baseDelay * Math.pow(finalConfig.backoffMultiplier, attempt - 1),
        finalConfig.maxDelay,
      );

      console.warn(
        `Operation "${operationName}" failed (attempt ${attempt}/${finalConfig.maxAttempts}). Retrying in ${delay}ms...`,
        error,
      );

      // Use a properly handled delay promise
      await new Promise<void>((resolve) => {
        setTimeout(() => resolve(), delay);
      });
    }
  }

  // Log the final failure
  const finalError = new StoreError(
    `Operation "${operationName}" failed after ${finalConfig.maxAttempts} attempts`,
    {
      code: 'RETRY_EXHAUSTED',
      severity: 'high',
      context: { operationName, attempts: finalConfig.maxAttempts },
      retryable: false,
      cause: lastError,
    },
  );

  ErrorTracking.logError(finalError);
  throw finalError;
}

/**
 * Safe wrapper that converts errors to StoreResult format
 */
export async function safeOperation<T>(
  operation: () => Promise<T>,
  operationName = 'unknown',
): Promise<{ success: true; data: T } | { success: false; error: DatabaseError }> {
  try {
    const data = await operation();
    return { success: true, data };
  } catch (error) {
    const storeError =
      error instanceof StoreError
        ? error
        : new StoreError(`Operation "${operationName}" failed`, {
            code: 'OPERATION_FAILED',
            severity: 'medium',
            context: { operationName },
            cause: error as Error,
          });

    ErrorTracking.logError(storeError);
    return { success: false, error: storeError };
  }
}

// /**
//  * Database health checker
//  */
// export async function checkDatabaseHealth(db: IDBDatabase): Promise<{
//   isHealthy: boolean;
//   issues: string[];
//   performance: { avgQueryTime: number; slowQueries: number };
// }> {
//   const issues: string[] = [];
//   const performanceMetrics = { avgQueryTime: 0, slowQueries: 0 };

//   try {
//     // Test basic connectivity
//     const startTime = performance.now();
//     const transaction = db.transaction(db.objectStoreNames[0], 'readonly');
//     const store = transaction.objectStore(db.objectStoreNames[0]);

//     // Test a simple count operation
//     await new Promise((resolve, reject) => {
//       const request = store.count();
//       request.onsuccess = () => resolve(request.result);
//       request.onerror = () => reject(request.error);
//     });

//     const queryTime = performance.now() - startTime;
//     performanceMetrics.avgQueryTime = queryTime;

//     if (queryTime > 1000) {
//       issues.push('Slow database response time');
//       performanceMetrics.slowQueries = 1;
//     }

//     // Check for quota issues
//     if (navigator.storage && navigator.storage.estimate) {
//       const estimate = await navigator.storage.estimate();
//       const usageRatio = (estimate.usage || 0) / (estimate.quota || 1);

//       if (usageRatio > 0.9) {
//         issues.push('Storage quota nearly exceeded');
//       }
//     }
//   } catch (error) {
//     issues.push(`Database connectivity test failed: ${(error as Error).message}`);
//   }

//   return {
//     isHealthy: issues.length === 0,
//     issues,
//     performance: performanceMetrics,
//   };
// }

/**
 * Graceful database corruption recovery
 */
export async function handleDatabaseCorruption(
  dbName: string,
  version: number,
  onRecovery?: () => Promise<void>,
): Promise<void> {
  console.warn(`Attempting to recover from database corruption: ${dbName}`);

  try {
    // Close any existing connections
    // Note: This is a simplified approach - in practice you'd want to track connections

    // Delete the corrupted database
    await new Promise<void>((resolve, reject) => {
      const deleteRequest = indexedDB.deleteDatabase(dbName);
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
      deleteRequest.onblocked = () => {
        console.warn('Database deletion blocked - some connections may still be open');
        setTimeout(() => resolve(), 1000); // Give it a moment and continue
      };
    });

    console.log(`Successfully deleted corrupted database: ${dbName}`);

    // Trigger recovery callback if provided
    if (onRecovery) {
      await onRecovery();
    }
  } catch (error) {
    throw new StoreError('Failed to recover from database corruption', {
      code: 'RECOVERY_FAILED',
      severity: 'critical',
      context: { dbName, version },
      retryable: false,
      cause: error as Error,
    });
  }
}
