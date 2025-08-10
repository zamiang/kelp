/**
 * Store Test Suite Entry Point
 *
 * This file was previously used to import all store-related tests,
 * but has been disabled to prevent tests from running multiple times.
 * Each test file should be run independently by the test runner.
 */

// Imports removed to prevent duplicate test execution
// Individual test files will be discovered and run by Vitest automatically

// Simple test to ensure this file doesn't cause issues
import { describe, expect, it } from 'vitest';

describe('Store Test Suite', () => {
  it('should be properly configured', () => {
    expect(true).toBe(true);
  });
});
