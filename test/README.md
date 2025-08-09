# Extension Error Reproduction Tests

This test suite reproduces the specific runtime errors encountered in the Kelp browser extension:

## Errors Being Reproduced

### 1. Background Script Error

```
background.js:2 TypeError: Cannot read properties of undefined (reading 'websiteStore')
    at background.js:2:319742
```

**Root Cause**: The `store` variable is undefined when the background script tries to access `store.websiteStore`. This happens when:

- Database connection fails during initialization
- `useStoreNoFetch()` returns `null`
- Async timing issues where tab events fire before store is ready

### 2. Popup Script Error

```
popup.js:2 Uncaught ReferenceError: Buffer is not defined
    at 2786 (popup.js:2:551513)
```

**Root Cause**: Browser environment doesn't have Node.js globals like `Buffer`, but dependencies (likely Microsoft Graph SDK or crypto operations) expect them to be available.

## Test Files

### `test/integration.test.ts`

- **Main integration tests** that reproduce the exact error scenarios
- Tests store initialization failures
- Tests Buffer dependency issues
- Tests async timing race conditions

### `test/background.test.ts`

- **Background script specific tests** with comprehensive mocking
- Tests Chrome extension API interactions
- Tests database connection failures
- Tests store initialization edge cases

### `test/popup.test.tsx`

- **Popup component tests** focusing on Buffer errors
- Tests React component rendering with missing Node.js globals
- Tests authentication flow Buffer dependencies
- Tests webpack polyfill issues

### `test/setup.ts`

- **Test environment setup** with Chrome API mocks
- Provides Buffer polyfill for tests
- Mocks IndexedDB and other browser APIs

## Running the Tests

```bash
# Run all tests
npm test

# Run tests once (CI mode)
npm run test:run

# Run with UI (if vitest UI is installed)
npm run test:ui

# Run specific test file
npx vitest test/integration.test.ts

# Run tests in watch mode
npx vitest --watch
```

## Test Structure

The tests are organized to demonstrate:

1. **Exact Error Conditions**: Each test reproduces the specific conditions that cause the runtime errors
2. **Root Cause Analysis**: Tests show why the errors occur (undefined store, missing Buffer, etc.)
3. **Timing Issues**: Tests demonstrate race conditions and async initialization problems
4. **Environment Issues**: Tests show browser vs Node.js environment incompatibilities

## Key Test Scenarios

### Background Script Tests

- ✅ Store undefined when accessing `websiteStore`
- ✅ Database connection failure scenarios
- ✅ Async timing race conditions
- ✅ Chrome extension API mocking

### Popup Tests

- ✅ Buffer not defined in browser environment
- ✅ Microsoft Graph SDK Buffer dependencies
- ✅ Webpack polyfill failures
- ✅ Authentication flow crypto operations

### Integration Tests

- ✅ End-to-end error reproduction
- ✅ Real-world timing scenarios
- ✅ Cross-component error propagation

## Expected Test Results

When you run these tests, you should see:

1. **Failing tests that reproduce the exact errors** - This confirms the tests are working correctly
2. **Clear error messages** matching the runtime errors you're experiencing
3. **Detailed stack traces** showing where the errors occur

## Using These Tests for Debugging

1. **Run the tests** to confirm they reproduce your errors
2. **Examine the test conditions** to understand what causes the errors
3. **Use the mocked scenarios** to test potential fixes
4. **Add new test cases** as you discover additional error conditions

## Next Steps for Fixing

Based on these tests, the fixes should focus on:

### For Background Script Error:

- Add null checks before accessing `store.websiteStore`
- Implement proper error handling for database connection failures
- Add retry logic for store initialization
- Ensure store is ready before processing tab events

### For Popup Buffer Error:

- Configure webpack to provide Buffer polyfill
- Add fallback for missing Node.js globals
- Update dependencies to browser-compatible versions
- Add proper error boundaries for missing dependencies

## Test Configuration

The tests use:

- **Vitest** for the test runner
- **@testing-library/react** for component testing
- **jsdom** for browser environment simulation
- **Custom mocks** for Chrome extension APIs

See `vitest.config.ts` and `test/setup.ts` for detailed configuration.
