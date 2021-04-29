import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import BackIcon from '../../public/icons/back.svg';
import EditIcon from '../../public/icons/edit.svg';
import ExternalIcon from '../../public/icons/external.svg';
import SearchIcon from '../../public/icons/search.svg';
import SettingsIcon from '../../public/icons/settings.svg';
import SearchBar from '../nav/search-bar';
import { getGreeting } from '../shared/get-greeting';
import { IPerson } from '../store/data-types';
import { IStore } from '../store/use-store';

const useHeaderStyles = makeStyles((theme) => ({
  drawerPaper: {
    border: '0px',
    background: theme.palette.background.paper,
    borderBottom: `1px solid ${theme.palette.divider}`,
    padding: 9,
    zIndex: 6,
    justifyContent: 'space-between',
    borderRadius: 28,
    minHeight: 60,
  },
  drawerPaperNoPadding: {
    background: theme.palette.background.paper,
    borderRadius: 28,
    minHeight: 60,
  },
  whiteHeader: {
    border: '0px',
    position: 'sticky',
    top: 0,
    left: 0,
    background: 'white',
    padding: theme.spacing(1),
    zIndex: 6,
    justifyContent: 'space-between',
  },
  unSelected: {
    color: theme.palette.text.primary,
    transition: 'border 0.3s',
    borderBottom: `1px solid ${theme.palette.background.paper}`,
    '&:hover': {
      borderBottom: `1px solid ${theme.palette.divider}`,
    },
  },
  icon: {
    width: 22,
    height: 22,
  },
  greeting: {
    textAlign: 'center',
  },
}));

export const GoToSourceButton = (props: {
  store: IStore;
  type: 'meetings' | 'documents' | 'people';
  id: string;
}) => {
  const [link, setLink] = useState<string | undefined>(undefined);

  useEffect(() => {
    const fetchData = async () => {
      if (props.type === 'meetings') {
        const meeting = await props.store.timeDataStore.getById(props.id);
        if (meeting) {
          const editLink = meeting.link?.replace(
            'https://www.google.com/calendar/event?eid=',
            'https://calendar.google.com/calendar/u/0/r/eventedit/',
          );
          setLink(editLink);
        }
      } else if (props.type === 'documents') {
        const p = await props.store.documentDataStore.getById(props.id);
        if (p && p.link) {
          setLink(p.link);
        }
      } else if (props.type === 'people') {
        const p = await props.store.personDataStore.getById(props.id);
        if (p) {
          setLink(`http://contacts.google.com/search/${p?.name}`);
        }
      }
    };
    void fetchData();
  }, [props.type, props.id]);

  return (
    <IconButton href={link || ''} target="_blank">
      <EditIcon width="24" height="24" />
    </IconButton>
  );
};

const PluginHeader = (props: { store: IStore; user?: IPerson }) => {
  const [isSearchInputVisible, setSearchInputVisible] = useState<boolean>(false);
  const classes = useHeaderStyles();
  const router = useHistory();
  const location = useLocation();
  const isOnSubpage = location.pathname !== '/home' && location.pathname !== '/search';
  const shouldRenderSourceButton =
    location.pathname !== '/settings' && location.pathname !== '/people';
  const greeting = getGreeting();

  if (isOnSubpage) {
    const type = location.pathname.split('/')[1];
    const id = decodeURIComponent(location.pathname.split('/')[2]);
    return (
      <Grid container alignItems="center" justify="space-between">
        <Grid item>
          <Box boxShadow={1} bgcolor="white" style={{ padding: 9, borderRadius: 32 }}>
            <IconButton
              onClick={() => {
                router.goBack();
              }}
            >
              <BackIcon width="24" height="24" />
            </IconButton>
          </Box>
        </Grid>
        {shouldRenderSourceButton && (
          <Grid item>
            <Box boxShadow={1} bgcolor="white" style={{ padding: 9, borderRadius: 32 }}>
              <GoToSourceButton store={props.store} type={type as any} id={id} />
            </Box>
          </Grid>
        )}
      </Grid>
    );
  }

  if (isSearchInputVisible) {
    return (
      <Box className={classes.drawerPaperNoPadding} boxShadow={1}>
        <SearchBar onClose={() => setSearchInputVisible(false)} />
      </Box>
    );
  }

  const shouldRenderChromeIcon = window['chrome'] && window['chrome']['tabs'];

  return (
    <Box className={classes.drawerPaper} boxShadow={1}>
      <Grid
        container
        alignItems="center"
        justify="space-between"
        onClick={() => setSearchInputVisible(true)}
      >
        <Grid item>
          <Grid container alignItems="center">
            <Grid item>
              <IconButton onClick={() => setSearchInputVisible(true)}>
                <SearchIcon width="24" height="24" />
              </IconButton>
            </Grid>
          </Grid>
        </Grid>
        <Grid item>
          <div className={classes.greeting}>
            <Typography variant="h3" style={{ fontSize: 22, color: 'rgba(0,0,0,0.2)' }}>
              Good {greeting}
            </Typography>
          </div>
        </Grid>
        <Grid item>
          {shouldRenderChromeIcon && (
            <IconButton
              className={'ignore-react-onclickoutside'}
              aria-controls="simple-menu"
              aria-haspopup="true"
              onClick={() =>
                window['chrome'] &&
                window['chrome']['tabs'] &&
                chrome.tabs.create({ url: '/dashboard.html' })
              }
            >
              <ExternalIcon width="24" height="24" />
            </IconButton>
          )}
          {!shouldRenderChromeIcon && (
            <IconButton
              className={'ignore-react-onclickoutside'}
              aria-controls="simple-menu"
              aria-haspopup="true"
              onClick={(event) => {
                event.preventDefault();
                return router.push('/settings');
              }}
            >
              <SettingsIcon width="24" height="24" />
            </IconButton>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default PluginHeader;
