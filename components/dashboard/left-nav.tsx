import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
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
import SearchIconOrange from '../../public/icons/search-orange.svg';
import SearchIconWhite from '../../public/icons/search-white.svg';
import SearchIcon from '../../public/icons/search.svg';
import { IStore } from '../store/use-store';

const useStyles = makeStyles((theme) => ({
  container: {
    position: 'fixed',
    top: theme.spacing(0),
    left: theme.spacing(1),
    overflow: 'hidden',
    maxWidth: 200,
    width: 164,
  },
}));

export const LeftNav = (props: {
  store: IStore;
  toggleFilter: (filter: string) => void;
  currentFilter?: string;
  hideDialogUrl?: string;
  isDarkMode: boolean;
}) => {
  const classes = useStyles();
  const router = useHistory();
  const location = useLocation();

  return (
    <Grid container className={classes.container}>
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
      <Grid item>
        <IconButton
          onClick={(event) => {
            event.preventDefault();
            return router.push('/search');
          }}
        >
          {location.pathname.indexOf('search') > -1 ? (
            <SearchIconOrange width={config.ICON_SIZE} height={config.ICON_SIZE} />
          ) : props.isDarkMode ? (
            <SearchIconWhite width={config.ICON_SIZE} height={config.ICON_SIZE} />
          ) : (
            <SearchIcon width={config.ICON_SIZE} height={config.ICON_SIZE} />
          )}
        </IconButton>
      </Grid>
    </Grid>
  );
};
