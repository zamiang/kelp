import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import MuiLink from '@material-ui/core/Link';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Toolbar from '@material-ui/core/Toolbar';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import Link from 'next/link';
import React from 'react';
import config from '../../constants/config';

const useStyles = makeStyles((theme) => ({
  logoImage: {
    height: 60,
  },
  logo: {
    fontSize: 36,
    fontWeight: 700,
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
  yellowBackground: {
    backgroundColor: config.YELLOW_BACKGROUND,
  },
  orangeBackground: {
    backgroundColor: config.ORANGE_BACKGROUND,
  },
  purpleBackground: {
    backgroundColor: config.PURPLE_BACKGROUND,
  },
  pinkBackground: {
    backgroundColor: config.PINK_BACKGROUND,
  },
  button: {
    minWidth: 100,
    marginLeft: 'auto',
  },
  link: {
    color: 'black',
    fontSize: theme.typography.body1.fontSize,
  },
  menuItem: {
    display: 'inline-block',
    marginRight: theme.spacing(4),
    marginLeft: theme.spacing(4),
  },
  logoContainer: {
    maxWidth: 200,
  },
}));

const HomepageTopBar = (props: { color: string; signIn: () => void }) => {
  const classes = useStyles();
  return (
    <AppBar
      elevation={0}
      position="absolute"
      className={clsx(
        classes.appBar,
        props.color === 'security' && classes.yellowBackground,
        props.color === 'about' && classes.orangeBackground,
        props.color === 'privacy' && classes.purpleBackground,
        props.color === 'terms' && classes.pinkBackground,
      )}
    >
      <Toolbar>
        <Link href="/">
          <ListItem className={classes.logoContainer}>
            <ListItemIcon>
              <img className={classes.logoImage} src="kelp.svg" />
            </ListItemIcon>
            <ListItemText disableTypography={true} className={classes.logo}>
              Kelp
            </ListItemText>
          </ListItem>
        </Link>
        <div className={classes.menuItem}>
          <Link href="/about" passHref>
            <MuiLink className={classes.link}>Learn about Kelp</MuiLink>
          </Link>
        </div>
        <div className={classes.menuItem}>
          <Link href="/security" passHref>
            <MuiLink className={classes.link}>How we keep your data safe</MuiLink>
          </Link>
        </div>
        <div className={classes.menuItem}>
          <Link href="/test-dashboard?tab=meetings" passHref>
            <MuiLink className={classes.link} target="_blank">
              Try with test data
            </MuiLink>
          </Link>
        </div>
        <Button
          className={classes.button}
          variant="outlined"
          onClick={props.signIn}
          disableElevation={true}
        >
          Log In
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default HomepageTopBar;
