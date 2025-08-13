import Button from '@mui/material/Button';
import React from 'react';
import '../../styles/components/homepage/login-button.css';

const LoginButton = () => (
  <Button
    onClick={() => (window.location.pathname = '/install')}
    className="login-button"
    variant="outlined"
    color="primary"
    disableElevation={true}
  >
    Install Kelp
  </Button>
);

export default LoginButton;
