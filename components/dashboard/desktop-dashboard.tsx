import { ThemeProvider as EmotionThemeProvider } from '@emotion/react';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Container from '@mui/material/Container';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import { StyledEngineProvider, styled } from '@mui/material/styles';
import ThemeProvider from '@mui/styles/ThemeProvider';
import React, { useEffect, useState } from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
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
import { AddWebsiteToTagDialog } from '../website/add-website-to-tag-dialog';
import { getWebsitesForTag } from '../website/draggable-website-highlights';
import ExpandWebsite from '../website/expand-website';
import { IWebsiteCache, getWebsitesCache } from '../website/get-featured-websites';
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
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingLeft: theme.spacing(2),
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
  setIsDarkMode: (isDarkMode: boolean) => void;
  isDarkMode: boolean;
  isMicrosoftError: boolean;
}) => {
  const store = props.store;
  const router = useHistory();
  const [websiteTags, setWebsiteTags] = useState<IWebsiteTag[]>([]);
  const [websiteCache, setWebsiteCache] = useState<IWebsiteCache>({});
  const [dragDropSource, setDragDropSource] = useState<string>();
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

    if (result.destination.index === result.source.index) {
      return;
    }

    if (result.destination.droppableId !== result.source.droppableId) {
      // add tag and sort
      const draggableTag = result.source.droppableId.replace('-websites', '');
      const tag = result.destination.droppableId.replace('-websites', '');
      const websiteId = result.draggableId.replace(`${draggableTag}-`, '');
      const newWebsite = await props.store.websiteStore.getById(websiteId);

      const newTags = newWebsite?.tags?.split(' ');
      newTags?.push(tag);
      if (newWebsite && newTags) {
        await props.store.websiteStore.updateTags(newWebsite?.id, newTags.join(' '));
        console.log(newWebsite, newTags);
      }

      const websites = getWebsitesForTag(websiteCache, tag);
      websites.splice(result.destination.index, 0, newWebsite as any);
      await props.store.websiteStore.saveOrder(websites);
      props.store.incrementLoading();
    } else if (result.destination.droppableId.includes('-websites')) {
      const tag = result.destination.droppableId.replace('-websites', '');
      const websites = getWebsitesForTag(websiteCache, tag);

      const tw = reorder(websites, result.source.index, result.destination.index);
      await props.store.websiteStore.saveOrder(tw);
      props.store.incrementLoading();
    } else if (result.destination.droppableId === 'top-tags') {
      const tt = reorder(websiteTags, result.source.index, result.destination.index);
      setWebsiteTags(tt);
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
                isDarkMode={props.isDarkMode}
                websiteTags={websiteTags}
                setWebsiteTags={updateWebsiteTags}
                refetchWebsiteTags={refetchWebsiteTags}
                isMicrosoftError={props.isMicrosoftError}
                toggleWebsiteTag={toggleWebsiteTagClick}
                websiteCache={websiteCache}
                dragDropSource={dragDropSource}
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
                          websiteCache={websiteCache}
                        />
                      </Route>
                      <Route path="/websites/:slug">
                        <ExpandWebsite
                          store={store}
                          isDarkMode={props.isDarkMode}
                          websiteTags={websiteTags}
                          toggleWebsiteTag={toggleWebsiteTagClick}
                          websiteCache={websiteCache}
                          dragDropSource={dragDropSource}
                        />
                      </Route>
                      <Route path="/meetings/:slug">
                        <ExpandedMeeting
                          store={store}
                          isDarkMode={props.isDarkMode}
                          websiteTags={websiteTags}
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
                          websiteCache={websiteCache}
                        />
                      </Route>
                      <Route path="/meetings">
                        <Meetings
                          store={store}
                          toggleWebsiteTag={toggleWebsiteTagClick}
                          websiteTags={websiteTags}
                          isDarkMode={props.isDarkMode}
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
                          websiteCache={websiteCache}
                        />
                        <TagHighlights
                          store={props.store}
                          toggleWebsiteTag={toggleWebsiteTagClick}
                          websiteTags={websiteTags}
                          isDarkMode={props.isDarkMode}
                          websiteCache={websiteCache}
                          showAddWebsiteDialog={setTagForWebsiteToTagDialog}
                          dragDropSource={dragDropSource}
                        />
                        <div id="tag-all" style={{ marginBottom: 80 }}>
                          <WebsiteHighlights
                            store={store}
                            toggleWebsiteTag={toggleWebsiteTagClick}
                            websiteTags={websiteTags}
                            isDarkMode={props.isDarkMode}
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
        </DragDropContext>
      </div>
    </ErrorBoundaryComponent>
  );
};
