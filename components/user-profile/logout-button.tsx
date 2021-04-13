import Button from '@material-ui/core/Button';
import React from 'react';
import useButtonStyles from '../shared/button-styles';

const logout = () => {
  if (typeof localStorage === 'object') {
    localStorage.removeItem('oauth2');
    localStorage.removeItem('scope');
  }
  window.location.pathname = '';
};

const LogoutButton = () => {
  const buttonClasses = useButtonStyles();
  return (
    <Button
      className={buttonClasses.button}
      variant="contained"
      disableElevation
      color="primary"
      onClick={logout}
    >
      Log Out
    </Button>
  );
};

export default LogoutButton;
