// https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/samples/msal-browser-samples/VanillaJSTestApp2.0/app/onPageLoad/auth.js
import {
  AccountInfo,
  IPublicClientApplication,
  InteractionRequiredAuthError,
} from '@azure/msal-browser';

export const getTokenPopup = async (
  request: any,
  account: AccountInfo,
  msal: IPublicClientApplication,
) => {
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
