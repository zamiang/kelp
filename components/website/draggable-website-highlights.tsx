import Grid from '@material-ui/core/Grid';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import useTheme from '@material-ui/styles/useTheme';
import React, { useEffect, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { LoadingSpinner } from '../shared/loading-spinner';
import { IWebsiteTag } from '../store/data-types';
import { IStore } from '../store/use-store';
import { IFeaturedWebsite, getFeaturedWebsites } from './get-featured-websites';
import { LargeWebsite } from './large-website';
import { RightArrow } from './right-arrow';

const maxResult = 8;
const maxDisplay = maxResult * 8;

const getItemStyle = (draggableStyle: any) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: 'none',

  // styles we need to apply on draggables
  ...draggableStyle,
});

const getListStyle = () => ({
  // width: itemsLength * 68.44 + 16,
});

const reorder = (list: any[], startIndex: number, endIndex: number) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const fetchData = async (
  store: IStore,
  currentFilter: string,
  shouldShowAll: boolean,
  setWebsites: (websites: IFeaturedWebsite[]) => void,
  setExtraItemsCount: (n: number) => void,
  maxWebsites: number,
  isSubscribed: boolean,
  filterByTag?: string,
) => {
  const featuredWebsites = await getFeaturedWebsites(store);

  const websiteMap: any = {};
  await Promise.all(
    featuredWebsites.map(async (item) => {
      const website = await store.websiteStore.getById(item.websiteId);
      if (website) {
        websiteMap[website.id] = website;
      }
    }),
  );

  const filtereredWebsites = featuredWebsites.filter((item) => {
    if (filterByTag) {
      const website = websiteMap[item.websiteId];
      const tags = website?.tags;
      return tags && tags.indexOf(filterByTag) > -1;
    }
    return item && currentFilter === 'all';
  });

  const extraResultLength = filtereredWebsites.length - maxResult;
  isSubscribed &&
    setExtraItemsCount(extraResultLength > maxDisplay ? maxDisplay : extraResultLength);
  if (shouldShowAll) {
    return isSubscribed && setWebsites(filtereredWebsites.slice(0, maxWebsites * 10));
  } else {
    return isSubscribed && setWebsites(filtereredWebsites.slice(0, maxWebsites));
  }
};

interface IWebsiteProps {
  item: IFeaturedWebsite;
  index: number;
  store: IStore;
  isDarkMode: boolean;
  toggleWebsiteTag: (tag: string, websiteId: string) => Promise<void>;
  websiteTags: IWebsiteTag[];
  showWebsitePopup: (item: IFeaturedWebsite) => void;
}

const Website = (props: IWebsiteProps) => (
  <Draggable draggableId={props.item.websiteId} index={props.index}>
    {(provided) => (
      <Grid
        item
        xs={3}
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        style={getItemStyle(provided.draggableProps.style)}
      >
        <LargeWebsite
          key={props.item.websiteId}
          item={props.item}
          store={props.store}
          isDarkMode={props.isDarkMode}
          websiteTags={props.websiteTags}
          toggleWebsiteTag={props.toggleWebsiteTag}
          showWebsitePopup={props.showWebsitePopup}
        />
      </Grid>
    )}
  </Draggable>
);

const DraggableWebsites = (props: {
  topWebsites: IFeaturedWebsite[];
  setTopWebsites: (w: IFeaturedWebsite[]) => void;
  store: IStore;
  isDarkMode: boolean;
  toggleWebsiteTag: (tag: string, websiteId: string) => Promise<void>;
  websiteTags: IWebsiteTag[];
  showWebsitePopup: (item: IFeaturedWebsite) => void;
}) => {
  const onDragEnd = (result: any) => {
    // TODO
    if (!result.destination) {
      return;
    }

    if (result.destination.index === result.source.index) {
      return;
    }

    const tw = reorder(props.topWebsites, result.source.index, result.destination.index);

    props.setTopWebsites(tw);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="list" direction="horizontal">
        {(provided) => (
          <Grid
            container
            spacing={5}
            ref={provided.innerRef}
            style={getListStyle()}
            {...provided.droppableProps}
          >
            {props.topWebsites.map((item: IFeaturedWebsite, index: number) => (
              <Website
                key={item.websiteId}
                index={index}
                item={item}
                store={props.store}
                isDarkMode={props.isDarkMode}
                websiteTags={props.websiteTags}
                toggleWebsiteTag={props.toggleWebsiteTag}
                showWebsitePopup={props.showWebsitePopup}
              />
            ))}
            {provided.placeholder}
          </Grid>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export const DraggableWebsiteHighlights = (props: {
  store: IStore;
  currentFilter: string;
  toggleWebsiteTag: (tag: string, websiteId: string) => Promise<void>;
  websiteTags: IWebsiteTag[];
  isDarkMode: boolean;
  filterByTag?: string;
  showWebsitePopup: (item: IFeaturedWebsite) => void;
  maxWebsites: number;
}) => {
  const [topWebsites, setTopWebsites] = useState<IFeaturedWebsite[]>([]);
  const [shouldShowAll, setShouldShowAll] = useState(false);
  const [extraItemsCount, setExtraItemsCount] = useState(0);

  const theme = useTheme();
  const isMobile = useMediaQuery((theme as any).breakpoints.down('md'), {
    defaultMatches: true,
  });
  console.log(isMobile, '<<<');
  useEffect(() => {
    let isSubscribed = true;
    void fetchData(
      props.store,
      props.currentFilter,
      shouldShowAll,
      setTopWebsites,
      setExtraItemsCount,
      props.maxWebsites || maxResult,
      isSubscribed,
      props.filterByTag,
    );
    return () => (isSubscribed = false) as any;
  }, [
    props.store.lastUpdated,
    props.store.isLoading,
    props.currentFilter,
    shouldShowAll,
    props.filterByTag,
  ]);

  const shouldRenderLoading = props.store.isDocumentsLoading && topWebsites.length < 1;

  return (
    <div style={{ position: 'relative' }}>
      {shouldRenderLoading && <LoadingSpinner />}
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <DraggableWebsites
            setTopWebsites={setTopWebsites}
            topWebsites={topWebsites}
            store={props.store}
            websiteTags={props.websiteTags}
            isDarkMode={props.isDarkMode}
            toggleWebsiteTag={props.toggleWebsiteTag}
            showWebsitePopup={props.showWebsitePopup}
          />
        </Grid>
        {extraItemsCount > 0 && (
          <Grid item xs={12}>
            <RightArrow
              isEnabled={shouldShowAll}
              count={extraItemsCount}
              isDarkMode={props.isDarkMode}
              onClick={() => {
                setShouldShowAll(!shouldShowAll);
              }}
            />
          </Grid>
        )}
      </Grid>
    </div>
  );
};