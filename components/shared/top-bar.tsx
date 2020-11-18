import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';

const useStyles = makeStyles((theme) => ({
  appBarSpacer: theme.mixins.toolbar,
  container: {
    display: 'flex',
    transition: 'background 0.3s',
  },
  content: {
    flexGrow: 1,
    height: '100vh',
    overflow: 'auto',
    background: 'white',
    overscrollBehavior: 'contain',
  },
  topBar: {
    width: '100%',
    borderBottom: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(3),
    position: 'sticky',
    top: 0,
    zIndex: 1,
    background: theme.palette.background.paper,
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(1),
    },
  },
}));

interface IProps {
  children?: any;
  title: string;
}

const TopBar = (props: IProps) => {
  const classes = useStyles();
  return (
    <div className={classes.topBar}>
      <Grid container justify="space-between" alignItems="center">
        <Grid item>
          <Typography variant="h5" color="textPrimary">
            {props.title}
          </Typography>
        </Grid>
        <Grid item>{props.children}</Grid>
      </Grid>
    </div>
  );
};

export default TopBar;
