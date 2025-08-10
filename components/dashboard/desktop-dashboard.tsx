import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Container from '@mui/material/Container';
import Dialog from '@mui/material/Dialog';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import React, { useEffect, useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import Meetings from '../dashboard/meetings';
import ExpandedDocument from '../documents/expand-document';
import ErrorBoundaryComponent from '../error-tracking/error-boundary';
import ExpandedMeeting from '../meeting/expand-meeting';
import { MeetingHighlight } from '../meeting/meeting-highlight';
import { Onboarding } from '../onboarding/onboarding';
import ExpandPerson from '../person/expand-person';
import { TopPeople } from '../person/top-people';
import { toggleWebsiteTag } from '../shared/website-tag';
import { IWebsiteTag } from '../store/data-types';
import { IStore } from '../store/use-store';
import { Summary } from '../summary/summary';
import Settings from '../user-profile/settings';
import { AddWebsiteToTagDialog } from '../website/add-website-to-tag-dialog';
import ExpandWebsite from '../website/expand-website';
import { IWebsiteCache, getWebsitesCache } from '../website/get-featured-websites';
import { MostRecentTab } from '../website/most-recent-tab';
import { TagHighlights } from '../website/tag-highlights';
import { WebsiteHighlights } from '../website/website-highlights';
import Search from './search';
import { TopNav } from './top-nav';

const PREFIX = 'DesktopDashboard';

const classes = {
  footerContainer: `${PREFIX}-footerContainer`,
  content: `${PREFIX}-content`,
};

const DesktopDashboardContainer = styled('div')(({ theme }) => ({
  [`& .${classes.footerContainer}`]: {
    background: theme.palette.background.default,
    transition: 'background 0.3s',
  },
  [`& .${classes.content}`]: {
    background: theme.palette.background.default,
    transition: 'background 0.3s',
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingLeft: theme.spacing(2),
    minHeight: '100vh',
  },
}));

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
    const cache = await getWebsitesCache(
      props.store.websiteVisitStore,
      props.store.websiteStore,
      props.store.domainBlocklistStore,
      props.store.websiteBlocklistStore,
    );
    (cache as any).LAST_UPDATED = new Date();
    setWebsiteCache(cache);
  };

  useEffect(() => {
    void updateWebsiteCache();
  }, [props.store.isLoading]);

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
      <DesktopDashboardContainer>
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
                    <Search
                      store={store}
                      websiteTags={websiteTags}
                      toggleWebsiteTag={toggleWebsiteTagClick}
                      websiteCache={websiteCache}
                    />
                  }
                />
                <Route
                  path="/websites/:slug"
                  element={
                    <ExpandWebsite
                      store={store}
                      websiteTags={websiteTags}
                      toggleWebsiteTag={toggleWebsiteTagClick}
                      websiteCache={websiteCache}
                    />
                  }
                />
                <Route
                  path="/meetings/:slug"
                  element={
                    <ExpandedMeeting
                      store={store}
                      websiteTags={websiteTags}
                      toggleWebsiteTag={toggleWebsiteTagClick}
                      websiteCache={websiteCache}
                    />
                  }
                />
                <Route
                  path="/documents/:slug"
                  element={<ExpandedDocument store={store} websiteCache={websiteCache} />}
                />
                <Route
                  path="/people/:slug"
                  element={
                    <ExpandPerson
                      store={store}
                      toggleWebsiteTag={toggleWebsiteTagClick}
                      websiteTags={websiteTags}
                      websiteCache={websiteCache}
                    />
                  }
                />
                <Route
                  path="/meetings"
                  element={
                    <Meetings
                      store={store}
                      toggleWebsiteTag={toggleWebsiteTagClick}
                      websiteTags={websiteTags}
                      websiteCache={websiteCache}
                    />
                  }
                />
                <Route path="/calendar" element={<Summary store={store} />} />
                <Route path="/settings" element={<Settings store={store} />} />
                <Route
                  path="/home"
                  element={
                    <div>
                      <Box display="flex">
                        <Box flex="0 0 25%">
                          <MostRecentTab />
                        </Box>
                        <Box flex="0 0 75%">
                          <TopPeople store={props.store} />
                        </Box>
                      </Box>
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
                      <div id="tag-all" style={{ marginBottom: 80 }}>
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
        <div className={classes.footerContainer}>
          <div style={{ display: 'none' }}>Page opened {minutes} minutes ago</div>
        </div>
      </DesktopDashboardContainer>
    </ErrorBoundaryComponent>
  );
};
