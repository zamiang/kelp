import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Toolbar from '@material-ui/core/Toolbar';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';
import config from '../config';

const useStyles = makeStyles((theme) => ({
  logoImage: {
    height: 60,
  },
  logo: {
    color: theme.palette.primary.main,
    fontSize: 36,
    fontWeight: 700,
  },
  appBar: {
    background: 'white',
    zIndex: theme.zIndex.drawer + 1,
  },
}));

const HomepageTopBar = (props: { signIn: () => void }) => {
  const classes = useStyles();
  return (
    <AppBar elevation={0} position="absolute" className={classes.appBar}>
      <Toolbar>
        <ListItem>
          <ListItemIcon>
            <img className={classes.logoImage} src={`${config.DOMAIN}/images/kelp.svg`} />
          </ListItemIcon>
          <ListItemText disableTypography={true} className={classes.logo}>
            Kelp
          </ListItemText>
        </ListItem>
        <Button
          color="primary"
          variant="contained"
          size="small"
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
