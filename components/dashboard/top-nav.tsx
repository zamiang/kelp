import { TopPeople } from '../person/top-people';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import config from '../../constants/config';
import CalendarIcon from '../../public/icons/calendar.svg';
import HomeIcon from '../../public/icons/home.svg';
import MeetingsIcon from '../../public/icons/meetings.svg';
import SettingsIcon from '../../public/icons/settings.svg';
import { getTagsForWebsite } from '../shared/website-tag';
import { IWebsiteTag } from '../store/data-types';
import { IStore } from '../store/use-store';
import { IWebsiteCache } from '../website/get-featured-websites';
import { ExpandMeetingNav, ExpandPersonNav, TopTags, WebsiteTags } from './top-tags';

const PREFIX = 'TopNav';

const classes = {
  leftSection: `${PREFIX}-leftSection`,
  icon: `${PREFIX}-icon`,
  iconLight: `${PREFIX}-iconLight`,
  iconDark: `${PREFIX}-iconDark`,
  iconNb: `${PREFIX}-iconNb`,
  iconCool: `${PREFIX}-iconCool`,
  iconImage: `${PREFIX}-iconImage`,
  iconSelected: `${PREFIX}-iconSelected`,
  centerSection: `${PREFIX}-centerSection`,
};

const Root = styled('div')(({ theme }) => ({
  [`& .${classes.leftSection}`]: {
    position: 'fixed',
    top: '47vh',
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
  [`& .${classes.centerSection}`]: {
    padding: theme.spacing(1),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    width: '100%',
    zIndex: 10,
    borderBottom: '1px solid',
    borderColor: theme.palette.divider,
  },
  [`& .${classes.icon}`]: {
    width: config.ICON_SIZE,
    height: config.ICON_SIZE,
    borderRadius: 10,
    background: 'grey',
  },
  [`& .${classes.iconCool}`]: {
    background: config.THEME_COOL_HIGHLIGHT_COLOR,
  },
  [`& .${classes.iconDark}`]: {
    background: config.THEME_DARK_HIGHLIGHT_COLOR,
  },
  [`& .${classes.iconNb}`]: {
    background: config.THEME_NB_HIGHLIGHT_COLOR,
  },
  [`& .${classes.iconLight}`]: {
    background: config.THEME_LIGHT_HIGHLIGHT_COLOR,
  },
  [`& .${classes.iconImage}`]: {
    color: theme.palette.text.primary,
  },
  [`& .${classes.iconSelected}`]: {
    color: theme.palette.primary.main,
  },
}));

const LeftNavForRoute = (props: {
  path: string;
  tags?: string[];
  store: IStore;
  toggleWebsiteTag: (tag: string, websiteId?: string) => Promise<void>;
  websiteTags: IWebsiteTag[];
  setWebsiteTags: (t: IWebsiteTag[]) => void;
  dragDropSource?: string;
}) => {
  if (props.path.includes('/people/')) {
    return (
      <Box>
        <ExpandPersonNav />
      </Box>
    );
  }
  if (props.path.includes('/meetings/')) {
    return (
      <Box>
        <ExpandMeetingNav />
      </Box>
    );
  }
  if (props.path.includes('/websites/') && props.tags) {
    return (
      <Box>
        <WebsiteTags tags={props.tags} store={props.store} />
      </Box>
    );
  }
  return (
    <Box>
      <TopTags
        websiteTags={props.websiteTags}
        store={props.store}
        toggleWebsiteTag={props.toggleWebsiteTag}
        setWebsiteTags={props.setWebsiteTags}
        dragDropSource={props.dragDropSource}
      />
    </Box>
  );
};

export const TopNav = (props: {
  store: IStore;
  theme: string;
  setTheme: (s: string) => void;
  isMicrosoftError: boolean;
  toggleWebsiteTag: (tag: string, websiteId?: string) => Promise<void>;
  websiteTags: IWebsiteTag[];
  setWebsiteTags: (t: IWebsiteTag[]) => void;
  refetchWebsiteTags: () => void;
  websiteCache: IWebsiteCache;
  dragDropSource?: string;
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [tags, setTags] = useState<string[]>([]);
  const isMeetingsSelected = location.pathname === '/meetings';
  const isHomeSelected = location.pathname === '/home';
  const isSettingsSelected = location.pathname === '/settings';
  const isCalendarSelected = location.pathname === '/calendar';
  const isWebsite = location.pathname.includes('/websites');
  const slug = isWebsite ? location.pathname.replace('/websites/', '') : '';

  useEffect(() => {
    const fetchData = () => {
      if (isWebsite && slug) {
        const w = props.websiteCache[decodeURIComponent(slug)];
        setTags(getTagsForWebsite(w.tags || '', props.websiteTags));
      } else {
        setTags([]);
      }
    };
    void fetchData();
  }, [props.store.isLoading, slug, isWebsite]);

  const setTheme = (theme: string) => {
    props.setTheme(theme);
    return chrome.storage.sync.set({
      [config.THEME]: theme,
    });
  };

  return (
    <Root>
      <div className={classes.leftSection}>
        <Box
          display="flex"
          justifyContent="space-between"
          flexDirection="column"
          style={{ height: '97vh' }}
        >
          <LeftNavForRoute
            path={location.pathname}
            store={props.store}
            tags={tags}
            dragDropSource={props.dragDropSource}
            toggleWebsiteTag={props.toggleWebsiteTag}
            setWebsiteTags={props.setWebsiteTags}
            websiteTags={props.websiteTags}
          />
          {props.isMicrosoftError && (
            <Box>
              <Box>
                <Typography color="error" style={{ marginLeft: 10, marginTop: 7 }}>
                  Error: please login to your Microsoft account
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </div>
      <div className={classes.centerSection}>
        <Grid container spacing={2} justifyContent="space-between" alignItems="center">
          <Grid>
            <TopPeople store={props.store} />
          </Grid>
          <Grid>
            <Grid container spacing={2} alignItems="center">
              <Grid>
                <Tooltip title="Vert Theme" placement="bottom">
                  <IconButton
                    aria-controls="simple-menu"
                    aria-haspopup="true"
                    onClick={(event) => {
                      event.preventDefault();
                      return setTheme(config.THEME_LIGHT);
                    }}
                    size="large"
                  >
                    <div className={clsx(classes.icon, classes.iconLight)}></div>
                  </IconButton>
                </Tooltip>
              </Grid>
              <Grid>
                <Tooltip title="NB Theme" placement="bottom">
                  <IconButton
                    aria-controls="simple-menu"
                    aria-haspopup="true"
                    onClick={(event) => {
                      event.preventDefault();
                      return setTheme(config.THEME_NB);
                    }}
                    size="large"
                  >
                    <div className={clsx(classes.icon, classes.iconNb)}></div>
                  </IconButton>
                </Tooltip>
              </Grid>
              <Grid>
                <Tooltip title="Cool Theme" placement="bottom">
                  <IconButton
                    aria-controls="simple-menu"
                    aria-haspopup="true"
                    onClick={(event) => {
                      event.preventDefault();
                      return setTheme(config.THEME_COOL);
                    }}
                    size="large"
                  >
                    <div className={clsx(classes.icon, classes.iconCool)}></div>
                  </IconButton>
                </Tooltip>
              </Grid>
              <Grid>
                <Tooltip title="Dark Theme" placement="bottom">
                  <IconButton
                    aria-controls="simple-menu"
                    aria-haspopup="true"
                    onClick={(event) => {
                      event.preventDefault();
                      return setTheme(config.THEME_DARK);
                    }}
                    size="large"
                  >
                    <div className={clsx(classes.icon, classes.iconDark)}></div>
                  </IconButton>
                </Tooltip>
              </Grid>
              <Grid>
                <Tooltip title="Home" placement="bottom">
                  <IconButton
                    aria-label="home"
                    onClick={(event) => {
                      event.preventDefault();
                      return navigate('/home');
                    }}
                    size="large"
                  >
                    {isHomeSelected ? (
                      <HomeIcon
                        width={config.ICON_SIZE}
                        height={config.ICON_SIZE}
                        className={classes.iconSelected}
                      />
                    ) : (
                      <HomeIcon
                        width={config.ICON_SIZE}
                        height={config.ICON_SIZE}
                        className={classes.iconImage}
                      />
                    )}
                  </IconButton>
                </Tooltip>
              </Grid>
              <Grid>
                <Tooltip title="Meeting List" placement="bottom">
                  <IconButton
                    aria-label="meetings"
                    onClick={(event) => {
                      event.preventDefault();
                      return navigate('/meetings');
                    }}
                    size="large"
                  >
                    {isMeetingsSelected ? (
                      <MeetingsIcon
                        width={config.ICON_SIZE}
                        height={config.ICON_SIZE}
                        className={classes.iconSelected}
                      />
                    ) : (
                      <MeetingsIcon
                        width={config.ICON_SIZE}
                        height={config.ICON_SIZE}
                        className={classes.iconImage}
                      />
                    )}
                  </IconButton>
                </Tooltip>
              </Grid>
              <Grid>
                <Tooltip title="Calendar Tag Cloud" placement="bottom">
                  <IconButton
                    aria-label="calendar"
                    onClick={(event) => {
                      event.preventDefault();
                      return navigate('/calendar');
                    }}
                    size="large"
                  >
                    {isCalendarSelected ? (
                      <CalendarIcon
                        width={config.ICON_SIZE}
                        height={config.ICON_SIZE}
                        className={classes.iconSelected}
                      />
                    ) : (
                      <CalendarIcon
                        width={config.ICON_SIZE}
                        height={config.ICON_SIZE}
                        className={classes.iconImage}
                      />
                    )}
                  </IconButton>
                </Tooltip>
              </Grid>
              <Grid>
                <Tooltip title="Settings" placement="bottom">
                  <IconButton
                    aria-label="settings"
                    onClick={(event) => {
                      event.preventDefault();
                      return navigate('/settings');
                    }}
                    size="large"
                  >
                    {isSettingsSelected ? (
                      <SettingsIcon
                        width={config.ICON_SIZE}
                        height={config.ICON_SIZE}
                        className={classes.iconSelected}
                      />
                    ) : (
                      <SettingsIcon
                        width={config.ICON_SIZE}
                        height={config.ICON_SIZE}
                        className={classes.iconImage}
                      />
                    )}
                  </IconButton>
                </Tooltip>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </div>
    </Root>
  );
};
