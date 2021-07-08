import CircularProgress from '@material-ui/core/CircularProgress';
import { makeStyles } from '@material-ui/core/styles';
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
