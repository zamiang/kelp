import CircularProgress from '@mui/material/CircularProgress';
import { styled } from '@mui/material/styles';
import React from 'react';

const PREFIX = 'LoadingSpinner';

const classes = {
  container: `${PREFIX}-container`,
};

const Root = styled('div')(({ theme }) => ({
  [`&.${classes.container}`]: {
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    textAlign: 'center',
  },
}));

export const LoadingSpinner = () => (
  <Root className={classes.container}>
    <CircularProgress color="inherit" />
  </Root>
);
