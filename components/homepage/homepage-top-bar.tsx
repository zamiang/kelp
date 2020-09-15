import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import MuiLink from '@material-ui/core/Link';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Toolbar from '@material-ui/core/Toolbar';
import { makeStyles } from '@material-ui/core/styles';
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
  button: {
    minWidth: 100,
    marginLeft: 'auto',
  },
  link: {
    color: 'black', // theme.palette.primary.dark,
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

const HomepageTopBar = (props: { signIn: () => void }) => {
  const classes = useStyles();
  return (
    <AppBar elevation={0} position="absolute" className={classes.appBar}>
      <Toolbar>
        <ListItem className={classes.logoContainer}>
          <ListItemIcon>
            <img className={classes.logoImage} src="kelp.svg" />
          </ListItemIcon>
          <ListItemText disableTypography={true} className={classes.logo}>
            Kelp
          </ListItemText>
        </ListItem>
        <div className={classes.menuItem}>
          <Link href="/security" passHref>
            <MuiLink className={classes.link}>How we keep your data safe</MuiLink>
          </Link>
        </div>
        <div className={classes.menuItem}>
          <Link href="/test-dashboard" passHref>
            <MuiLink className={classes.link}>Try with test data</MuiLink>
          </Link>
        </div>
        <div className={classes.menuItem}>
          <MuiLink className={classes.link} href={config.PROJECT_PLAN_LINK}>
            Read the project plan
          </MuiLink>
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
