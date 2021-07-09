import { PublicClientApplication } from '@azure/msal-browser';
import { graphConfig, tokenRequest } from './auth-config';
import { callMSGraph } from './fetch-helper';
import { getTokenPopup } from './fetch-token';

export const fetchCalendar = async (msal: PublicClientApplication) => {
  const currentAcc = msal.getActiveAccount();
  if (currentAcc) {
    const response = await getTokenPopup(tokenRequest, currentAcc, msal).catch((error) => {
      console.log(error);
    });
    console.log(response, '<<<<<<<< response from fetch calendar');
    if (response) {
      return callMSGraph(graphConfig.graphCalendarEndpoint, response.accessToken);
    }
  }
};
