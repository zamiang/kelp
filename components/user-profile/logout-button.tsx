import Button from '@material-ui/core/Button';
import React from 'react';

export const logout = () => {
  localStorage.removeItem('oauth2');
  window.location.pathname = '';
};

const LogoutButton = () => (
  <Button size="small" onClick={logout}>
    Log Out
  </Button>
);

export default LogoutButton;
