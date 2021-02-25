import Button from '@material-ui/core/Button';
import { signOut } from 'next-auth/client';
import React from 'react';

const LogoutButton = () => (
  <Button size="small" onClick={() => signOut()}>
    Log Out
  </Button>
);

export default LogoutButton;
