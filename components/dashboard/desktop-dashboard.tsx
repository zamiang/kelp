import Container from '@material-ui/core/Container';
import Dialog from '@material-ui/core/Dialog';
import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import ThemeProvider from '@material-ui/styles/ThemeProvider';
import React, { useEffect, useState } from 'react';
import { Route, Switch, useHistory } from 'react-router-dom';
import { lightTheme } from '../../constants/theme';
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
import { TagHighlights } from '../website/tag-highlights';
import { WebsiteDialog } from '../website/website-dialog';
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
  const [websitePopupItem, setWebsitePopupItem] = useState<IFeaturedWebsite | undefined>();

  const showWebsitePopup = (item: IFeaturedWebsite) => {
    setWebsitePopupItem(item);
  };

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

  return (
    <ErrorBoundaryComponent>
      <Dialog maxWidth="md" open={store.error && !is500Error(store.error) ? true : false}>
        <Alert severity="error">
          <AlertTitle>Error</AlertTitle>Please reload the page
          <Typography>{store.error}</Typography>
        </Alert>
      </Dialog>
      <WebsiteDialog
        store={props.store}
        item={websitePopupItem}
        close={() => setWebsitePopupItem(undefined)}
        toggleWebsiteTag={toggleWebsiteTagClick}
        userTags={websiteTags}
      />
      <div className={classes.content}>
        <TopNav
          store={store}
          toggleFilter={toggleFilter}
          currentFilter={filter}
          isDarkMode={props.isDarkMode}
          setIsDarkMode={props.setIsDarkMode}
          websiteTags={websiteTags}
          isMicrosoftError={props.isMicrosoftError}
          toggleWebsiteTag={toggleWebsiteTagClick}
        />
        <ThemeProvider theme={lightTheme}>
          <Onboarding />
        </ThemeProvider>
        <div className={classes.container}>
          <Container maxWidth="lg" disableGutters>
            <div>
              <Switch>
                <Route path="/search">
                  <Search
                    store={store}
                    isDarkMode={props.isDarkMode}
                    websiteTags={websiteTags}
                    toggleWebsiteTag={toggleWebsiteTagClick}
                    showWebsitePopup={showWebsitePopup}
                  />
                </Route>
                <Route path="/meetings/:slug">
                  <ExpandedMeeting
                    store={store}
                    isDarkMode={props.isDarkMode}
                    websiteTags={websiteTags}
                    showWebsitePopup={showWebsitePopup}
                    toggleWebsiteTag={toggleWebsiteTagClick}
                  />
                </Route>
                <Route path="/documents/:slug">
                  <ExpandedDocument store={store} />
                </Route>
                <Route path="/people/:slug">
                  <ExpandPerson
                    store={store}
                    toggleWebsiteTag={toggleWebsiteTagClick}
                    websiteTags={websiteTags}
                    currentFilter={filter}
                    isDarkMode={props.isDarkMode}
                    showWebsitePopup={showWebsitePopup}
                  />
                </Route>
                <Route path="/meetings">
                  <Meetings
                    store={store}
                    toggleWebsiteTag={toggleWebsiteTagClick}
                    websiteTags={websiteTags}
                    currentFilter={filter}
                    isDarkMode={props.isDarkMode}
                    showWebsitePopup={showWebsitePopup}
                  />
                </Route>
                <Route path="/settings">
                  <Settings store={store} />
                </Route>
                <Route>
                  <MeetingHighlight
                    store={props.store}
                    toggleWebsiteTag={toggleWebsiteTagClick}
                    websiteTags={websiteTags}
                    currentFilter={filter}
                    isDarkMode={props.isDarkMode}
                    showWebsitePopup={showWebsitePopup}
                  />
                  <TagHighlights
                    store={props.store}
                    toggleWebsiteTag={toggleWebsiteTagClick}
                    websiteTags={websiteTags}
                    currentFilter={filter}
                    isDarkMode={props.isDarkMode}
                    showWebsitePopup={showWebsitePopup}
                  />
                  <WebsiteHighlights
                    store={store}
                    toggleWebsiteTag={toggleWebsiteTagClick}
                    currentFilter={filter}
                    websiteTags={websiteTags}
                    isDarkMode={props.isDarkMode}
                    showWebsitePopup={showWebsitePopup}
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
