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
import SettingsIconOrange from '../../public/icons/settings-orange.svg';
import SettingsIconWhite from '../../public/icons/settings-white.svg';
import SettingsIcon from '../../public/icons/settings.svg';
import SearchBar from '../nav/search-bar';
import { IWebsiteTag } from '../store/data-types';
import { IStore } from '../store/use-store';
import { TopTags } from './top-tags';

const useStyles = makeStyles((theme) => ({
  leftSection: {
    position: 'fixed',
    top: theme.spacing(1.5),
    left: 0,
    transition: 'background 0.3s',
    zIndex: 10,
    width: 228,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
    flexShrink: 0,
    [theme.breakpoints.down('xl')]: {
      width: 187,
    },
    [theme.breakpoints.down('lg')]: {
      width: 179,
    },
    [theme.breakpoints.down('md')]: {
      width: 139,
    },
  },
  rightSection: {
    position: 'fixed',
    top: theme.spacing(1.5),
    right: 0,
    transition: 'background 0.3s',
    width: 228,
    paddingRight: theme.spacing(2),
    paddingLeft: theme.spacing(1),
    flexShrink: 0,
    [theme.breakpoints.down('xl')]: {
      width: 187,
    },
    [theme.breakpoints.down('lg')]: {
      width: 179,
    },
    [theme.breakpoints.down('md')]: {
      width: 139,
    },
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
  isDarkMode: boolean;
  currentFilter?: string;
  isMicrosoftError: boolean;
  toggleWebsiteTag: (tag: string, websiteId?: string) => Promise<void>;
  websiteTags: IWebsiteTag[];
}) => {
  const classes = useStyles();
  const router = useHistory();
  const location = useLocation();
  const isSearch = location.pathname === '/search';
  const isMeetingsSelected = location.pathname === '/meetings';
  return (
    <React.Fragment>
      <div className={classes.leftSection}>
        <div className={classes.searchContainer}>
          <SearchBar isDarkMode={props.isDarkMode} />
        </div>
        {!isSearch && (
          <Container maxWidth="lg" disableGutters>
            <Grid container justifyContent="space-between">
              <Grid item xs>
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
            </Grid>
          </Container>
        )}
      </div>
      <div className={classes.rightSection}>
        <Grid container justifyContent="flex-end" alignItems="center">
          <Grid item>
            <Typography
              className={clsx(classes.button, isMeetingsSelected && classes.isSelected)}
              onClick={(event) => {
                event.preventDefault();
                return router.push('/meetings');
              }}
            >
              Meetings
            </Typography>
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
      </div>
    </React.Fragment>
  );
};
