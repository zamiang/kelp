import { Link, Typography, makeStyles } from '@material-ui/core';
import React from 'react';

const useStyles = makeStyles((theme) => ({
  body: {
    marginTop: theme.spacing(1),
    color: theme.palette.text.hint,
  },
}));

const Copyright = () => {
  const styles = useStyles();
  return (
    <Typography variant="body2" className={styles.body} align="center">
      {'Copyright © '}
      <Link color="inherit" href="https://www.zamiang.com">
        Brennan Moore
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
};

export default Copyright;
