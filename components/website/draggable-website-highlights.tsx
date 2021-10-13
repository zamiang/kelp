import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import React, { useEffect, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import config from '../../constants/config';
import CloseIcon from '../../public/icons/close-orange.svg';
import PlusIcon from '../../public/icons/plus-orange.svg';
import { IWebsiteTag } from '../store/data-types';
import { IStore } from '../store/use-store';
import { IFeaturedWebsite, IWebsiteCache, IWebsiteCacheItem } from './get-featured-websites';
import { LargeWebsite } from './large-website';

const PREFIX = 'DraggableWebsiteHighlights';

export const classes = {
  topSection: `${PREFIX}-topSection`,
  button: `${PREFIX}-button`,
};

export const Root = styled('div')(({ theme }) => ({
  [`& .${classes.topSection}`]: {
    marginBottom: theme.spacing(2),
    position: 'relative',
    zIndex: 5,
  },
  [`& .${classes.button}`]: {
    opacity: 0.5,
    transition: 'opacity 0.3s ease-out',
    '&:hover': {
      opacity: 1,
    },
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

export const fetchData = async (
  websiteCache: IWebsiteCache,
  shouldShowAll: boolean,
  setWebsites: (websites: IWebsiteCacheItem[]) => void,
  setExtraItemsCount: (n: number) => void,
  maxWebsites: number,
  isSubscribed: boolean,
  filterByTag?: string,
) => {
  const websites = Object.values(websiteCache);
  const filtereredWebsites = websites
    .filter((website) => {
      if (filterByTag) {
        const tags = website.tags?.trim().split(' ');
        return tags && tags.includes(filterByTag);
      }
      return true;
    })
    .sort((a, b) => (a.visitCount > b.visitCount ? 1 : -1));

  const extraResultLength = filtereredWebsites.length - maxWebsites;
  isSubscribed && setExtraItemsCount(extraResultLength > 0 ? extraResultLength : 0);

  // maybe need index?
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
  <Draggable draggableId={props.item.id} index={props.index}>
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
          key={props.item.id}
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
  topWebsites: IWebsiteCacheItem[];
  setTopWebsites: (w: IWebsiteCacheItem[]) => void;
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
            {props.topWebsites.map((item: IWebsiteCacheItem, index: number) => (
              <Website
                key={item.id}
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
  websiteCache: IWebsiteCache;
}) => {
  const [topWebsites, setTopWebsites] = useState<IWebsiteCacheItem[]>([]);
  const [shouldShowAll, setShouldShowAll] = useState(false);
  const [extraItemsCount, setExtraItemsCount] = useState(0);

  useEffect(() => {
    let isSubscribed = true;
    console.log('fethcing highlights for ', props.filterByTag);
    void fetchData(
      props.websiteCache,
      shouldShowAll,
      setTopWebsites,
      setExtraItemsCount,
      props.maxWebsites,
      isSubscribed,
      props.filterByTag,
    );
    return () => (isSubscribed = false) as any;
  }, [Object.keys(props.websiteCache).length, shouldShowAll, props.filterByTag]);

  return (
    <Root style={{ position: 'relative' }}>
      <Grid
        container
        alignItems="center"
        justifyContent="space-between"
        className={classes.topSection}
      >
        <Grid item>
          <Typography variant="h3">{props.filterByTag || 'Recent'}</Typography>
        </Grid>
        <Grid item>
          <Grid container>
            {props.filterByTag && (
              <Grid item>
                <IconButton
                  className={classes.button}
                  onClick={() =>
                    props.toggleWebsiteTag(props.filterByTag!, config.INTERNAL_WEBSITE_ID)
                  }
                >
                  <CloseIcon width="24" height="24" />
                </IconButton>
              </Grid>
            )}
            {extraItemsCount > 0 && !shouldShowAll && (
              <Grid item>
                <IconButton
                  className={classes.button}
                  onClick={() => {
                    setShouldShowAll(!shouldShowAll);
                  }}
                >
                  <PlusIcon width="24" height="24" />
                </IconButton>
              </Grid>
            )}
          </Grid>
        </Grid>
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
