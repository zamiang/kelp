import Button from '@material-ui/core/Button';
import { signOut } from 'next-auth/client';
import React from 'react';
import config from '../../constants/config';

const LogoutButton = () => (
  <Button size="small" onClick={() => signOut({ callbackUrl: config.NEXTAUTH_URL })}>
    Log Out
  </Button>
);

export default LogoutButton;
