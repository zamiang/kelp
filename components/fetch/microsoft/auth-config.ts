import { LogLevel } from '@azure/msal-browser';
import { formatISO } from 'date-fns';
import config from '../../../constants/config';

// Config object to be passed to Msal on creation
const redirectUri = chrome.identity.getRedirectURL();
export const msalConfig = {
  auth: {
    clientId: '64c123a2-2c05-4bc0-8be3-76f29fe93af4',
    authority: 'https://login.microsoftonline.com/common',
    redirectUri,
    postLogoutRedirectUri: redirectUri,
  },
  cache: {
    cacheLocation: 'localStorage', //'sessionStorage', // This configures where your cache will be stored
    storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
  },
  system: {
    windowHashTimeout: 9000, // Applies just to popup calls - In milliseconds
    iframeHashTimeout: 9000, // Applies just to silent calls - In milliseconds
    loadFrameTimeout: 9000, // Applies to both silent and popup calls - In milliseconds
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

// Add here the endpoints for MS Graph API services you would like to use.
export const graphConfig = {
  graphMeEndpoint: 'https://graph.microsoft-ppe.com/v1.0/me',
  graphCalendarEndpoint: `https://graph.microsoft.com/v1.0/me/calendar/events?$filter=start/dateTime ge '${formatISO(
    config.startDate,
  )}' and start/dateTime lt '${formatISO(config.endDate)}'`, // https://docs.microsoft.com/en-us/graph/query-parameters
};

export const getGraphCalendarInstancesEndpoint = (id: string) =>
  `https://graph.microsoft.com/v1.0/me/calendar/events/${id}/instances?startDateTime=${formatISO(
    config.startDate,
  )}&endDateTime=${formatISO(config.endDate)}`;

// Add here scopes for access token to be used at MS Graph API endpoints.
export const tokenRequest = {
  scopes: ['Calendars.Read', 'offline_access'],
  forceRefresh: false, // Set this to "true" to skip a cached token and go to the server to get a new token
};
