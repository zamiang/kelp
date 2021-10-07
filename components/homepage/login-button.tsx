import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import React from 'react';

const PREFIX = 'LoginButton';

const classes = {
  button: `${PREFIX}-button`,
  avatar: `${PREFIX}-avatar`,
};

const StyledButton = styled(Button)(({ theme }) => ({
  [`&.${classes.button}`]: {
    minWidth: 100,
    marginLeft: 'auto',
    paddingTop: 15,
    paddingBottom: 14,
    paddingLeft: theme.spacing(7),
    paddingRight: theme.spacing(7),
    borderRadius: 40,
    textTransform: 'uppercase',
    letterSpacing: '1.25px',
    fontSize: 14,
    [theme.breakpoints.down('md')]: {
      display: 'none',
    },
  },

  [`& .${classes.avatar}`]: {
    width: 22,
    height: 22,
    marginRight: theme.spacing(1),
    marginLeft: 'auto',
  },
}));

const LoginButton = () => (
  <StyledButton
    onClick={() => (window.location.pathname = '/install')}
    className={classes.button}
    variant="outlined"
    color="primary"
    disableElevation={true}
  >
    Install Kelp
  </StyledButton>
);

export default LoginButton;
