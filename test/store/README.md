# Store System Tests

This directory contains comprehensive tests for the enhanced store system with minimal mocking to ensure real-world reliability.

## Test Files

### `error-handler.test.ts`

Tests the centralized error handling utilities:

- **StoreError class**: Custom error types with severity levels and context
- **withRetry function**: Exponential backoff retry mechanism
- **safeOperation wrapper**: Consistent error handling across operations
- **checkDatabaseHealth**: Proactive database health monitoring
- **handleDatabaseCorruption**: Automatic corruption recovery

**Key Features Tested:**

- Retry logic with exponential backoff
- Non-retryable error handling
- Database health checks and performance monitoring
- Corruption detection and recovery
- Timeout handling and graceful degradation

### `base-store.test.ts`

Tests the abstract base store class that provides common functionality:

- **CRUD operations**: Create, read, update, delete with error handling
- **Pagination**: Built-in pagination support for large datasets
- **Sorting**: Configurable sorting with validation
- **Bulk operations**: Optimized bulk insert/update operations
- **Health monitoring**: Performance tracking and health checks
- **Error handling**: Consistent error handling with retry logic

**Key Features Tested:**

- Pagination with hasMore and nextOffset
- Sorting with field validation
- Bulk operations with transactions
- Performance metrics tracking
- Health status reporting
- Retry behavior for transient failures

### `enhanced-search-index.test.ts`

Tests the high-performance search system:

- **Lazy loading**: Data loaded only when needed by type
- **Intelligent caching**: Multi-level caching with TTL management
- **Advanced scoring**: Relevance scoring with fuzzy matching
- **Pagination**: Efficient pagination for large result sets
- **Memory management**: Automatic cache cleanup

**Key Features Tested:**

- Search across multiple data types
- Caching and cache invalidation
- Scoring algorithm accuracy
- Fuzzy matching for typos
- Performance with large datasets
- Memory management and cache limits

### `database-setup.test.ts`

Tests the database initialization and management:

- **Database setup**: Connection establishment with retry logic
- **Version upgrades**: Automatic schema migrations
- **Corruption recovery**: Automatic detection and recovery
- **Environment handling**: Different database names per environment
- **Error scenarios**: Comprehensive error handling

**Key Features Tested:**

- Database connection with timeout handling
- Version upgrade scenarios
- Corruption detection and recovery
- Blocked/blocking upgrade scenarios
- Concurrent setup requests
- Performance benchmarks

## Test Philosophy

### Minimal Mocking

These tests use minimal mocking to ensure they test real behavior:

- **Real IndexedDB operations** where possible
- **Actual retry logic** with real timers
- **Real performance measurements**
- **Authentic error scenarios**

### Comprehensive Coverage

Tests cover both happy path and edge cases:

- **Success scenarios**: Normal operations work correctly
- **Error scenarios**: Graceful handling of failures
- **Performance scenarios**: Operations complete within reasonable time
- **Edge cases**: Boundary conditions and unusual inputs

### Real-World Scenarios

Tests simulate actual usage patterns:

- **Large datasets**: Performance with realistic data volumes
- **Network issues**: Transient failures and recovery
- **Concurrent operations**: Multiple operations running simultaneously
- **Memory constraints**: Cache limits and cleanup

## Running Tests

### Run All Store Tests

```bash
npm test test/store/
```

### Run Specific Test File

```bash
npm test test/store/error-handler.test.ts
npm test test/store/base-store.test.ts
npm test test/store/enhanced-search-index.test.ts
npm test test/store/database-setup.test.ts
```

### Run with Coverage

```bash
npm run test:coverage -- test/store/
```

### Run in Watch Mode

```bash
npm run test:watch -- test/store/
```

## Test Data

Tests use realistic sample data:

- **Documents**: Google Docs with proper metadata
- **Segments**: Calendar meetings with attendees and attachments
- **People**: Contacts with email addresses and Google IDs
- **Websites**: Web pages with titles, URLs, and domains

## Performance Benchmarks

Tests include performance assertions:

- **Database setup**: < 1 second
- **Search operations**: < 100ms for typical queries
- **Bulk operations**: < 500ms for 100 items
- **Health checks**: < 200ms

## Error Scenarios Tested

### Database Errors

- Connection timeouts
- Corruption detection
- Version upgrade failures
- Blocked upgrades
- Transaction failures

### Network Errors

- Transient connection issues
- Timeout scenarios
- Retry exhaustion
- Non-retryable errors

### Memory Errors

- Cache overflow
- Memory pressure
- Cleanup failures

### Data Errors

- Invalid data formats
- Missing required fields
- Type mismatches
- Constraint violations

## Debugging Tests

### Enable Detailed Logging

```bash
DEBUG=store:* npm test test/store/
```

### Run Single Test

```bash
npm test -- --grep "should handle database corruption"
```

### Inspect Test Database

Tests create temporary databases that can be inspected:

```javascript
// In test file
console.log('Database state:', await db.getAll('testStore'));
```

## Contributing

When adding new store functionality:

1. **Add corresponding tests** in the appropriate test file
2. **Follow the minimal mocking philosophy**
3. **Include both success and error scenarios**
4. **Add performance assertions where relevant**
5. **Update this README** with new test descriptions

### Test Naming Convention

- Use descriptive test names: `should handle database corruption gracefully`
- Group related tests in `describe` blocks
- Use `it` for individual test cases
- Use `beforeEach`/`afterEach` for setup/cleanup

### Mock Guidelines

- Mock external dependencies (network, file system)
- Use real implementations for internal logic
- Mock time-dependent operations with `vi.useFakeTimers()`
- Restore mocks in `afterEach` hooks

## Continuous Integration

These tests run in CI/CD pipeline:

- **Pull requests**: All tests must pass
- **Main branch**: Tests run on every commit
- **Nightly builds**: Extended test suite with performance benchmarks
- **Release builds**: Full test suite with coverage requirements

## Test Maintenance

### Regular Updates

- Review test data for relevance
- Update performance benchmarks as system improves
- Add tests for new error scenarios discovered in production
- Refactor tests to reduce duplication

### Performance Monitoring

- Track test execution time
- Monitor memory usage during tests
- Alert on performance regressions
- Benchmark against previous versions
