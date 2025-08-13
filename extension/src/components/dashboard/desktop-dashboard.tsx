import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Container from '@mui/material/Container';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import React, { Suspense, useEffect, useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import ErrorBoundaryComponent from '../error-tracking/error-boundary';
import { MeetingHighlight } from '../meeting/meeting-highlight';
import { Onboarding } from '../onboarding/onboarding';
import { toggleWebsiteTag } from '../shared/website-tag';
import { LoadingSpinner } from '../shared/loading-spinner';
import { IWebsiteTag } from '../store/data-types';
import { IStore } from '../store/use-store';
import { AddWebsiteToTagDialog } from '../website/add-website-to-tag-dialog';
import { IWebsiteCache, getWebsitesCache } from '../website/get-featured-websites';
import { TagHighlights } from '../website/tag-highlights';
import { WebsiteHighlights } from '../website/website-highlights';
import Search from './search';
import { TopNav } from './top-nav';
import SearchBar from '../nav/search-bar';
import performanceMonitor from '../../utils/performance-monitor';

// Lazy load heavy components for better initial page load
const Meetings = React.lazy(() => import('../dashboard/meetings'));
const ExpandedDocument = React.lazy(() => import('../documents/expand-document'));
const ExpandedMeeting = React.lazy(() => import('../meeting/expand-meeting'));
const ExpandPerson = React.lazy(() => import('../person/expand-person'));
const Summary = React.lazy(() =>
  import('../summary/summary').then((module) => ({ default: module.Summary })),
);
const Settings = React.lazy(() => import('../user-profile/settings'));
const ExpandWebsite = React.lazy(() => import('../website/expand-website'));

// Loading fallback component
const RouteLoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
    <LoadingSpinner />
  </div>
);

// Modern CSS classes using BEM naming convention
const classes = {
  container: 'desktop-dashboard',
  content: 'desktop-dashboard__content',
  footer: 'desktop-dashboard__footer',
  topMarginContent: 'desktop-dashboard__top-margin-content',
  tagAll: 'desktop-dashboard__tag-all',
};

const is500Error = (error: Error) => (error as any).status === 500;

export const DesktopDashboard = (props: {
  store: IStore;
  setTheme: (t: string) => void;
  theme: string;
  isMicrosoftError: boolean;
}) => {
  const store = props.store;
  const navigate = useNavigate();
  const [websiteTags, setWebsiteTags] = useState<IWebsiteTag[]>([]);
  const [websiteCache, setWebsiteCache] = useState<IWebsiteCache>({});
  const [tagForWebsiteToTagDialog, setTagForWebsiteToTagDialog] = useState<string>();

  const updateWebsiteCache = async () => {
    // Use requestIdleCallback to avoid blocking the main thread
    const computeCache = () =>
      new Promise<IWebsiteCache>((resolve) => {
        requestIdleCallback(async () => {
          try {
            const cache = await getWebsitesCache(
              props.store.websiteVisitStore,
              props.store.websiteStore,
              props.store.domainBlocklistStore,
              props.store.websiteBlocklistStore,
            );
            (cache as any).LAST_UPDATED = new Date();
            resolve(cache);
          } catch (error) {
            console.error('Website cache computation error:', error);
            resolve({});
          }
        });
      });

    const cache = await computeCache();
    setWebsiteCache(cache);
    performanceMonitor.markCacheComputed();
  };

  useEffect(() => {
    // Debounce cache updates to avoid excessive computation
    const timeoutId = setTimeout(() => {
      void updateWebsiteCache();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [props.store.isLoading]);

  // Mark time to interactive when the dashboard is fully loaded
  useEffect(() => {
    if (websiteCache && Object.keys(websiteCache).length > 0 && websiteTags.length >= 0) {
      // Use a small delay to ensure rendering is complete
      requestAnimationFrame(() => {
        performanceMonitor.markTimeToInteractive();
      });
    }
  }, [websiteCache, websiteTags]);

  const hash = window.location.hash;
  if (hash.includes('meetings/')) {
    window.location.hash = '';
    navigate(hash.replace('#', ''));
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
      <div className={classes.container}>
        <Dialog maxWidth="md" open={store.error && !is500Error(store.error) ? true : false}>
          <Alert severity="error">
            <AlertTitle>Error</AlertTitle>Please reload the page
            <Typography>{store.error?.message || 'An unknown error occurred'}</Typography>
          </Alert>
        </Dialog>
        <AddWebsiteToTagDialog
          store={props.store}
          close={async () => {
            await updateWebsiteCache();
            setTagForWebsiteToTagDialog(undefined);
          }}
          tagForWebsiteToTagDialog={tagForWebsiteToTagDialog}
        />
        <div className={classes.content}>
          <TopNav
            store={store}
            theme={props.theme}
            setTheme={props.setTheme}
            websiteTags={websiteTags}
            setWebsiteTags={updateWebsiteTags}
            refetchWebsiteTags={refetchWebsiteTags}
            isMicrosoftError={props.isMicrosoftError}
            toggleWebsiteTag={toggleWebsiteTagClick}
            websiteCache={websiteCache}
          />
          <Onboarding />
          <Container maxWidth="md">
            <div>
              <Routes>
                <Route
                  path="/search"
                  element={
                    <div className={classes.topMarginContent}>
                      <SearchBar searchQuery={''} />
                      <Search
                        store={store}
                        websiteTags={websiteTags}
                        toggleWebsiteTag={toggleWebsiteTagClick}
                        websiteCache={websiteCache}
                      />
                    </div>
                  }
                />
                <Route
                  path="/websites/:slug"
                  element={
                    <Suspense fallback={<RouteLoadingFallback />}>
                      <ExpandWebsite
                        store={store}
                        websiteTags={websiteTags}
                        toggleWebsiteTag={toggleWebsiteTagClick}
                        websiteCache={websiteCache}
                      />
                    </Suspense>
                  }
                />
                <Route
                  path="/meetings/:slug"
                  element={
                    <Suspense fallback={<RouteLoadingFallback />}>
                      <ExpandedMeeting
                        store={store}
                        websiteTags={websiteTags}
                        toggleWebsiteTag={toggleWebsiteTagClick}
                        websiteCache={websiteCache}
                      />
                    </Suspense>
                  }
                />
                <Route
                  path="/documents/:slug"
                  element={
                    <Suspense fallback={<RouteLoadingFallback />}>
                      <ExpandedDocument store={store} websiteCache={websiteCache} />
                    </Suspense>
                  }
                />
                <Route
                  path="/people/:slug"
                  element={
                    <Suspense fallback={<RouteLoadingFallback />}>
                      <ExpandPerson
                        store={store}
                        toggleWebsiteTag={toggleWebsiteTagClick}
                        websiteTags={websiteTags}
                        websiteCache={websiteCache}
                      />
                    </Suspense>
                  }
                />
                <Route
                  path="/meetings"
                  element={
                    <Suspense fallback={<RouteLoadingFallback />}>
                      <Meetings
                        store={store}
                        toggleWebsiteTag={toggleWebsiteTagClick}
                        websiteTags={websiteTags}
                        websiteCache={websiteCache}
                      />
                    </Suspense>
                  }
                />
                <Route
                  path="/calendar"
                  element={
                    <Suspense fallback={<RouteLoadingFallback />}>
                      <Summary store={store} />
                    </Suspense>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <Suspense fallback={<RouteLoadingFallback />}>
                      <Settings store={store} />
                    </Suspense>
                  }
                />
                <Route
                  path="/home"
                  element={
                    <div className={classes.topMarginContent}>
                      <SearchBar searchQuery={''} />
                      <MeetingHighlight
                        store={props.store}
                        toggleWebsiteTag={toggleWebsiteTagClick}
                        websiteTags={websiteTags}
                        websiteCache={websiteCache}
                      />
                      <TagHighlights
                        store={props.store}
                        toggleWebsiteTag={toggleWebsiteTagClick}
                        websiteTags={websiteTags}
                        websiteCache={websiteCache}
                        showAddWebsiteDialog={setTagForWebsiteToTagDialog}
                      />
                      <div id="tag-all" className={classes.tagAll}>
                        <WebsiteHighlights
                          store={store}
                          toggleWebsiteTag={toggleWebsiteTagClick}
                          websiteTags={websiteTags}
                          websiteCache={websiteCache}
                        />
                      </div>
                    </div>
                  }
                />
              </Routes>
            </div>
          </Container>
        </div>
        <div className={classes.footer}>
          <div style={{ display: 'none' }}>Page opened {minutes} minutes ago</div>
        </div>
      </div>
    </ErrorBoundaryComponent>
  );
};
