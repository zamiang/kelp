import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import RefreshIcon from '@material-ui/icons/Refresh';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';

interface IProps {
  lastUpdated: Date;
  refresh: () => void;
  isLoading: boolean;
  loadingMessage?: string;
}

const useStyles = makeStyles((theme) => ({
  '@keyframes spinner-rotation': {
    from: { transform: 'rotate(0deg)' },
    to: { transform: 'rotate(360deg)' },
  },
  text: {
    color: theme.palette.text.hint,
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'pre',
    maxWidth: 170,
  },
  button: {
    transition: theme.transitions.create(['transform'], {
      duration: theme.transitions.duration.short,
    }),
  },
  loading: {
    animation: '$spinner-rotation linear infinite 1s',
  },
}));

const RefreshButton = (props: IProps) => {
  const classes = useStyles();

  //if (!props.isLoading) {
  //    return null;
  //}
  return (
    <Grid container alignItems="center" wrap="nowrap">
      <Grid item>
        <Typography noWrap variant="body1" className={classes.text}>
          {props.loadingMessage}
        </Typography>
      </Grid>
      <Grid item>
        <IconButton
          onClick={props.refresh}
          aria-label="refresh data"
          className={clsx(classes.button, props.isLoading && classes.loading)}
        >
          <RefreshIcon />
        </IconButton>
      </Grid>
    </Grid>
  );
};

export default RefreshButton;
