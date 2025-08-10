# Testing Strategy

This project uses [Vitest](https://vitest.dev/) for unit and integration testing, and [@testing-library/react](https://testing-library.com/docs/react-testing-library/intro) for rendering components and interacting with them in a user-centric way.

## Key Principles

- **Test user behavior, not implementation details.** Tests should verify that the component behaves as the user would expect, rather than asserting on internal state or implementation details.
- **Mock external dependencies.** Services like the Google Calendar API and Microsoft Graph API should be mocked to ensure that tests are fast, reliable, and don't depend on external services.
- **Write specific and meaningful assertions.** Tests should verify that the correct content is rendered to the screen, not just that the component doesn't crash.

## Test Organization

Tests are organized in the `test/` directory with the following structure:

```
test/
├── setup.ts                    # Global test configuration
├── vitest-environment-jsdom.ts # Custom jsdom environment
├── background.test.ts          # Extension background script tests
├── popup.test.tsx             # Extension popup tests
├── integration.test.ts        # Integration tests
├── components/                # Component-specific tests
└── README.md                  # Testing documentation
```

## Running Tests

Tests can be run with the following command:

```bash
npm test
```

This will run all tests in the `test/` directory using Vitest with jsdom environment for DOM simulation.

## Extension Testing

The project includes specific testing patterns for Chrome extension components:

- **Background Script Tests**: Mock Chrome APIs for service worker testing
- **Popup Tests**: Test extension popup UI components
- **Integration Tests**: Test API integrations with Google and Microsoft services

## Mock Strategy

- **Google Calendar API**: Mock Google API responses for calendar events
- **Microsoft Graph API**: Mock Microsoft Graph responses for calendar and user data
- **Chrome APIs**: Mock chrome.storage, chrome.alarms, and other extension APIs
- **External Services**: All external dependencies mocked for reliable testing
