import CircularProgress from '@mui/material/CircularProgress';
import makeStyles from '@mui/styles/makeStyles';
import React from 'react';

const useStyles = makeStyles((theme) => ({
  container: {
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    textAlign: 'center',
  },
}));

export const LoadingSpinner = () => {
  const classes = useStyles();
  return (
    <div className={classes.container}>
      <CircularProgress color="inherit" />
    </div>
  );
};
