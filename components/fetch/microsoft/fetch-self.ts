import { loginRequest } from './auth-config';
import { callMSGraph } from './fetch-helper';
import { getTokenPopup } from './fetch-token';

export const fetchSelf = async () => {
  const currentAcc = msal.getAccountByHomeId(accountId);
  if (currentAcc) {
    const response = await getTokenPopup(loginRequest, currentAcc).catch((error) => {
      console.log(error);
    });
    return callMSGraph(graphConfig.graphMeEndpoint, response.accessToken, updateUI);
  }
};
