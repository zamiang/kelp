import Container from '@material-ui/core/Container';
import Dialog from '@material-ui/core/Dialog';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import React, { useEffect, useState } from 'react';
import { Route, Switch, useHistory } from 'react-router-dom';
import Meetings from '../dashboard/meetings';
import ExpandedDocument from '../documents/expand-document';
import ErrorBoundaryComponent from '../error-tracking/error-boundary';
import Footer from '../homepage/footer';
import ExpandedMeeting from '../meeting/expand-meeting';
import { MeetingHighlight } from '../meeting/meeting-highlight';
import ExpandPerson from '../person/expand-person';
import { IStore } from '../store/use-store';
import Settings from '../user-profile/settings';
import { IFeaturedWebsite } from '../website/get-featured-websites';
import { HideUrlDialog } from '../website/hide-url-dialog';
import { WebsiteHighlights } from '../website/website-highlights';
import Search from './search';
import { TopNav } from './top-nav';

const useStyles = makeStyles((theme) => ({
  container: {
    paddingLeft: 180,
    paddingRight: 180,
    marginTop: theme.spacing(6),
  },
  footerContainer: {
    background: theme.palette.background.default,
  },
  content: {
    background: theme.palette.background.default,
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

export const DesktopDashboard = (props: {
  store: IStore;
  setIsDarkMode: (isDarkMode: boolean) => void;
  isDarkMode: boolean;
}) => {
  const classes = useStyles();
  const store = props.store;
  const router = useHistory();
  const [filter, setFilter] = useState<string>('all');
  const [hideDialogUrl, setHideDialogUrl] = useState<string | undefined>();
  const hideDialogDomain = hideDialogUrl ? new URL(hideDialogUrl).host : undefined;

  const hash = window.location.hash;
  if (hash.includes('meetings/')) {
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

  // This would be the initial time. We can get it from a hook
  // (meta.modified in your case) or for this example from a ref.
  // I'm setting this to 2000 meaning it was updated 2 seconds ago.
  const [minutes, setMinutes] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMinutes((minutes) => minutes + 1);
    }, 1000 * 60);
    return () => clearInterval(interval);
  }, []);

  const hideItem = (item: IFeaturedWebsite) => setHideDialogUrl(item.websiteId);

  const hideUrl = async (url: string) => {
    await props.store.websiteBlocklistStore.addWebsite(url);
    setHideDialogUrl(undefined);
  };

  const hideDomain = async (domain: string) => {
    await props.store.domainBlocklistStore.addDomain(domain);
    setHideDialogUrl(undefined);
  };
  return (
    <ErrorBoundaryComponent>
      <Dialog maxWidth="md" open={store.error && !is500Error(store.error) ? true : false}>
        <Alert severity="error">
          <AlertTitle>Error</AlertTitle>Please reload the page
          <Typography>{store.error}</Typography>
        </Alert>
      </Dialog>
      <HideUrlDialog
        hideDomain={hideDomain}
        hideUrl={hideUrl}
        hideDialogDomain={hideDialogDomain}
        hideDialogUrl={hideDialogUrl}
        setHideDialogUrl={setHideDialogUrl}
      />
      <div className={classes.content}>
        <TopNav
          store={store}
          toggleFilter={toggleFilter}
          currentFilter={filter}
          hideDialogUrl={hideDialogUrl}
          isDarkMode={props.isDarkMode}
          setIsDarkMode={props.setIsDarkMode}
        />
        <div className={classes.container}>
          <Container maxWidth="lg" disableGutters>
            <div>
              <Switch>
                <Route path="/search">
                  <Search store={store} isDarkMode={props.isDarkMode} />
                </Route>
                <Route path="/meetings/:slug">
                  <ExpandedMeeting store={store} isDarkMode={props.isDarkMode} />
                </Route>
                <Route path="/documents/:slug">
                  <ExpandedDocument store={store} />
                </Route>
                <Route path="/people/:slug">
                  <ExpandPerson
                    store={store}
                    hideWebsite={hideItem}
                    currentFilter={filter}
                    isDarkMode={props.isDarkMode}
                  />
                </Route>
                <Route path="/meetings">
                  <Meetings
                    store={store}
                    hideWebsite={hideItem}
                    hideDialogUrl={hideDialogUrl}
                    currentFilter={filter}
                    isDarkMode={props.isDarkMode}
                  />
                </Route>
                <Route path="/settings">
                  <Settings store={store} />
                </Route>
                <Route>
                  <MeetingHighlight
                    store={props.store}
                    hideWebsite={hideItem}
                    hideDialogUrl={hideDialogUrl}
                    currentFilter={filter}
                    isDarkMode={props.isDarkMode}
                  />
                  <WebsiteHighlights
                    store={store}
                    currentFilter={filter}
                    hideWebsite={hideItem}
                    hideDialogUrl={hideDialogUrl}
                    isDarkMode={props.isDarkMode}
                  />
                </Route>
              </Switch>
            </div>
          </Container>
        </div>
      </div>
      <div className={classes.footerContainer}>
        <Footer />
        <div style={{ display: 'none' }}>Page opened {minutes} minutes ago</div>
      </div>
    </ErrorBoundaryComponent>
  );
};
