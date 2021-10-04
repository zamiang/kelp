import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import React from 'react';

const useBackdropStyles = makeStyles((theme) => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
  },
}));
const Loading = (props: { isOpen: boolean; message: string }) => {
  const classes = useBackdropStyles();
  return (
    <Backdrop className={classes.backdrop} open={props.isOpen}>
      <Grid container alignItems="center" justifyContent="center">
        <Grid item style={{ width: '100%', textAlign: 'center' }}>
          <CircularProgress color="inherit" />
        </Grid>
        <Grid item>
          <Typography variant="h5">{props.message}</Typography>
        </Grid>
      </Grid>
    </Backdrop>
  );
};

export default Loading;
