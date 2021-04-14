import IconButton from '@material-ui/core/IconButton';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import React from 'react';
import RotateIcon from '../../public/icons/rotate.svg';

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
  if (!props.isLoading) {
    return null;
  }
  return (
    <IconButton
      onClick={props.refresh}
      aria-label="refresh data"
      className={clsx(classes.button, props.isLoading && classes.loading)}
    >
      <RotateIcon width="24" height="24" />
    </IconButton>
  );
};

export default RefreshButton;
