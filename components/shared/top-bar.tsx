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
    height: 83,
    borderBottom: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(3),
    paddingRight: theme.spacing(4),
    paddingLeft: theme.spacing(4),
    position: 'sticky',
    top: 0,
    zIndex: 5, // Above avatar group
    background: theme.palette.background.paper,
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(1),
      height: 'auto',
      marginTop: -theme.spacing(1), // fixes weird bounce issue
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
