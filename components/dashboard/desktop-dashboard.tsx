import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Dialog from '@material-ui/core/Dialog';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import React, { useState } from 'react';
import { Route, Switch, useHistory } from 'react-router-dom';
import { backgroundGradient } from '../../constants/theme';
import ExpandedDocument from '../documents/expand-document';
import ErrorBoundaryComponent from '../error-tracking/error-boundary';
import ExpandedMeeting from '../meeting/expand-meeting';
import { MeetingHighlight } from '../meeting/meeting-highlight';
import PopupHeader from '../mobile/popup-header';
import ExpandPerson from '../person/expand-person';
import { HomepageButtons } from '../shared/homepage-buttons';
import { IStore } from '../store/use-store';
import Settings from '../user-profile/settings';
import Search from './search';
import WebsitesHighlights from './website-highlights';

const useStyles = makeStyles((theme) => ({
  box: {
    background: '#fff',
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
  '@keyframes backgroundAnimation': {
    from: {
      backgroundPosition: '0% 75%',
    },
    '50%': { backgroundPosition: '100% 26%' },
    to: { backgroundPosition: '0% 75%' },
  },
  content: {
    background: backgroundGradient,
    backgroundSize: '400% 400%',
    animation: '$backgroundAnimation 20s ease infinite',
    overscrollBehavior: 'contain',
    overscrollBehaviorY: 'none',
    overscrollBehaviorX: 'none',
    minHeight: '100vh',
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingLeft: theme.spacing(2),
    overflow: 'hidden',
  },
}));

const is500Error = (error: Error) => (error as any).status === 500;

export const DesktopDashboard = (props: { store: IStore }) => {
  const classes = useStyles();
  const store = props.store;
  const router = useHistory();
  const [filter, setFilter] = useState<string>('all');

  const hash = window.location.hash;
  if (hash.includes('meetings')) {
    window.location.hash = '';
    router.push(hash.replace('#', ''));
  }

  const toggleFilter = (f?: string) => {
    if (!f) {
      return;
    } else if (f === filter) {
      setFilter('all');
    } else {
      setFilter(f);
    }
  };
  return (
    <ErrorBoundaryComponent>
      <Dialog maxWidth="md" open={store.error && !is500Error(store.error) ? true : false}>
        <Alert severity="error">
          <AlertTitle>Error</AlertTitle>Please reload the page
          <Typography>{store.error}</Typography>
        </Alert>
      </Dialog>
      <div className={classes.content}>
        <Container maxWidth="md">
          <PopupHeader store={store} shouldAlwaysShowSettings />
          <div>
            <Switch>
              <Route path="/search">
                <Search store={store} />
              </Route>
              <Route path="/meetings/:slug">
                <Box className={classes.box} boxShadow={1} borderRadius={16}>
                  <ExpandedMeeting store={store} />
                </Box>
              </Route>
              <Route path="/documents/:slug">
                <Box className={classes.box} boxShadow={1} borderRadius={16}>
                  <ExpandedDocument store={store} />
                </Box>
              </Route>
              <Route path="/people/:slug">
                <Box className={classes.box} boxShadow={1} borderRadius={16}>
                  <ExpandPerson store={store} />
                </Box>
              </Route>
              <Route path="/settings">
                <Box className={classes.box} boxShadow={1} borderRadius={16}>
                  <Settings store={store} />
                </Box>
              </Route>
              <Route>
                <HomepageButtons store={store} toggleFilter={toggleFilter} currentFilter={filter} />
                <WebsitesHighlights store={store} currentFilter={filter} />
                <MeetingHighlight store={props.store} />
              </Route>
            </Switch>
          </div>
        </Container>
      </div>
    </ErrorBoundaryComponent>
  );
};
