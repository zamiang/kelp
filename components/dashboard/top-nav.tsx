import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import config from '../../constants/config';
import MeetingsIconOrange from '../../public/icons/calendar-orange.svg';
import MeetingsIconWhite from '../../public/icons/calendar-white.svg';
import MeetingsIcon from '../../public/icons/calendar.svg';
import HomeIconOrange from '../../public/icons/home-orange.svg';
import HomeIconWhite from '../../public/icons/home-white.svg';
import HomeIcon from '../../public/icons/home.svg';
import MoonIconOrange from '../../public/icons/moon-orange.svg';
import MoonIcon from '../../public/icons/moon.svg';
import SettingsIconOrange from '../../public/icons/settings-orange.svg';
import SettingsIconWhite from '../../public/icons/settings-white.svg';
import SettingsIcon from '../../public/icons/settings.svg';
import DayIconOrange from '../../public/icons/sun-orange.svg';
import DayIconWhite from '../../public/icons/sun-white.svg';
import SearchBar from '../nav/search-bar';
import { IStore } from '../store/use-store';
import { TopFilters } from './top-filters';

const useStyles = makeStyles((theme) => ({
  container: {
    position: 'fixed',
    top: 0,
    left: 0,
    overflow: 'hidden',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    background: theme.palette.background.default,
    zIndex: 10,
  },
  leftRightSection: {
    maxWidth: 200,
    width: 187,
    paddingLeft: theme.spacing(0.5),
    paddingRight: theme.spacing(0.5),
  },
  searchContainer: {
    paddingTop: 7,
  },
}));

export const TopNav = (props: {
  store: IStore;
  toggleFilter: (filter: string) => void;
  currentFilter?: string;
  hideDialogUrl?: string;
  isDarkMode: boolean;
  setIsDarkMode: (isDarkMode: boolean) => void;
}) => {
  const classes = useStyles();
  const router = useHistory();
  const location = useLocation();

  return (
    <Grid
      container
      className={classes.container}
      justifyContent="space-between"
      alignContent="center"
    >
      <Grid item className={classes.leftRightSection}>
        <div className={classes.searchContainer}>
          <SearchBar isDarkMode={props.isDarkMode} />
        </div>
      </Grid>
      <Grid item xs>
        <Container maxWidth="lg" disableGutters>
          <Grid container justifyContent="space-between">
            <Grid item>
              <Grid container>
                <Grid item>
                  <IconButton
                    className={'ignore-react-onclickoutside'}
                    aria-controls="simple-menu"
                    aria-haspopup="true"
                    onClick={(event) => {
                      event.preventDefault();
                      return router.push('/home');
                    }}
                  >
                    {location.pathname === '/home' ? (
                      <HomeIconOrange width={config.ICON_SIZE} height={config.ICON_SIZE} />
                    ) : props.isDarkMode ? (
                      <HomeIconWhite width={config.ICON_SIZE} height={config.ICON_SIZE} />
                    ) : (
                      <HomeIcon width={config.ICON_SIZE} height={config.ICON_SIZE} />
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
                      return router.push('/meetings');
                    }}
                  >
                    {location.pathname === '/meetings' ? (
                      <MeetingsIconOrange width={config.ICON_SIZE} height={config.ICON_SIZE} />
                    ) : props.isDarkMode ? (
                      <MeetingsIconWhite width={config.ICON_SIZE} height={config.ICON_SIZE} />
                    ) : (
                      <MeetingsIcon width={config.ICON_SIZE} height={config.ICON_SIZE} />
                    )}
                  </IconButton>
                </Grid>
              </Grid>
            </Grid>
            {(location.pathname === '/meetings' || location.pathname === '/home') && (
              <Grid item>
                <TopFilters
                  store={props.store}
                  toggleFilter={props.toggleFilter}
                  hideDialogUrl={props.hideDialogUrl}
                  currentFilter={props.currentFilter}
                  isDarkMode={props.isDarkMode}
                />
              </Grid>
            )}
          </Grid>
        </Container>
      </Grid>
      <Grid item className={classes.leftRightSection}>
        <Grid container justifyContent="flex-end">
          <Grid item>
            <Tooltip title="Light Mode">
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
                  <DayIconWhite width={config.ICON_SIZE} height={config.ICON_SIZE} />
                ) : (
                  <DayIconOrange width={config.ICON_SIZE} height={config.ICON_SIZE} />
                )}
              </IconButton>
            </Tooltip>
          </Grid>
          <Grid item>
            <Tooltip title="Dark Mode">
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
            </Tooltip>
          </Grid>
          <Grid item>
            <Tooltip title="Settings">
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
                  <SettingsIconOrange width={config.ICON_SIZE} height={config.ICON_SIZE} />
                ) : props.isDarkMode ? (
                  <SettingsIconWhite width={config.ICON_SIZE} height={config.ICON_SIZE} />
                ) : (
                  <SettingsIcon width={config.ICON_SIZE} height={config.ICON_SIZE} />
                )}
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};
