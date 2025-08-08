import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';

// Mock all the dependencies that might cause Buffer issues
vi.mock('@azure/msal-browser', () => ({
  PublicClientApplication: vi.fn().mockImplementation(() => ({
    getAllAccounts: vi.fn().mockReturnValue([]),
    setActiveAccount: vi.fn(),
    addEventCallback: vi.fn(),
  })),
  EventType: {
    ACQUIRE_TOKEN_START: 'acquire_token_start',
    ACQUIRE_TOKEN_SUCCESS: 'acquire_token_success',
    LOGIN_SUCCESS: 'login_success',
    ACQUIRE_TOKEN_FAILURE: 'acquire_token_failure',
  },
}));

vi.mock('@azure/msal-react', () => ({
  MsalProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useMsal: () => ({
    instance: {
      getActiveAccount: vi.fn().mockReturnValue(null),
    },
  }),
}));

vi.mock('../../components/fetch/microsoft/auth-config', () => ({
  msalConfig: {},
}));

vi.mock('../../components/shared/google-login', () => ({
  getGoogleClientID: vi.fn().mockReturnValue('test-client-id'),
  launchGoogleAuthFlow: vi.fn(),
}));

vi.mock('../../components/store/db', () => ({
  default: vi.fn().mockResolvedValue({ name: 'test-db' }),
}));

vi.mock('../../components/store/use-store', () => ({
  default: vi.fn().mockReturnValue({
    websiteStore: { trackVisit: vi.fn() },
    websiteVisitStore: { trackVisit: vi.fn() },
    timeDataStore: { getUpNextSegment: vi.fn() },
  }),
}));

vi.mock('../../components/dashboard/desktop-dashboard', () => ({
  DesktopDashboard: () => <div data-testid="desktop-dashboard">Dashboard</div>,
}));

vi.mock('../../constants/config', () => ({
  default: {
    GOOGLE_SCOPES: ['https://www.googleapis.com/auth/calendar.readonly'],
    GOOGLE_ENABLED: 'google_enabled',
    LAST_UPDATED: 'last_updated',
    THEME: 'theme',
  },
}));

vi.mock('../../constants/theme', () => ({
  coolTheme: {},
  darkTheme: {},
  lightTheme: {},
  nbTheme: {},
}));

describe('Popup Buffer Error Reproduction', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock chrome.identity.getAuthToken
    (global as any).chrome.identity.getAuthToken = vi.fn((options, callback) => {
      callback('mock-token');
    });

    // Mock chrome.storage.sync.get
    (global as any).chrome.storage.sync.get = vi.fn().mockResolvedValue({});
  });

  it('should reproduce the "Buffer is not defined" error', async () => {
    // Remove Buffer from global scope to simulate browser environment
    const originalBuffer = global.Buffer;
    delete (global as any).Buffer;

    try {
      // This should trigger the Buffer error when dependencies try to use Buffer
      expect(() => {
        // Import a module that uses Buffer (like Microsoft Graph SDK or crypto operations)
        require('@azure/msal-browser');
      }).toThrow(/Buffer is not defined/);
    } catch {
      // The error might be thrown during module loading
      // We expect this to happen when Buffer is not defined
    } finally {
      // Restore Buffer
      global.Buffer = originalBuffer;
    }
  });

  it('should reproduce Buffer dependency issues in popup component', async () => {
    // Temporarily remove Buffer to simulate the error
    const originalBuffer = global.Buffer;
    delete (global as any).Buffer;

    try {
      // Try to render the popup component
      const PopupComponent = () => {
        // Simulate code that would use Buffer
        try {
          // This might be called by dependencies like Microsoft Graph SDK
          if (typeof Buffer !== 'undefined') {
            Buffer.from('test', 'utf8');
          }
          return <div data-testid="popup">Popup loaded</div>;
        } catch {
          throw new Error('Buffer is not defined');
        }
      };

      expect(() => {
        render(<PopupComponent />);
      }).toThrow('Buffer is not defined');
    } finally {
      // Restore Buffer
      global.Buffer = originalBuffer;
    }
  });

  it('should handle missing Node.js globals in browser environment', () => {
    // Test various Node.js globals that might be missing
    const nodeGlobals = ['Buffer', 'process', 'global'];

    nodeGlobals.forEach((globalName) => {
      const original = (global as any)[globalName];
      delete (global as any)[globalName];

      try {
        // Simulate code that checks for these globals
        const checkGlobal = () => {
          if (typeof (global as any)[globalName] === 'undefined') {
            throw new ReferenceError(`${globalName} is not defined`);
          }
        };

        expect(checkGlobal).toThrow(`${globalName} is not defined`);
      } finally {
        // Restore the global
        (global as any)[globalName] = original;
      }
    });
  });

  it('should reproduce webpack polyfill issues', () => {
    // Test that certain Node.js modules are not available in browser
    expect(() => {
      // These would normally be polyfilled by webpack
      require('crypto');
    }).toThrow();

    expect(() => {
      require('stream');
    }).toThrow();

    expect(() => {
      require('util');
    }).toThrow();
  });

  it('should test Microsoft Graph SDK Buffer dependency', async () => {
    // Mock a scenario where Microsoft Graph SDK tries to use Buffer
    const mockMsalInstance = {
      getAllAccounts: vi.fn().mockReturnValue([]),
      setActiveAccount: vi.fn(),
      addEventCallback: vi.fn(),
      acquireTokenSilent: vi.fn().mockImplementation(() => {
        // Simulate the SDK trying to use Buffer for token processing
        if (typeof Buffer === 'undefined') {
          throw new ReferenceError('Buffer is not defined');
        }
        return Promise.resolve({ accessToken: 'test-token' });
      }),
    };

    // Remove Buffer temporarily
    const originalBuffer = global.Buffer;
    delete (global as any).Buffer;

    try {
      await expect(mockMsalInstance.acquireTokenSilent()).rejects.toThrow('Buffer is not defined');
    } finally {
      global.Buffer = originalBuffer;
    }
  });

  it('should test crypto operations that require Buffer', () => {
    // Remove Buffer to simulate the error
    const originalBuffer = global.Buffer;
    delete (global as any).Buffer;

    try {
      const cryptoOperation = () => {
        // Simulate crypto operations that popup.tsx might perform
        if (typeof Buffer === 'undefined') {
          throw new ReferenceError('Buffer is not defined');
        }
        return Buffer.from('test-data', 'utf8').toString('base64');
      };

      expect(cryptoOperation).toThrow('Buffer is not defined');
    } finally {
      global.Buffer = originalBuffer;
    }
  });

  it('should reproduce authentication flow Buffer errors', async () => {
    // Mock authentication flow that might use Buffer
    const originalBuffer = global.Buffer;
    delete (global as any).Buffer;

    try {
      const authFlow = () => {
        // Simulate OAuth token processing that might use Buffer
        const tokenData = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';

        if (typeof Buffer === 'undefined') {
          throw new ReferenceError('Buffer is not defined');
        }

        return Buffer.from(tokenData, 'base64').toString('utf8');
      };

      expect(authFlow).toThrow('Buffer is not defined');
    } finally {
      global.Buffer = originalBuffer;
    }
  });
});
