import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import config from '../../constants/config';
import MoonIconOrange from '../../public/icons/moon-orange.svg';
import MoonIcon from '../../public/icons/moon.svg';
import SettingsIconOrange from '../../public/icons/settings-orange.svg';
import SettingsIcon from '../../public/icons/settings.svg';
import DayIconOrange from '../../public/icons/sun-orange.svg';
import DayIcon from '../../public/icons/sun.svg';

const useStyles = makeStyles((theme) => ({
  container: {
    position: 'fixed',
    top: theme.spacing(2),
    right: theme.spacing(2),
    overflow: 'hidden',
    width: 64,
  },
}));

export const RightNav = (props: {
  isDarkMode: boolean;
  setIsDarkMode: (isDarkMode: boolean) => void;
}) => {
  const classes = useStyles();
  const router = useHistory();
  const location = useLocation();

  return (
    <Grid container className={classes.container} spacing={1} justifyContent="center">
      <Grid item>
        <IconButton
          className={'ignore-react-onclickoutside'}
          aria-controls="simple-menu"
          aria-haspopup="true"
          onClick={(event) => {
            event.preventDefault();
            props.setIsDarkMode(false);
            localStorage.setItem(config.DARK_MODE, String(false));
          }}
        >
          {props.isDarkMode ? (
            <DayIcon width="24" height="24" />
          ) : (
            <DayIconOrange width="24" height="24" />
          )}
        </IconButton>
      </Grid>
      <Grid item>
        <IconButton
          className={'ignore-react-onclickoutside'}
          aria-controls="simple-menu"
          aria-haspopup="true"
          onClick={(event) => {
            event.preventDefault();
            props.setIsDarkMode(true);
            localStorage.setItem(config.DARK_MODE, String(true));
          }}
        >
          {props.isDarkMode ? (
            <MoonIconOrange width="18" height="18" />
          ) : (
            <MoonIcon width="18" height="18" />
          )}
        </IconButton>
      </Grid>
      <Grid item>
        <IconButton
          className={'ignore-react-onclickoutside'}
          aria-controls="simple-menu"
          aria-haspopup="true"
          onClick={(event) => {
            event.preventDefault();
            return router.push('/settings');
          }}
        >
          {location.pathname === '/settings' ? (
            <SettingsIconOrange width="24" height="24" />
          ) : (
            <SettingsIcon width="24" height="24" />
          )}
        </IconButton>
      </Grid>
    </Grid>
  );
};
