import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import React, { useEffect, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import PlusIcon from '../../public/icons/plus-orange.svg';
import { LoadingSpinner } from '../shared/loading-spinner';
import { IWebsiteTag } from '../store/data-types';
import { IStore } from '../store/use-store';
import { IFeaturedWebsite, getFeaturedWebsites } from './get-featured-websites';
import { LargeWebsite } from './large-website';

const PREFIX = 'DraggableWebsiteHighlights';

const classes = {
  topSection: `${PREFIX}-topSection`,
};

const Root = styled('div')(({ theme }) => ({
  [`& .${classes.topSection}`]: {
    marginBottom: theme.spacing(2),
    position: 'relative',
    zIndex: 5,
  },
}));

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

  const filtereredWebsites = featuredWebsites
    .filter((item) => {
      if (filterByTag) {
        const website = websiteMap[item.websiteId];
        const tags = website?.tags.trim().split(' ');
        return tags && tags.includes(filterByTag);
      }
      return true;
    })
    .sort((a, b) => (websiteMap[a.websiteId].index > websiteMap[b.websiteId].index ? 1 : -1));

  const extraResultLength = filtereredWebsites.length - maxWebsites;
  isSubscribed && setExtraItemsCount(extraResultLength > 0 ? extraResultLength : 0);
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
  size: number;
}

const Website = (props: IWebsiteProps) => (
  <Draggable draggableId={props.item.websiteId} index={props.index}>
    {(provided) => (
      <Grid
        item
        xs={props.size as any}
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
  maxWebsites: number;
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

    void props.store.websiteStore.saveOrder(tw);
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
                size={props.maxWebsites > 3 ? 3 : 4}
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

  useEffect(() => {
    let isSubscribed = true;
    void fetchData(
      props.store,
      shouldShowAll,
      setTopWebsites,
      setExtraItemsCount,
      props.maxWebsites,
      isSubscribed,
      props.filterByTag,
    );
    return () => (isSubscribed = false) as any;
  }, [props.store.isLoading, shouldShowAll, props.filterByTag]);

  const shouldRenderLoading = props.store.isDocumentsLoading && topWebsites.length < 1;

  return (
    <Root style={{ position: 'relative' }}>
      {shouldRenderLoading && <LoadingSpinner />}
      <Grid
        container
        alignItems="center"
        justifyContent="space-between"
        className={classes.topSection}
      >
        <Grid item>
          <Typography variant="h3">{props.filterByTag || 'Recent'}</Typography>
        </Grid>
        {extraItemsCount > 0 && !shouldShowAll && (
          <Grid item>
            <IconButton
              onClick={() => {
                setShouldShowAll(!shouldShowAll);
              }}
            >
              <PlusIcon width="24" height="24" />{' '}
            </IconButton>
          </Grid>
        )}
      </Grid>
      <DraggableWebsites
        setTopWebsites={setTopWebsites}
        topWebsites={topWebsites}
        store={props.store}
        websiteTags={props.websiteTags}
        isDarkMode={props.isDarkMode}
        toggleWebsiteTag={props.toggleWebsiteTag}
        showWebsitePopup={props.showWebsitePopup}
        maxWebsites={props.maxWebsites}
      />
    </Root>
  );
};
