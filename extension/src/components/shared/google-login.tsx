import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import React from 'react';
import config from '../../../../constants/config';
import '../../styles/components/shared/google-login.css';

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
      <div className="google-login-root google-login-signed-in">
        <Typography className="google-login-signed-in-text">
          Signed in as: {props.currentUser?.emailAddresses[0]}
        </Typography>
        <Typography className="google-login-note-text">
          Note: If you sign into multiple Google Accounts (like for personal life and work), we
          recommend using{' '}
          <Link href="https://support.google.com/chrome/answer/2364824">
            Google Chrome Profiles
          </Link>
          .
        </Typography>
      </div>
    );
  }
  return (
    <div className="google-login-root">
      <Button
        className="google-login-button"
        variant="contained"
        disableElevation
        color="primary"
        onClick={() => launchGoogleAuthFlow(true)}
      >
        Sign In
      </Button>
    </div>
  );
};
