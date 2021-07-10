import { AccountInfo, IPublicClientApplication } from '@azure/msal-browser';
import { graphConfig, tokenRequest } from './auth-config';
import { callMSGraph } from './fetch-helper';
import { getTokenPopup } from './fetch-token';

export const fetchCalendar = async (
  activeAccount?: AccountInfo,
  msal?: IPublicClientApplication,
) => {
  if (activeAccount && msal) {
    const token = await getTokenPopup(tokenRequest, activeAccount, msal).catch((error) => {
      console.log(error);
    });
    console.log(token, '<<<<<<<< response from get token popup');
    if (token) {
      const result = await callMSGraph(graphConfig.graphCalendarEndpoint, token.accessToken);
      console.log(result, '<<<<<<<result<<<<<<<<<<<');
      return result.value;
    }
  }
};
