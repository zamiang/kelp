import Button from '@material-ui/core/Button';
import React from 'react';

const LogoutButton = () => (
  <Button
    size="small"
    onClick={() => {
      localStorage.removeItem('oauth2');
      window.location.pathname = '';
    }}
  >
    Log Out
  </Button>
);

export default LogoutButton;
