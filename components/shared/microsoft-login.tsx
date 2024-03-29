import { IPublicClientApplication } from '@azure/msal-browser';
import { useMsal } from '@azure/msal-react';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import React from 'react';
import { ensureDataRefresh } from './ensure-refresh';

const PREFIX = 'MicrosoftLogin';

const classes = {
  button: `${PREFIX}-button`,
};

const Root = styled('div')(() => ({
  [`& .${classes.button}`]: {
    width: '100%',
    borderRadius: 30,
    paddingTop: 6,
    paddingBottom: 6,
    transition: 'opacity 0.3s',
    minHeight: 48,
    opacity: 1,
    paddingLeft: 20,
    paddingRight: 20,
    '&:hover': {
      opacity: 0.6,
    },
  },
}));

export const WelcomeUser = () => {
  const { accounts } = useMsal();
  const username = accounts[0].username;

  return <Typography>You are signed in as {username}</Typography>;
};

const getLoginUrl = async (msal: IPublicClientApplication) =>
  new Promise(
    (resolve) =>
      void msal.loginRedirect({
        scopes: ['Calendars.Read', 'openid', 'profile', 'offline_access'],
        onRedirectNavigate: (u: string) => {
          resolve(u);
          return false;
        },
      }),
  );

const launchAuthFlow = (msal: IPublicClientApplication, url: string) =>
  new Promise((resolve, reject) => {
    chrome.identity.launchWebAuthFlow(
      {
        interactive: true,
        url,
      },
      (responseUrl) => {
        if (responseUrl) {
          return void msal
            .handleRedirectPromise(`#${responseUrl.split('#')[1]}`)
            .then(resolve)
            .catch(reject);
        }
      },
    );
  });

export const signInClickHandler = async (msal: IPublicClientApplication) => {
  const url = (await getLoginUrl(msal)) as any;
  ensureDataRefresh();
  return await launchAuthFlow(msal, url);
};

// SignInButton Component returns a button that invokes a popup login when clicked
export const SignInButton = () => {
  // useMsal hook will return the PublicClientApplication instance you provided to MsalProvider
  const { instance } = useMsal();

  return (
    <Root>
      <Button
        className={classes.button}
        variant="contained"
        disableElevation
        color="primary"
        style={{ width: 100 }}
        onClick={() => signInClickHandler(instance)}
      >
        Sign In
      </Button>
    </Root>
  );
};

const logOutClickHandler = (msal: IPublicClientApplication) => {
  const logoutRequest = {
    account: msal.getActiveAccount(),
  };
  return msal.logoutRedirect(logoutRequest);
};

// SignInButton Component returns a button that invokes a popup login when clicked
export const LogOutButton = () => {
  // useMsal hook will return the PublicClientApplication instance you provided to MsalProvider
  const { instance } = useMsal();

  return (
    <Root>
      <Button
        className={classes.button}
        style={{ width: 100, marginTop: 20 }}
        variant="contained"
        disableElevation
        color="primary"
        onClick={() => logOutClickHandler(instance)}
      >
        Log Out
      </Button>
    </Root>
  );
};
