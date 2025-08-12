import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import React from 'react';
import config from '../../../../constants/config';

const PREFIX = 'GoogleLoginButton';

const classes = {
  panel: `${PREFIX}-panel`,
  button: `${PREFIX}-button`,
};

const Root = styled('div')(({ theme }) => ({
  [`& .${classes.panel}`]: {
    margin: theme.spacing(1),
  },
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

export const getGoogleClientID = () => {
  const location = window.location.href;
  if (location.includes('chrome://')) {
    return config.GOOGLE_CLIENT_ID_CHROME;
  }
  return config.GOOGLE_CLIENT_ID_NOT_CHROME;
};

export const launchGoogleAuthFlow = (
  isInteractive: boolean,
  onSuccess?: (token: string) => void,
  onError?: () => void,
) => {
  const authURL =
    'https://accounts.google.com/o/oauth2/auth' +
    `?client_id=${getGoogleClientID()}` +
    '&response_type=token' +
    `&redirect_uri=${encodeURIComponent(chrome.identity.getRedirectURL())}` +
    `&scope=${encodeURIComponent(config.GOOGLE_SCOPES.join(' '))}`;

  chrome.identity.launchWebAuthFlow(
    {
      url: authURL,
      interactive: isInteractive,
    },
    (responseUrl) => {
      if (!responseUrl) {
        onError && onError();
        throw new Error(`Authentication failed no response url`);
      }

      localStorage.setItem(config.GOOGLE_ENABLED, 'enabled');
      const params = new URLSearchParams(new URL(responseUrl).hash.slice(1));

      if (params.has('error')) {
        onError && onError();
        throw new Error(`Authentication failed: ${params.get('error')}`);
      }
      if (onSuccess) {
        onSuccess(params.get('access_token')!);
      }
      return params.get('access_token');
    },
  );
};

export const GoogleLoginButton = (props: { currentUser: any }) => {
  if (props.currentUser) {
    return (
      <Root>
        <Typography style={{ marginBottom: 22 }}>
          Signed in as: {props.currentUser?.emailAddresses[0]}
        </Typography>
        <Typography>
          Note: If you sign into multiple Google Accounts (like for personal life and work), we
          recommend using{' '}
          <Link href="https://support.google.com/chrome/answer/2364824">
            Google Chrome Profiles
          </Link>
          .
        </Typography>
      </Root>
    );
  }
  return (
    <Root>
      <Button
        className={classes.button}
        variant="contained"
        disableElevation
        color="primary"
        style={{ width: 100 }}
        onClick={() => launchGoogleAuthFlow(true)}
      >
        Sign In
      </Button>
    </Root>
  );
};
