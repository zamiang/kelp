import { ThemeProvider as EmotionThemeProvider } from '@emotion/react';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Container from '@mui/material/Container';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import { StyledEngineProvider, styled } from '@mui/material/styles';
import ThemeProvider from '@mui/styles/ThemeProvider';
import React, { useEffect, useState } from 'react';
import { Route, Switch, useHistory } from 'react-router-dom';
import { lightTheme } from '../../constants/theme';
import Meetings from '../dashboard/meetings';
import ExpandedDocument from '../documents/expand-document';
import ErrorBoundaryComponent from '../error-tracking/error-boundary';
import ExpandedMeeting from '../meeting/expand-meeting';
import { MeetingHighlight } from '../meeting/meeting-highlight';
import { Onboarding } from '../onboarding/onboarding';
import ExpandPerson from '../person/expand-person';
import { toggleWebsiteTag } from '../shared/website-tag';
import { IWebsiteTag } from '../store/data-types';
import { IStore } from '../store/use-store';
import { Summary } from '../summary/summary';
import Settings from '../user-profile/settings';
import {
  IFeaturedWebsite,
  IWebsiteCache,
  getWebsitesCache,
} from '../website/get-featured-websites';
import { TagHighlights } from '../website/tag-highlights';
import { WebsiteDialog } from '../website/website-dialog';
import { WebsiteHighlights } from '../website/website-highlights';
import Search from './search';
import { TopNav } from './top-nav';

const PREFIX = 'DesktopDashboard';

const classes = {
  container: `${PREFIX}-container`,
  footerContainer: `${PREFIX}-footerContainer`,
  content: `${PREFIX}-content`,
};

const DesktopDashboardContainer = styled('div')(({ theme }) => ({
  [`& .${classes.container}`]: {
    paddingLeft: 210,
    paddingRight: 210,
    marginTop: 62,
    [theme.breakpoints.down('xl')]: {
      paddingLeft: 180,
      paddingRight: 180,
    },
    [theme.breakpoints.down('xl')]: {
      paddingLeft: 160,
      paddingRight: 160,
    },
    [theme.breakpoints.down('lg')]: {
      paddingLeft: 120,
      paddingRight: 120,
    },
  },

  [`& .${classes.footerContainer}`]: {
    background: theme.palette.background.default,
    transition: 'background 0.3s',
  },

  [`& .${classes.content}`]: {
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
  const store = props.store;
  const router = useHistory();
  const [websiteTags, setWebsiteTags] = useState<IWebsiteTag[]>([]);
  const [websitePopupItem, setWebsitePopupItem] = useState<IFeaturedWebsite | undefined>();
  const [websiteCache, setWebsiteCache] = useState<IWebsiteCache>({});

  useEffect(() => {
    const fetchData = async () => {
      const cache = await getWebsitesCache(
        props.store.websiteVisitStore,
        props.store.websiteStore,
        props.store.domainBlocklistStore,
        props.store.websiteBlocklistStore,
      );
      setWebsiteCache(cache);
    };
    void fetchData();
  }, [props.store.isLoading]);

  const showWebsitePopup = (item: IFeaturedWebsite) => {
    setWebsitePopupItem(item);
  };

  const hash = window.location.hash;
  if (hash.includes('meetings/')) {
    window.location.hash = '';
    router.push(hash.replace('#', ''));
  }

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

  const refetchWebsiteTags = async () => {
    const i = await props.store.websiteTagStore.getAll();
    setWebsiteTags(i);
  };

  useEffect(() => {
    void refetchWebsiteTags();
  }, [props.store.isLoading]);

  const toggleWebsiteTagClick = async (tag: string, websiteId?: string) => {
    await toggleWebsiteTag(tag, websiteTags, store, websiteId);
    return refetchWebsiteTags();
  };

  const updateWebsiteTags = async (wt: IWebsiteTag[]) => {
    setWebsiteTags(wt);
    await props.store.websiteTagStore.updateWebsiteTags(wt);
  };

  return (
    <ErrorBoundaryComponent>
      <DesktopDashboardContainer>
        <Dialog maxWidth="md" open={store.error && !is500Error(store.error) ? true : false}>
          <Alert severity="error">
            <AlertTitle>Error</AlertTitle>Please reload the page
            <Typography>{store.error}</Typography>
          </Alert>
        </Dialog>
        <WebsiteDialog
          store={props.store}
          item={websitePopupItem}
          close={() => {
            setWebsitePopupItem(undefined);
            props.store.incrementLoading();
          }}
          toggleWebsiteTag={toggleWebsiteTagClick}
          userTags={websiteTags}
        />
        <div className={classes.content}>
          <TopNav
            store={store}
            isDarkMode={props.isDarkMode}
            websiteTags={websiteTags}
            setWebsiteTags={updateWebsiteTags}
            refetchWebsiteTags={refetchWebsiteTags}
            isMicrosoftError={props.isMicrosoftError}
            toggleWebsiteTag={toggleWebsiteTagClick}
          />
          <StyledEngineProvider injectFirst>
            <EmotionThemeProvider theme={lightTheme}>
              <ThemeProvider theme={lightTheme}>
                <Onboarding />
              </ThemeProvider>
            </EmotionThemeProvider>
          </StyledEngineProvider>
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
                      websiteCache={websiteCache}
                    />
                  </Route>
                  <Route path="/meetings/:slug">
                    <ExpandedMeeting
                      store={store}
                      isDarkMode={props.isDarkMode}
                      websiteTags={websiteTags}
                      showWebsitePopup={showWebsitePopup}
                      toggleWebsiteTag={toggleWebsiteTagClick}
                      websiteCache={websiteCache}
                    />
                  </Route>
                  <Route path="/documents/:slug">
                    <ExpandedDocument store={store} websiteCache={websiteCache} />
                  </Route>
                  <Route path="/people/:slug">
                    <ExpandPerson
                      store={store}
                      toggleWebsiteTag={toggleWebsiteTagClick}
                      websiteTags={websiteTags}
                      isDarkMode={props.isDarkMode}
                      showWebsitePopup={showWebsitePopup}
                      websiteCache={websiteCache}
                    />
                  </Route>
                  <Route path="/meetings">
                    <Meetings
                      store={store}
                      toggleWebsiteTag={toggleWebsiteTagClick}
                      websiteTags={websiteTags}
                      isDarkMode={props.isDarkMode}
                      showWebsitePopup={showWebsitePopup}
                      websiteCache={websiteCache}
                    />
                  </Route>
                  <Route path="/calendar">
                    <Summary store={store} isDarkMode={props.isDarkMode} />
                  </Route>
                  <Route path="/settings">
                    <Settings
                      store={store}
                      isDarkMode={props.isDarkMode}
                      setIsDarkMode={props.setIsDarkMode}
                    />
                  </Route>
                  <Route>
                    <MeetingHighlight
                      store={props.store}
                      toggleWebsiteTag={toggleWebsiteTagClick}
                      websiteTags={websiteTags}
                      isDarkMode={props.isDarkMode}
                      showWebsitePopup={showWebsitePopup}
                      websiteCache={websiteCache}
                    />
                    <TagHighlights
                      store={props.store}
                      toggleWebsiteTag={toggleWebsiteTagClick}
                      websiteTags={websiteTags}
                      isDarkMode={props.isDarkMode}
                      showWebsitePopup={showWebsitePopup}
                      websiteCache={websiteCache}
                    />
                    <div id="tag-all">
                      <WebsiteHighlights
                        store={store}
                        toggleWebsiteTag={toggleWebsiteTagClick}
                        websiteTags={websiteTags}
                        isDarkMode={props.isDarkMode}
                        showWebsitePopup={showWebsitePopup}
                        websiteCache={websiteCache}
                      />
                    </div>
                  </Route>
                </Switch>
              </div>
            </Container>
          </div>
        </div>
        <div className={classes.footerContainer}>
          <div style={{ display: 'none' }}>Page opened {minutes} minutes ago</div>
        </div>
      </DesktopDashboardContainer>
    </ErrorBoundaryComponent>
  );
};
