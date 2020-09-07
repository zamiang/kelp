import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Toolbar from '@material-ui/core/Toolbar';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';

const useStyles = makeStyles((theme) => ({
  logoImage: {
    height: 60,
  },
  logo: {
    color: theme.palette.primary.dark,
    fontSize: 36,
    fontWeight: 700,
  },
  appBar: {
    background: 'white',
    zIndex: theme.zIndex.drawer + 1,
  },
  button: {
    minWidth: 100,
  },
}));

const HomepageTopBar = (props: { signIn: () => void }) => {
  const classes = useStyles();
  return (
    <AppBar elevation={0} position="absolute" className={classes.appBar}>
      <Toolbar>
        <ListItem>
          <ListItemIcon>
            <img className={classes.logoImage} src="kelp.svg" />
          </ListItemIcon>
          <ListItemText disableTypography={true} className={classes.logo}>
            Kelp
          </ListItemText>
        </ListItem>
        <Button
          className={classes.button}
          color="primary"
          variant="contained"
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
