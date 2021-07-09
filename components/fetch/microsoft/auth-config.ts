import { LogLevel } from '@azure/msal-browser';

// Config object to be passed to Msal on creation
export const msalConfig = {
  auth: {
    clientId: '64c123a2-2c05-4bc0-8be3-76f29fe93af4',
    authority: 'https://login.windows-ppe.net/common/',
    redirectUri: window.location.href,
  },
  cache: {
    cacheLocation: 'sessionStorage', // This configures where your cache will be stored
    storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
  },
  system: {
    loggerOptions: {
      loggerCallback: (level: LogLevel, message: string, containsPii: boolean) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            return;
          case LogLevel.Info:
            console.info(message);
            return;
          case LogLevel.Verbose:
            console.debug(message);
            return;
          case LogLevel.Warning:
            console.warn(message);
            return;
        }
      },
    },
  },
};

// Add here scopes for id token to be used at MS Identity Platform endpoints.
export const loginRequest = {
  scopes: ['User.Read'],
};

// Add here the endpoints for MS Graph API services you would like to use.
export const graphConfig = {
  graphMeEndpoint: 'https://graph.microsoft-ppe.com/v1.0/me',
  graphCalendarEndpoint: 'https://graph.microsoft.com/v1.0/me/calendar/events', // https://docs.microsoft.com/en-us/graph/query-parameters
};

// Add here scopes for access token to be used at MS Graph API endpoints.
export const tokenRequest = {
  scopes: ['Calendars.Read'],
  forceRefresh: false, // Set this to "true" to skip a cached token and go to the server to get a new token
};

// export const silentRequest = {
//  scopes: ['openid', 'profile', 'User.Read', 'Calendars.Read'],
// };
