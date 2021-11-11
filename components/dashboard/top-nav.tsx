import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
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
import SearchIcon from '../../public/icons/search.svg';
import SettingsIcon from '../../public/icons/settings.svg';
import KelpIcon from '../../public/kelp-24.svg';
import { getTagsForWebsite } from '../shared/website-tag';
import { IWebsiteTag } from '../store/data-types';
import { IStore } from '../store/use-store';
import { IWebsiteCache } from '../website/get-featured-websites';
import { TopTags, WebsiteTags } from './top-tags';

const PREFIX = 'TopNav';

const classes = {
  leftSection: `${PREFIX}-leftSection`,
  rightSection: `${PREFIX}-rightSection`,
  logo: `${PREFIX}-logo`,
  icon: `${PREFIX}-icon`,
  iconLight: `${PREFIX}-lightIcon`,
  iconDark: `${PREFIX}-lightDark`,
  iconCool: `${PREFIX}-lightCool`,
  iconImage: `${PREFIX}-iconImage`,
  iconSelected: `${PREFIX}-iconSelected`,
};

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
  [`& .${classes.logo}`]: {
    opacity: 1,
    transition: 'opacity 0.3s',
    '&:hover': {
      opacity: 0.5,
    },
  },
  [`& .${classes.icon}`]: {
    width: config.ICON_SIZE,
    height: config.ICON_SIZE,
    borderRadius: 10,
    background: 'grey',
  },
  [`& .${classes.iconCool}`]: {
    background: config.THEME_COOL_COLOR,
  },
  [`& .${classes.iconDark}`]: {
    background: config.THEME_DARK_COLOR,
  },
  [`& .${classes.iconLight}`]: {
    background: config.THEME_LIGHT_COLOR,
  },
  [`& .${classes.iconImage}`]: {
    color: theme.palette.text.primary,
  },
  [`& .${classes.iconSelected}`]: {
    color: theme.palette.primary.main,
  },
}));

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
  const isSearch = location.pathname === '/search';
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

  return (
    <Root>
      <div className={classes.leftSection}>
        <Grid
          container
          justifyContent="space-between"
          direction="column"
          style={{ height: '97vh' }}
        >
          <Grid item>
            <IconButton
              aria-label="search"
              onClick={(event) => {
                event.preventDefault();
                return navigate('/search');
              }}
              size="large"
            >
              {location.pathname.indexOf('search') > -1 ? (
                <SearchIcon
                  width={config.ICON_SIZE}
                  height={config.ICON_SIZE}
                  className={classes.iconSelected}
                />
              ) : (
                <SearchIcon
                  width={config.ICON_SIZE}
                  height={config.ICON_SIZE}
                  className={classes.iconImage}
                />
              )}
            </IconButton>
          </Grid>
          {!isSearch && !isWebsite && (
            <Grid item>
              <TopTags
                websiteTags={props.websiteTags}
                store={props.store}
                toggleWebsiteTag={props.toggleWebsiteTag}
                setWebsiteTags={props.setWebsiteTags}
                dragDropSource={props.dragDropSource}
              />
            </Grid>
          )}
          {isWebsite && tags && (
            <Grid item>
              <WebsiteTags tags={tags} store={props.store} />
            </Grid>
          )}
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
            <Link href="https://www.kelp.nyc" className={classes.logo}>
              <KelpIcon height="24" width="24" className={classes.iconSelected} />
            </Link>
          </Grid>
        </Grid>
      </div>
      <div className={classes.rightSection}>
        <Grid
          container
          justifyContent="space-between"
          direction="column"
          style={{ height: '97vh' }}
        >
          <Grid item>
            <Grid container justifyContent="flex-end" alignItems="center">
              <Grid item>
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
              </Grid>
              <Grid item>
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
              </Grid>
              <Grid item>
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
              </Grid>
              <Grid item>
                <Tooltip title="Settings">
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
          <Grid item>
            <Grid container justifyContent="flex-end" alignItems="center">
              <Grid item>
                <Tooltip title="Light Theme">
                  <IconButton
                    aria-controls="simple-menu"
                    aria-haspopup="true"
                    disabled={props.theme === config.THEME_LIGHT}
                    onClick={(event) => {
                      event.preventDefault();
                      props.setTheme(config.THEME_LIGHT);
                      localStorage.setItem(config.THEME, config.THEME_LIGHT);
                    }}
                    size="large"
                  >
                    <div className={clsx(classes.icon, classes.iconDark)}></div>
                  </IconButton>
                </Tooltip>
              </Grid>
              <Grid item>
                <Tooltip title="Dark Theme">
                  <IconButton
                    aria-controls="simple-menu"
                    aria-haspopup="true"
                    disabled={props.theme === config.THEME_DARK}
                    onClick={(event) => {
                      event.preventDefault();
                      props.setTheme(config.THEME_DARK);
                      localStorage.setItem(config.THEME, config.THEME_DARK);
                    }}
                    size="large"
                  >
                    <div className={clsx(classes.icon, classes.iconLight)}></div>
                  </IconButton>
                </Tooltip>
              </Grid>
              <Grid item>
                <Tooltip title="Cool Theme">
                  <IconButton
                    aria-controls="simple-menu"
                    aria-haspopup="true"
                    disabled={props.theme === config.THEME_COOL}
                    onClick={(event) => {
                      event.preventDefault();
                      props.setTheme(config.THEME_COOL);
                      localStorage.setItem(config.THEME, config.THEME_COOL);
                    }}
                    size="large"
                  >
                    <div className={clsx(classes.icon, classes.iconCool)}></div>
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
