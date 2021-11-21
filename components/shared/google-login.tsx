import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import React from 'react';

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

const launchAuthFlow = (isInteractive: boolean) => {
  const OAUTH2_CLIENT_ID = '...';
  const OAUTH2_SCOPES = ['https://www.googleapis.com/auth/drive.file'];

  const authURL =
    'https://accounts.google.com/o/oauth2/auth' +
    `?client_id=${OAUTH2_CLIENT_ID}` +
    '&response_type=token' +
    `&redirect_uri=${encodeURIComponent(chrome.identity.getRedirectURL())}` +
    `&scope=${encodeURIComponent(OAUTH2_SCOPES.join(''))}`;

  chrome.identity.launchWebAuthFlow(
    {
      url: authURL,
      interactive: isInteractive,
    },
    (responseUrl) => {
      if (!responseUrl) {
        return console.error('no response url!!!');
      }
      const params = new URLSearchParams(new URL(responseUrl).hash.slice(1));

      if (params.has('error')) {
        throw new Error(`Authentication failed: ${params.get('error')}`);
      }
      console.log(params, '<<<<<<<<<<<<<<<<<<<<<<<');
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
        onClick={() => launchAuthFlow(true)}
      >
        Sign In
      </Button>
    </Root>
  );
};
