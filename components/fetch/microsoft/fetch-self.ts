import { PublicClientApplication } from '@azure/msal-browser';
import { graphConfig, loginRequest } from './auth-config';
import { callMSGraph } from './fetch-helper';
import { getTokenPopup } from './fetch-token';

export const fetchSelf = async (msal: PublicClientApplication, accountId: string) => {
  const currentAcc = msal.getAccountByHomeId(accountId);
  if (currentAcc) {
    const response = await getTokenPopup(loginRequest, currentAcc, msal).catch((error) => {
      console.log(error);
    });
    console.log(response, '<<<<<<<< response from fetch selt');
    if (response) {
      return callMSGraph(graphConfig.graphMeEndpoint, response.accessToken);
    }
  }
};
