import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Container from '@mui/material/Container';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import React, { useEffect, useState } from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { Route, Routes, useNavigate } from 'react-router-dom';
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
import { AddWebsiteToTagDialog } from '../website/add-website-to-tag-dialog';
import { getWebsitesForTag } from '../website/draggable-website-highlights';
import ExpandWebsite from '../website/expand-website';
import { IWebsiteCache, getWebsitesCache } from '../website/get-featured-websites';
import { MostRecentTab } from '../website/most-recent-tab';
import { TagHighlights } from '../website/tag-highlights';
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
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingLeft: theme.spacing(2),
    minHeight: '100vh',
  },
}));

const reorder = (list: any[], startIndex: number, endIndex: number) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
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
  const [dragDropSource, setDragDropSource] = useState<string>();
  const [rowLoading, setRowLoading] = useState<string>();
  const [startX, setStartX] = useState<number>(0);
  const [startScrollX, setStartScrollX] = useState<number>(0);
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

  // Go to new scroll position every time the mouse moves while dragging is activated
  const handleMouseMove = ({ clientX }: React.MouseEvent) => {
    // const { startX, startScrollX } = this.state;
    const scrollX = startScrollX - clientX + startX;
    window.scrollTo(scrollX, 0);
    const windowScrollX = window.scrollX;
    if (scrollX !== windowScrollX) {
      setStartX(clientX + windowScrollX - startScrollX);
    }
  };

  const onDragEnd = async (result: DropResult) => {
    // TODO
    if (!result.destination) {
      return;
    }

    // Dragging from most recent tab
    if (result.source.droppableId === 'most-recent-tab') {
      // add tag and sort
      const tag = result.destination.droppableId.replace('-websites', '');
      const websiteId = result.draggableId;

      setRowLoading(tag);
      const newWebsite = await props.store.websiteStore.getById(websiteId);
      if (!newWebsite) {
        return chrome.tabs.query(
          {
            url: websiteId,
          },
          (tabs) => {
            const addWebsite = async () => {
              await props.store.websiteStore.trackVisitFromTab(tabs[0], tag);
              props.store.incrementLoading();
              setRowLoading(undefined);
            };
            void addWebsite();
          },
        );
      }

      const newTags = newWebsite?.tags?.split(' ');

      newTags?.push(tag);
      if (newWebsite && newTags) {
        await props.store.websiteStore.updateTags(newWebsite?.id, newTags.join(' '));
      }

      const websites = getWebsitesForTag(websiteCache, tag);
      websites.splice(result.destination.index, 0, newWebsite as any);
      await props.store.websiteStore.saveOrder(websites);
      props.store.incrementLoading();
      setRowLoading(undefined);

      // dragging between tags
    } else if (result.destination.droppableId !== result.source.droppableId) {
      // add tag and sort
      const draggableTag = result.source.droppableId.replace('-websites', '');
      const tag = result.destination.droppableId.replace('-websites', '');
      const websiteId = result.draggableId.replace(`${draggableTag}-`, '');
      setRowLoading(tag);

      const newWebsite = await props.store.websiteStore.getById(websiteId);

      const newTags = newWebsite?.tags?.split(' ');
      newTags?.push(tag);
      if (newWebsite && newTags) {
        await props.store.websiteStore.updateTags(newWebsite?.id, newTags.join(' '));
      }

      const websites = getWebsitesForTag(websiteCache, tag);
      websites.splice(result.destination.index, 0, newWebsite as any);
      await props.store.websiteStore.saveOrder(websites);
      props.store.incrementLoading();
      setRowLoading(undefined);

      // dragging
    } else if (result.destination.droppableId.includes('-websites')) {
      const tag = result.destination.droppableId.replace('-websites', '');
      const websites = getWebsitesForTag(websiteCache, tag);
      setRowLoading(tag);

      const tw = reorder(websites, result.source.index, result.destination.index);
      await props.store.websiteStore.saveOrder(tw);
      props.store.incrementLoading();
      setRowLoading(undefined);

      // Left tags sorting
    } else if (result.destination.droppableId === 'top-tags') {
      const tt = reorder(websiteTags, result.source.index, result.destination.index);
      setWebsiteTags(tt);
      await props.store.websiteTagStore.updateWebsiteTags(tt);
    }
    setDragDropSource(undefined);
    window.removeEventListener('mousemove', handleMouseMove as any);
    window.removeEventListener('mouseup', onMouseUp as any);
    setStartX(0);
    setStartScrollX(0);
  };

  const onDragStart = (result: DropResult) => {
    const source = result.source.droppableId;
    setDragDropSource(source);
  };

  const onMouseDown = (event: React.MouseEvent) => {
    window.addEventListener('mousemove', handleMouseMove as any);
    window.addEventListener('mouseup', onMouseUp);
    setStartX(event.clientX);
    setStartScrollX(window.scrollX);
  };

  const onMouseUp = () => {
    if (startX) {
      window.removeEventListener('mousemove', handleMouseMove as any);
      window.removeEventListener('mouseup', onMouseUp as any);
      setStartScrollX(0);
      setStartX(0);
    }
  };

  return (
    <ErrorBoundaryComponent>
      <div onMouseDown={onMouseDown}>
        <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
          <DesktopDashboardContainer>
            <Dialog maxWidth="md" open={store.error && !is500Error(store.error) ? true : false}>
              <Alert severity="error">
                <AlertTitle>Error</AlertTitle>Please reload the page
                <Typography>{store.error}</Typography>
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
                dragDropSource={dragDropSource}
              />
              <Onboarding />
              <div className={classes.container}>
                <Container maxWidth="lg" disableGutters>
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
                            dragDropSource={dragDropSource}
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
                            <MostRecentTab />
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
                              dragDropSource={dragDropSource}
                              tagRowLoading={rowLoading}
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
            </div>
            <div className={classes.footerContainer}>
              <div style={{ display: 'none' }}>Page opened {minutes} minutes ago</div>
            </div>
          </DesktopDashboardContainer>
        </DragDropContext>
      </div>
    </ErrorBoundaryComponent>
  );
};
