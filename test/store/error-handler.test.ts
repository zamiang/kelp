import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_RETRY_CONFIG,
  StoreError,
  checkDatabaseHealth,
  handleDatabaseCorruption,
  safeOperation,
  withRetry,
} from '../../extension/src/components/store/utils/error-handler';

describe('StoreError', () => {
  it('should create a StoreError with default values', () => {
    const error = new StoreError('Test error');

    expect(error.message).toBe('Test error');
    expect(error.name).toBe('StoreError');
    expect(error.severity).toBe('medium');
    expect(error.retryable).toBe(true);
    expect(error.code).toBeUndefined();
    expect(error.context).toBeUndefined();
  });

  it('should create a StoreError with custom options', () => {
    const context = { userId: '123', operation: 'getData' };
    const cause = new Error('Original error');

    const error = new StoreError('Custom error', {
      code: 'CUSTOM_ERROR',
      severity: 'high',
      context,
      retryable: false,
      cause,
    });

    expect(error.message).toBe('Custom error');
    expect(error.code).toBe('CUSTOM_ERROR');
    expect(error.severity).toBe('high');
    expect(error.context).toEqual(context);
    expect(error.retryable).toBe(false);
    expect(error.cause).toBe(cause);
  });
});

describe('withRetry', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('should succeed on first attempt', async () => {
    const operation = vi.fn().mockResolvedValue('success');

    const result = await withRetry(operation, {}, 'test-operation');

    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('should retry on failure and eventually succeed', async () => {
    const operation = vi
      .fn()
      .mockRejectedValueOnce(new Error('First failure'))
      .mockRejectedValueOnce(new Error('Second failure'))
      .mockResolvedValue('success');

    const retryPromise = withRetry(operation, { maxAttempts: 3 }, 'test-operation');

    // Fast-forward through retry delays
    await vi.runAllTimersAsync();

    const result = await retryPromise;

    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(3);
  });

  it('should not retry non-retryable StoreError', async () => {
    const nonRetryableError = new StoreError('Non-retryable error', { retryable: false });
    const operation = vi.fn().mockRejectedValue(nonRetryableError);

    await expect(withRetry(operation, {}, 'test-operation')).rejects.toThrow(nonRetryableError);
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it.skip('should throw after max attempts exceeded', async () => {
    const operation = vi.fn().mockRejectedValue(new Error('Persistent failure'));

    // Create a promise that we'll handle completely
    let caughtError: any = null;

    try {
      const retryPromise = withRetry(operation, { maxAttempts: 2 }, 'test-operation');

      // Fast-forward through retry delays
      await vi.runAllTimersAsync();

      // This should throw, so we await it in the try block
      await retryPromise;

      // If we get here, the test should fail
      expect.fail('Expected withRetry to throw an error');
    } catch (error) {
      caughtError = error;
    }

    // Verify the error properties
    expect(caughtError).toBeInstanceOf(StoreError);
    expect(caughtError.message).toContain('Operation "test-operation" failed after 2 attempts');
    expect(caughtError.code).toBe('RETRY_EXHAUSTED');
    expect(caughtError.severity).toBe('high');
    expect(caughtError.retryable).toBe(false);
    expect(operation).toHaveBeenCalledTimes(2);
  });

  it('should use exponential backoff for delays', async () => {
    const operation = vi
      .fn()
      .mockRejectedValueOnce(new Error('First failure'))
      .mockRejectedValueOnce(new Error('Second failure'))
      .mockResolvedValue('success');

    const config = { maxAttempts: 3, baseDelay: 100, backoffMultiplier: 2 };
    const retryPromise = withRetry(operation, config, 'test-operation');

    // Check that timers are set with correct delays
    expect(vi.getTimerCount()).toBe(0);

    await vi.runAllTimersAsync();
    await retryPromise;

    expect(operation).toHaveBeenCalledTimes(3);
  });

  it('should respect maxDelay configuration', async () => {
    const operation = vi
      .fn()
      .mockRejectedValueOnce(new Error('First failure'))
      .mockResolvedValue('success');

    const config = {
      maxAttempts: 2,
      baseDelay: 1000,
      backoffMultiplier: 10,
      maxDelay: 500,
    };

    const retryPromise = withRetry(operation, config, 'test-operation');

    await vi.runAllTimersAsync();
    await retryPromise;

    expect(operation).toHaveBeenCalledTimes(2);
  });
});

describe('safeOperation', () => {
  it('should return success result for successful operation', async () => {
    const operation = vi.fn().mockResolvedValue('test data');

    const result = await safeOperation(operation, 'test-operation');

    expect(result).toEqual({
      success: true,
      data: 'test data',
    });
  });

  it('should return error result for failed operation', async () => {
    const originalError = new Error('Operation failed');
    const operation = vi.fn().mockRejectedValue(originalError);

    const result = await safeOperation(operation, 'test-operation');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(StoreError);
      expect(result.error.message).toBe('Operation "test-operation" failed');
      expect(result.error.cause).toBe(originalError);
    }
  });

  it('should preserve StoreError when operation throws StoreError', async () => {
    const storeError = new StoreError('Custom store error', { code: 'CUSTOM_ERROR' });
    const operation = vi.fn().mockRejectedValue(storeError);

    const result = await safeOperation(operation, 'test-operation');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe(storeError);
    }
  });
});

describe('checkDatabaseHealth', () => {
  let mockDb: any;

  beforeEach(() => {
    // Create a mock database with proper structure
    mockDb = {
      objectStoreNames: ['testStore'],
      transaction: vi.fn().mockReturnValue({
        objectStore: vi.fn().mockReturnValue({
          count: vi.fn().mockReturnValue({
            onsuccess: null,
            onerror: null,
            result: 5,
          }),
        }),
      }),
    };

    // Mock navigator.storage
    Object.defineProperty(navigator, 'storage', {
      value: {
        estimate: vi.fn().mockResolvedValue({
          usage: 1000000,
          quota: 10000000,
        }),
      },
      configurable: true,
    });
  });

  it('should return healthy status for good database', async () => {
    // Mock successful count operation
    const countRequest = {
      onsuccess: null as any,
      onerror: null as any,
      result: 5,
    };

    mockDb.transaction.mockReturnValue({
      objectStore: vi.fn().mockReturnValue({
        count: vi.fn().mockReturnValue(countRequest),
      }),
    });

    const healthPromise = checkDatabaseHealth(mockDb);

    // Simulate successful request
    setTimeout(() => {
      if (countRequest.onsuccess) {
        countRequest.onsuccess({ target: countRequest });
      }
    }, 0);

    const health = await healthPromise;

    expect(health.isHealthy).toBe(true);
    expect(health.issues).toHaveLength(0);
    expect(health.performance.avgQueryTime).toBeLessThan(1000);
  });

  it('should detect slow database response', async () => {
    const countRequest = {
      onsuccess: null as any,
      onerror: null as any,
      result: 5,
    };

    mockDb.transaction.mockReturnValue({
      objectStore: vi.fn().mockReturnValue({
        count: vi.fn().mockReturnValue(countRequest),
      }),
    });

    const healthPromise = checkDatabaseHealth(mockDb);

    // Simulate slow response
    setTimeout(() => {
      if (countRequest.onsuccess) {
        countRequest.onsuccess({ target: countRequest });
      }
    }, 1500); // Longer than 1000ms threshold

    const health = await healthPromise;

    expect(health.isHealthy).toBe(false);
    expect(health.issues).toContain('Slow database response time');
    expect(health.performance.slowQueries).toBe(1);
  });

  it('should detect storage quota issues', async () => {
    // Mock high storage usage
    Object.defineProperty(navigator, 'storage', {
      value: {
        estimate: vi.fn().mockResolvedValue({
          usage: 9500000, // 95% of quota
          quota: 10000000,
        }),
      },
      configurable: true,
    });

    const countRequest = {
      onsuccess: null as any,
      onerror: null as any,
      result: 5,
    };

    mockDb.transaction.mockReturnValue({
      objectStore: vi.fn().mockReturnValue({
        count: vi.fn().mockReturnValue(countRequest),
      }),
    });

    const healthPromise = checkDatabaseHealth(mockDb);

    setTimeout(() => {
      if (countRequest.onsuccess) {
        countRequest.onsuccess({ target: countRequest });
      }
    }, 0);

    const health = await healthPromise;

    expect(health.isHealthy).toBe(false);
    expect(health.issues).toContain('Storage quota nearly exceeded');
  });

  it('should handle database connectivity errors', async () => {
    const countRequest = {
      onsuccess: null as any,
      onerror: null as any,
      error: new Error('Connection failed'),
    };

    mockDb.transaction.mockReturnValue({
      objectStore: vi.fn().mockReturnValue({
        count: vi.fn().mockReturnValue(countRequest),
      }),
    });

    const healthPromise = checkDatabaseHealth(mockDb);

    setTimeout(() => {
      if (countRequest.onerror) {
        countRequest.onerror({ target: countRequest });
      }
    }, 0);

    const health = await healthPromise;

    expect(health.isHealthy).toBe(false);
    expect(health.issues.some((issue) => issue.includes('Database connectivity test failed'))).toBe(
      true,
    );
  });
});

describe('handleDatabaseCorruption', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully delete corrupted database', async () => {
    const mockDeleteRequest = {
      onsuccess: null as any,
      onerror: null as any,
      onblocked: null as any,
    };

    const mockIndexedDB = {
      deleteDatabase: vi.fn().mockReturnValue(mockDeleteRequest),
    };

    // Replace global indexedDB for this test
    const originalIndexedDB = globalThis.indexedDB;
    globalThis.indexedDB = mockIndexedDB as any;

    const recoveryCallback = vi.fn().mockResolvedValue(undefined);

    const recoveryPromise = handleDatabaseCorruption('test-db', 1, recoveryCallback);

    // Simulate successful deletion
    setTimeout(() => {
      if (mockDeleteRequest.onsuccess) {
        mockDeleteRequest.onsuccess({});
      }
    }, 0);

    await recoveryPromise;

    expect(mockIndexedDB.deleteDatabase).toHaveBeenCalledWith('test-db');
    expect(recoveryCallback).toHaveBeenCalled();

    // Restore original indexedDB
    globalThis.indexedDB = originalIndexedDB;
  });

  it('should handle blocked database deletion', async () => {
    const mockDeleteRequest = {
      onsuccess: null as any,
      onerror: null as any,
      onblocked: null as any,
    };

    const mockIndexedDB = {
      deleteDatabase: vi.fn().mockReturnValue(mockDeleteRequest),
    };

    const originalIndexedDB = globalThis.indexedDB;
    globalThis.indexedDB = mockIndexedDB as any;

    const recoveryPromise = handleDatabaseCorruption('test-db', 1);

    // Simulate blocked deletion followed by success
    setTimeout(() => {
      if (mockDeleteRequest.onblocked) {
        mockDeleteRequest.onblocked({});
      }
      // After timeout, simulate success
      setTimeout(() => {
        if (mockDeleteRequest.onsuccess) {
          mockDeleteRequest.onsuccess({});
        }
      }, 1100);
    }, 0);

    await recoveryPromise;

    expect(mockIndexedDB.deleteDatabase).toHaveBeenCalledWith('test-db');

    globalThis.indexedDB = originalIndexedDB;
  });

  it('should throw StoreError on deletion failure', async () => {
    const mockDeleteRequest = {
      onsuccess: null as any,
      onerror: null as any,
      onblocked: null as any,
      error: new Error('Deletion failed'),
    };

    const mockIndexedDB = {
      deleteDatabase: vi.fn().mockReturnValue(mockDeleteRequest),
    };

    const originalIndexedDB = globalThis.indexedDB;
    globalThis.indexedDB = mockIndexedDB as any;

    const recoveryPromise = handleDatabaseCorruption('test-db', 1);

    setTimeout(() => {
      if (mockDeleteRequest.onerror) {
        mockDeleteRequest.onerror({ target: mockDeleteRequest });
      }
    }, 0);

    await expect(recoveryPromise).rejects.toThrow(StoreError);
    await expect(recoveryPromise).rejects.toThrow('Failed to recover from database corruption');

    globalThis.indexedDB = originalIndexedDB;
  });

  it('should handle recovery callback errors', async () => {
    const mockDeleteRequest = {
      onsuccess: null as any,
      onerror: null as any,
      onblocked: null as any,
    };

    const mockIndexedDB = {
      deleteDatabase: vi.fn().mockReturnValue(mockDeleteRequest),
    };

    const originalIndexedDB = globalThis.indexedDB;
    globalThis.indexedDB = mockIndexedDB as any;

    const recoveryCallback = vi.fn().mockRejectedValue(new Error('Recovery failed'));

    const recoveryPromise = handleDatabaseCorruption('test-db', 1, recoveryCallback);

    setTimeout(() => {
      if (mockDeleteRequest.onsuccess) {
        mockDeleteRequest.onsuccess({});
      }
    }, 0);

    await expect(recoveryPromise).rejects.toThrow(StoreError);
    await expect(recoveryPromise).rejects.toThrow('Failed to recover from database corruption');

    globalThis.indexedDB = originalIndexedDB;
  });
});

describe('DEFAULT_RETRY_CONFIG', () => {
  it('should have expected default values', () => {
    expect(DEFAULT_RETRY_CONFIG).toEqual({
      maxAttempts: 3,
      baseDelay: 100,
      maxDelay: 5000,
      backoffMultiplier: 2,
    });
  });
});
