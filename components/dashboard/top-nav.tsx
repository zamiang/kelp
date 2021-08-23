import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/core/styles/makeStyles';
import clsx from 'clsx';
import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import config from '../../constants/config';
import MoonIconOrange from '../../public/icons/moon-orange.svg';
import MoonIcon from '../../public/icons/moon.svg';
import SettingsIconOrange from '../../public/icons/settings-orange.svg';
import SettingsIconWhite from '../../public/icons/settings-white.svg';
import SettingsIcon from '../../public/icons/settings.svg';
import DayIconOrange from '../../public/icons/sun-orange.svg';
import DayIconWhite from '../../public/icons/sun-white.svg';
import SearchBar from '../nav/search-bar';
import { IWebsiteTag } from '../store/data-types';
import { IStore } from '../store/use-store';
import { TopTags } from './top-tags';

const useStyles = makeStyles((theme) => ({
  container: {
    position: 'fixed',
    top: 0,
    left: 0,
    overflow: 'hidden',
    paddingTop: theme.spacing(1.5),
    paddingBottom: theme.spacing(1.5),
    background: theme.palette.background.default,
    transition: 'background 0.3s',
    zIndex: 10,
  },
  leftSection: {
    width: 194,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
    flexShrink: 0,
  },
  rightSection: {
    width: 194,
    paddingRight: theme.spacing(2),
    paddingLeft: theme.spacing(1),
    flexShrink: 0,
  },
  searchContainer: {},
  button: {
    cursor: 'pointer',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  isSelected: {
    color: theme.palette.primary.main,
  },
}));

export const TopNav = (props: {
  store: IStore;
  toggleFilter: (filter: string) => void;
  currentFilter?: string;
  hideDialogUrl?: string;
  isDarkMode: boolean;
  setIsDarkMode: (isDarkMode: boolean) => void;
  isMicrosoftError: boolean;
  toggleWebsiteTag: (tag: string, websiteId: string) => Promise<void>;
  websiteTags: IWebsiteTag[];
}) => {
  const classes = useStyles();
  const router = useHistory();
  const location = useLocation();
  const isSearch = location.pathname === '/search';
  const isMeetingsSelected = location.pathname === '/meetings';
  return (
    <Grid
      container
      className={classes.container}
      justifyContent="space-between"
      alignItems="center"
    >
      <Grid item className={classes.leftSection}>
        <div className={classes.searchContainer}>
          <SearchBar isDarkMode={props.isDarkMode} />
        </div>
      </Grid>
      <Grid item xs>
        {!isSearch && (
          <Container maxWidth="lg" disableGutters>
            <Grid container justifyContent="space-between">
              <Grid item xs={10}>
                <TopTags
                  websiteTags={props.websiteTags}
                  store={props.store}
                  toggleWebsiteTag={props.toggleWebsiteTag}
                />
              </Grid>
              {props.isMicrosoftError && (
                <Grid item>
                  <Grid container>
                    <Grid item>
                      <Typography color="error" style={{ marginLeft: 10, marginTop: 7 }}>
                        Error: please login to your Microsoft account
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              )}
              <Grid item>
                <Typography
                  className={clsx(classes.button, isMeetingsSelected && classes.isSelected)}
                  onClick={(event) => {
                    event.preventDefault();
                    return router.push('/meetings');
                  }}
                >
                  View by meetings
                </Typography>
              </Grid>
            </Grid>
          </Container>
        )}
      </Grid>
      <Grid item className={classes.rightSection}>
        <Grid container justifyContent="flex-end">
          <Grid item>
            <Tooltip title="Light Mode">
              <IconButton
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
