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
import NavBar from '../nav/nav-bar';
import SearchBar from '../nav/search-bar';
import ExpandPerson from '../person/expand-person';
import { HomepageButtons } from '../shared/homepage-buttons';
import { IStore } from '../store/use-store';
import Settings from '../user-profile/settings';
import Search from './search';
import WebsitesHighlights from './website-highlights';

const useStyles = makeStyles((theme) => ({
  appBarSpacer: theme.mixins.toolbar,
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
  heading: {
    display: 'block',
    marginBottom: theme.spacing(2),
  },
}));

const is500Error = (error: Error) => (error as any).status === 500;

export const DesktopDashboard = (props: { store: IStore }) => {
  const classes = useStyles();
  const store = props.store;
  const router = useHistory();
  const [filter, setFilter] = useState<string | undefined>(undefined);

  const hash = window.location.hash;
  if (hash.includes('meetings')) {
    window.location.hash = '';
    router.push(hash.replace('#', ''));
  }

  const onDialogClose = () => {
    router.push('/home');
  };

  const toggleFilter = (f: string) => {
    if (f === filter) {
      setFilter(undefined);
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
      <MeetingHighlight store={props.store} />
      <div className={classes.content}>
        <Container maxWidth="lg">
          <NavBar store={store} />
          <HomepageButtons store={store} toggleFilter={toggleFilter} currentFilter={filter} />
          <WebsitesHighlights store={store} />
          <div>
            <Switch>
              <Route path="/search">
                <Dialog maxWidth="md" open={true} onClose={onDialogClose} fullScreen>
                  <Container maxWidth="xl">
                    <div
                      style={{
                        maxWidth: 800,
                        marginLeft: 'auto',
                        marginRight: 'auto',
                        marginTop: 48,
                      }}
                    >
                      <Box
                        boxShadow={1}
                        borderRadius={16}
                        overflow="auto"
                        style={{ background: '#fff' }}
                      >
                        <SearchBar />
                      </Box>
                      <div style={{ marginBottom: 12 }}>
                        <Search store={store} />
                      </div>
                    </div>
                  </Container>
                </Dialog>
              </Route>
              <Route path="/meetings/:slug">
                <Dialog maxWidth="sm" open={true} onClose={onDialogClose}>
                  <ExpandedMeeting store={store} />
                </Dialog>
              </Route>
              <Route path="/documents/:slug">
                <Dialog maxWidth="sm" open={true} onClose={onDialogClose}>
                  <ExpandedDocument store={store} />
                </Dialog>
              </Route>
              <Route path="/people/:slug">
                <Dialog maxWidth="sm" open={true} onClose={onDialogClose}>
                  <ExpandPerson store={store} />
                </Dialog>
              </Route>
              <Route path="/settings">
                <Dialog maxWidth="sm" open={true} onClose={onDialogClose}>
                  <Settings />
                </Dialog>
              </Route>
            </Switch>
          </div>
        </Container>
      </div>
    </ErrorBoundaryComponent>
  );
};
