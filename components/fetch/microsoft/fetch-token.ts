// https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/samples/msal-browser-samples/VanillaJSTestApp2.0/app/onPageLoad/auth.js
import {
  AuthenticationResult,
  InteractionRequiredAuthError,
  PublicClientApplication,
} from '@azure/msal-browser';
import { loginRequest } from './auth-config';

let accountId = '';

const handleResponse = (resp: AuthenticationResult | null, msal: PublicClientApplication) => {
  if (resp && resp.account) {
    accountId = resp.account.homeAccountId;
    // showWelcomeMessage(resp.account);
    console.log('success', resp, '<<<<<<');
    // seeProfileRedirect();
  } else {
    // need to call getAccount here?
    const currentAccounts = msal.getAllAccounts();
    if (!currentAccounts || currentAccounts.length < 1) {
      void signIn(msal);
    } else if (currentAccounts.length > 1) {
      // Add choose account code here
    } else if (currentAccounts.length === 1) {
      accountId = currentAccounts[0].homeAccountId;
      console.log('success', accountId, '<<<<<<');
    }
  }
};

export const signIn = (msal: PublicClientApplication) =>
  msal
    .loginPopup(loginRequest)
    .then((res: any) => handleResponse(res, msal))
    .catch(function (error) {
      console.log(error);
    });

export const signOut = (msal: PublicClientApplication) => {
  const logoutRequest = {
    account: msal.getAccountByHomeId(accountId),
  };
  return msal.logoutRedirect(logoutRequest);
};

export const getTokenPopup = async (request: any, account: any, msal: PublicClientApplication) => {
  request.account = account;
  return await msal.acquireTokenSilent(request).catch(async (error) => {
    console.log('silent token acquisition fails.');
    if (error instanceof InteractionRequiredAuthError) {
      console.log('acquiring token using popup');
      return msal.acquireTokenPopup(request).catch((error) => {
        console.error(error);
      });
    } else {
      console.error(error);
    }
  });
};

// Register Callbacks for Redirect flow
export const setupMicrosoftAuth = (msal: PublicClientApplication) =>
  msal
    .handleRedirectPromise()
    .then((res) => handleResponse(res, msal))
    .catch((error) => {
      console.log(error);
    });
