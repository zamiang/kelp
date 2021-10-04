import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import config from '../../constants/config';
import MeetingsIconOrange from '../../public/icons/calendar-orange.svg';
import MeetingsIconWhite from '../../public/icons/calendar-white.svg';
import MeetingsIcon from '../../public/icons/calendar.svg';
import HomeIconOrange from '../../public/icons/home-orange.svg';
import HomeIconWhite from '../../public/icons/home-white.svg';
import HomeIcon from '../../public/icons/home.svg';
import SettingsIconOrange from '../../public/icons/settings-orange.svg';
import SettingsIconWhite from '../../public/icons/settings-white.svg';
import SettingsIcon from '../../public/icons/settings.svg';
import SearchBar from '../nav/search-bar';
import { IWebsiteTag } from '../store/data-types';
import { IStore } from '../store/use-store';
import { TopTags } from './top-tags';

const PREFIX = 'TopNav';

const classes = {
  leftSection: `${PREFIX}-leftSection`,
  rightSection: `${PREFIX}-rightSection`,
  searchContainer: `${PREFIX}-searchContainer`,
  button: `${PREFIX}-button`,
  isSelected: `${PREFIX}-isSelected`,
};

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')(({ theme }) => ({
  [`& .${classes.leftSection}`]: {
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
    [theme.breakpoints.down('xl')]: {
      width: 179,
    },
    [theme.breakpoints.down('lg')]: {
      width: 139,
    },
  },

  [`& .${classes.rightSection}`]: {
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
    [theme.breakpoints.down('xl')]: {
      width: 179,
    },
    [theme.breakpoints.down('lg')]: {
      width: 139,
    },
  },

  [`& .${classes.searchContainer}`]: {},

  [`& .${classes.button}`]: {
    cursor: 'pointer',
    '&:hover': {
      textDecoration: 'underline',
    },
  },

  [`& .${classes.isSelected}`]: {
    color: theme.palette.primary.main,
  },
}));

export const TopNav = (props: {
  store: IStore;
  isDarkMode: boolean;
  isMicrosoftError: boolean;
  toggleWebsiteTag: (tag: string, websiteId?: string) => Promise<void>;
  websiteTags: IWebsiteTag[];
}) => {
  const router = useHistory();
  const location = useLocation();
  const isSearch = location.pathname === '/search';
  const isMeetingsSelected = location.pathname === '/meetings';
  const isHomeSelected = location.pathname === '/home';
  const isSettingsSelected = location.pathname === '/settings';
  return (
    <Root>
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
            <IconButton
              aria-label="home"
              onClick={(event) => {
                event.preventDefault();
                return router.push('/home');
              }}
              size="large"
            >
              {isHomeSelected ? (
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
              aria-label="meetings"
              onClick={(event) => {
                event.preventDefault();
                return router.push('/meetings');
              }}
              size="large"
            >
              {isMeetingsSelected ? (
                <MeetingsIconOrange width={config.ICON_SIZE} height={config.ICON_SIZE} />
              ) : props.isDarkMode ? (
                <MeetingsIconWhite width={config.ICON_SIZE} height={config.ICON_SIZE} />
              ) : (
                <MeetingsIcon width={config.ICON_SIZE} height={config.ICON_SIZE} />
              )}
            </IconButton>
          </Grid>
          <Grid item>
            <Tooltip title="Settings">
              <IconButton
                aria-label="settings"
                onClick={(event) => {
                  event.preventDefault();
                  return router.push('/settings');
                }}
                size="large"
              >
                {isSettingsSelected ? (
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
    </Root>
  );
};
