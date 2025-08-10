/**
 * Store Test Suite Entry Point
 *
 * This file imports all store-related tests to ensure they run together
 * and provides a comprehensive test suite for the store system.
 */

// Import all store tests
import './error-handler.test';
import './base-store.test';
import './enhanced-search-index.test';
import './database-setup.test';

// Re-export test utilities for other test files
export * from './error-handler.test';
export * from './base-store.test';
export * from './enhanced-search-index.test';
export * from './database-setup.test';
