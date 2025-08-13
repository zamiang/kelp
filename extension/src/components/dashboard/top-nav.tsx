import { TopPeople } from '../person/top-people';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import clsx from 'clsx';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import config from '../../../../constants/config';
import CalendarIcon from '../../../../public/icons/calendar.svg';
import HomeIcon from '../../../../public/icons/home.svg';
import MeetingsIcon from '../../../../public/icons/meetings.svg';
import SettingsIcon from '../../../../public/icons/settings.svg';
import { IStore } from '../store/use-store';
import '../../styles/components/dashboard/top-nav.css';

export const TopNav = (props: { store: IStore; theme: string; setTheme: (s: string) => void }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMeetingsSelected = location.pathname === '/meetings';
  const isHomeSelected = location.pathname === '/home';
  const isSettingsSelected = location.pathname === '/settings';
  const isCalendarSelected = location.pathname === '/calendar';

  const setTheme = (theme: string) => {
    props.setTheme(theme);
    return chrome.storage.sync.set({
      [config.THEME]: theme,
    });
  };

  return (
    <div className="top-nav-root">
      <div className="top-nav-center-section">
        <Grid
          container
          spacing={2}
          justifyContent="space-between"
          alignItems="flex-start"
          flexWrap="nowrap"
        >
          <Grid>
            <TopPeople store={props.store} />
          </Grid>
          <Grid style={{ minWidth: 416 }}>
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
                    <div className={clsx('top-nav-icon', 'top-nav-icon-light')}></div>
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
                    <div className={clsx('top-nav-icon', 'top-nav-icon-nb')}></div>
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
                    <div className={clsx('top-nav-icon', 'top-nav-icon-cool')}></div>
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
                    <div className={clsx('top-nav-icon', 'top-nav-icon-dark')}></div>
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
                        className="top-nav-icon-selected"
                      />
                    ) : (
                      <HomeIcon
                        width={config.ICON_SIZE}
                        height={config.ICON_SIZE}
                        className="top-nav-icon-image"
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
                        className="top-nav-icon-selected"
                      />
                    ) : (
                      <MeetingsIcon
                        width={config.ICON_SIZE}
                        height={config.ICON_SIZE}
                        className="top-nav-icon-image"
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
                        className="top-nav-icon-selected"
                      />
                    ) : (
                      <CalendarIcon
                        width={config.ICON_SIZE}
                        height={config.ICON_SIZE}
                        className="top-nav-icon-image"
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
                        className="top-nav-icon-selected"
                      />
                    ) : (
                      <SettingsIcon
                        width={config.ICON_SIZE}
                        height={config.ICON_SIZE}
                        className="top-nav-icon-image"
                      />
                    )}
                  </IconButton>
                </Tooltip>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </div>
    </div>
  );
};
