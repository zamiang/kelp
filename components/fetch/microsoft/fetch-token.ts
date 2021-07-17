// https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/samples/msal-browser-samples/VanillaJSTestApp2.0/app/onPageLoad/auth.js
import {
  AccountInfo,
  BrowserAuthError,
  IPublicClientApplication,
  InteractionRequiredAuthError,
} from '@azure/msal-browser';
import { signInClickHandler } from '../../shared/microsoft-login';

export const getTokenPopup = async (
  request: any,
  account: AccountInfo,
  msal: IPublicClientApplication,
) => {
  request.account = account;
  return await msal.acquireTokenSilent(request).catch(async (error) => {
    if (error instanceof InteractionRequiredAuthError || error instanceof BrowserAuthError) {
      const result = await signInClickHandler(msal);
      if (result) {
        window.location.reload();
      }
    } else {
      console.error(error);
    }
  });
};
