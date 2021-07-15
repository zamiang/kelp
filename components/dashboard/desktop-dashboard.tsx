import Container from '@material-ui/core/Container';
import Dialog from '@material-ui/core/Dialog';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import React, { useState } from 'react';
import { Route, Switch, useHistory } from 'react-router-dom';
import { boxShadow } from '../../constants/theme';
import Meetings from '../dashboard/meetings';
import ExpandedDocument from '../documents/expand-document';
import ErrorBoundaryComponent from '../error-tracking/error-boundary';
import Footer from '../homepage/footer';
import ExpandedMeeting from '../meeting/expand-meeting';
import { MeetingHighlight } from '../meeting/meeting-highlight';
import SearchBar from '../nav/search-bar';
import ExpandPerson from '../person/expand-person';
import { IStore } from '../store/use-store';
import Settings from '../user-profile/settings';
import { IFeaturedWebsite } from '../website/get-featured-websites';
import { HideUrlDialog } from '../website/hide-url-dialog';
import { WebsiteHighlights } from '../website/website-highlights';
import Search from './search';
import { TopNav } from './top-nav';

const useStyles = makeStyles((theme) => ({
  box: {
    background: theme.palette.background.paper,
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
  container: {
    paddingLeft: 180,
    paddingRight: 180,
    marginTop: theme.spacing(6),
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
  dialogContent: {
    padding: theme.spacing(8),
  },
  button: {
    textDecoration: 'none',
    cursor: 'pointer',
    boxShadow,
    borderRadius: 20,
    background: theme.palette.background.paper,
    color: theme.palette.primary.main,
    paddingRight: theme.spacing(3),
    paddingLeft: theme.spacing(3),
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
                  <SearchBar isDarkMode={props.isDarkMode} />
                  <Search store={store} />
                </Route>
                <Route path="/meetings/:slug">
                  <ExpandedMeeting store={store} />
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
      <Footer />
    </ErrorBoundaryComponent>
  );
};
