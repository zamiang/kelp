import { useMsal } from '@azure/msal-react';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import React from 'react';

export const WelcomeUser = () => {
  const { accounts } = useMsal();
  const username = accounts[0].username;

  return <Typography>You are signed in as {username}</Typography>;
};

const getLoginUrl = (instance: any) =>
  new Promise((resolve) => {
    instance.loginRedirect({
      onRedirectNavigate: (u: string) => {
        resolve(u);
        return false;
      },
    });
  });

const launchAuthFlow = (instance: any, url: string) =>
  new Promise((resolve, reject) => {
    chrome.identity.launchWebAuthFlow(
      {
        interactive: true,
        url,
      },
      (responseUrl) =>
        instance
          .handleRedirectPromise(`#${responseUrl!.split('#')[1]}`)
          .then(resolve)
          .catch(reject),
    );
  });

const signInClickHandler = async (instance: any) => {
  const url = (await getLoginUrl(instance)) as any;
  return await launchAuthFlow(instance, url);
};

// SignInButton Component returns a button that invokes a popup login when clicked
export const SignInButton = () => {
  // useMsal hook will return the PublicClientApplication instance you provided to MsalProvider
  const { instance } = useMsal();

  return <Button onClick={() => signInClickHandler(instance)}>Sign In</Button>;
};
