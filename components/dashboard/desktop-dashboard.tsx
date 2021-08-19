import Container from '@material-ui/core/Container';
import Dialog from '@material-ui/core/Dialog';
import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import ThemeProvider from '@material-ui/styles/ThemeProvider';
import React, { useEffect, useState } from 'react';
import { Route, Switch, useHistory } from 'react-router-dom';
import { darkTheme, lightTheme } from '../../constants/theme';
import Meetings from '../dashboard/meetings';
import ExpandedDocument from '../documents/expand-document';
import ErrorBoundaryComponent from '../error-tracking/error-boundary';
import Footer from '../homepage/footer';
import ExpandedMeeting from '../meeting/expand-meeting';
import { MeetingHighlight } from '../meeting/meeting-highlight';
import { Onboarding } from '../onboarding/onboarding';
import ExpandPerson from '../person/expand-person';
import { toggleWebsiteTag } from '../shared/website-tag';
import { IWebsiteTag } from '../store/data-types';
import { IStore } from '../store/use-store';
import Settings from '../user-profile/settings';
import { IFeaturedWebsite } from '../website/get-featured-websites';
import { HideUrlDialog } from '../website/hide-url-dialog';
import { TagHighlights } from '../website/tag-highlights';
import { WebsiteHighlights } from '../website/website-highlights';
import Search from './search';
import { TopNav } from './top-nav';

const useStyles = makeStyles((theme) => ({
  container: {
    paddingLeft: 180,
    paddingRight: 180,
    marginTop: 93,
  },
  footerContainer: {
    background: theme.palette.background.default,
    transition: 'background 0.3s',
  },
  content: {
    background: theme.palette.background.default,
    transition: 'background 0.3s',
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
  isMicrosoftError: boolean;
}) => {
  const classes = useStyles();
  const store = props.store;
  const router = useHistory();
  const [filter, setFilter] = useState<string>('all');
  const [websiteTags, setWebsiteTags] = useState<IWebsiteTag[]>([]);
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
      if (document.hasFocus()) {
        setMinutes((minutes) => minutes + 1);
      }
    }, 1000 * 60);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const i = await props.store.websiteTagStore.getAll();
      setWebsiteTags(i);
    };
    void fetchData();
  }, []);

  const toggleWebsiteTagClick = async (tag: string, websiteId?: string) => {
    await toggleWebsiteTag(tag, websiteTags, store, websiteId);
    const i = await props.store.websiteTagStore.getAll();
    setWebsiteTags(i);
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
          isMicrosoftError={props.isMicrosoftError}
        />
        <ThemeProvider theme={props.isDarkMode ? lightTheme : darkTheme}>
          <Onboarding />
        </ThemeProvider>
        <div className={classes.container}>
          <Container maxWidth="lg" disableGutters>
            <div>
              <Switch>
                <Route path="/search">
                  <Search
                    hideDialogUrl={hideDialogUrl}
                    store={store}
                    isDarkMode={props.isDarkMode}
                    websiteTags={websiteTags}
                    toggleWebsiteTag={toggleWebsiteTagClick}
                    hideWebsite={hideItem}
                  />
                </Route>
                <Route path="/meetings/:slug">
                  <ExpandedMeeting
                    hideDialogUrl={hideDialogUrl}
                    store={store}
                    isDarkMode={props.isDarkMode}
                    websiteTags={websiteTags}
                    toggleWebsiteTag={toggleWebsiteTagClick}
                    hideWebsite={hideItem}
                  />
                </Route>
                <Route path="/documents/:slug">
                  <ExpandedDocument store={store} />
                </Route>
                <Route path="/people/:slug">
                  <ExpandPerson
                    store={store}
                    hideDialogUrl={hideDialogUrl}
                    hideWebsite={hideItem}
                    toggleWebsiteTag={toggleWebsiteTagClick}
                    websiteTags={websiteTags}
                    currentFilter={filter}
                    isDarkMode={props.isDarkMode}
                  />
                </Route>
                <Route path="/meetings">
                  <Meetings
                    store={store}
                    hideWebsite={hideItem}
                    toggleWebsiteTag={toggleWebsiteTagClick}
                    websiteTags={websiteTags}
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
                    toggleWebsiteTag={toggleWebsiteTagClick}
                    websiteTags={websiteTags}
                    hideDialogUrl={hideDialogUrl}
                    currentFilter={filter}
                    isDarkMode={props.isDarkMode}
                  />
                  <TagHighlights
                    store={props.store}
                    hideWebsite={hideItem}
                    toggleWebsiteTag={toggleWebsiteTagClick}
                    websiteTags={websiteTags}
                    hideDialogUrl={hideDialogUrl}
                    currentFilter={filter}
                    isDarkMode={props.isDarkMode}
                  />
                  <WebsiteHighlights
                    store={store}
                    toggleWebsiteTag={toggleWebsiteTagClick}
                    currentFilter={filter}
                    websiteTags={websiteTags}
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
