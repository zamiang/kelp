import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import React, { useEffect, useState } from 'react';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import config from '../../constants/config';
import RightArrowIcon from '../../public/icons/chevron-right-orange.svg';
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
  sideButton: `${PREFIX}-sideButton`,
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
  [`& .${classes.sideButton}`]: {
    opacity: 0.5,
    transition: 'opacity 0.3s ease-out',
    position: 'absolute',
    right: -50,
    top: 'calc(50% - 16px)',
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

const getListStyle = (isDraggingOver: boolean) => ({
  background: isDraggingOver ? 'rgba(0,0,0, 0.15)' : 'transparent',
});

export const getWebsitesForTag = (websiteCache: IWebsiteCache, filterByTag?: string) => {
  const websites = Object.values(websiteCache);
  const filtereredWebsites = websites
    .filter((website) => {
      if (!website.id) {
        return false;
      }
      if (filterByTag) {
        const tags = website.tags?.trim().split(' ');
        return tags && tags.includes(filterByTag);
      }
      return true;
    })
    .sort((a, b) => (b?.visitCount > a?.visitCount ? 1 : -1));

  if (filterByTag) {
    filtereredWebsites.sort((a, b) => ((a.index || 0) > (b.index || 0) ? 1 : -1));
  }
  return filtereredWebsites;
};

export const fetchData = (
  websiteCache: IWebsiteCache,
  shouldShowAll: boolean,
  setWebsites: (websites: IWebsiteCacheItem[]) => void,
  setExtraItemsCount: (n: number) => void,
  maxWebsites: number,
  isSubscribed: boolean,
  filterByTag?: string,
) => {
  const filtereredWebsites = getWebsitesForTag(websiteCache, filterByTag);

  const extraResultLength = filtereredWebsites.length - maxWebsites;
  isSubscribed && setExtraItemsCount(extraResultLength > 0 ? extraResultLength : 0);

  // maybe need index?
  if (shouldShowAll) {
    return isSubscribed && setWebsites(filtereredWebsites.slice(0, maxWebsites * 10));
  } else {
    return isSubscribed && setWebsites(filtereredWebsites.slice(0, maxWebsites));
  }
};

const Website = (props: {
  item: IFeaturedWebsite;
  index: number;
  store: IStore;
  isDarkMode: boolean;
  toggleWebsiteTag: (tag: string, websiteId: string) => Promise<void>;
  websiteTags: IWebsiteTag[];
  size: number;
  draggableId: string;
}) => (
  <Draggable draggableId={props.draggableId} index={props.index}>
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
        />
      </Grid>
    )}
  </Draggable>
);

const DraggableWebsites = (props: {
  topWebsites: IWebsiteCacheItem[];
  store: IStore;
  isDarkMode: boolean;
  toggleWebsiteTag: (tag: string, websiteId: string) => Promise<void>;
  websiteTags: IWebsiteTag[];
  maxWebsites: number;
  filterByTag?: string;
  dragDropSource?: string;
}) => (
  <Droppable
    droppableId={`${props.filterByTag}-websites`}
    direction="horizontal"
    isDropDisabled={props.dragDropSource === 'top-tags'}
  >
    {(provided, snapshot) => (
      <Grid
        container
        spacing={5}
        ref={provided.innerRef}
        style={getListStyle(snapshot.isDraggingOver)}
        {...provided.droppableProps}
      >
        {props.topWebsites.map((item: IWebsiteCacheItem, index: number) => (
          <Website
            key={item.id}
            draggableId={`${props.filterByTag}-${item.id}`}
            index={index}
            item={item}
            store={props.store}
            isDarkMode={props.isDarkMode}
            websiteTags={props.websiteTags}
            toggleWebsiteTag={props.toggleWebsiteTag}
            size={props.maxWebsites > 3 ? 3 : 4}
          />
        ))}
        {provided.placeholder}
      </Grid>
    )}
  </Droppable>
);

export const DraggableWebsiteHighlights = (props: {
  store: IStore;
  toggleWebsiteTag: (tag: string, websiteId?: string) => Promise<void>;
  websiteTags: IWebsiteTag[];
  isDarkMode: boolean;
  filterByTag?: string;
  showAddWebsiteDialog?: (tag: string) => void;
  maxWebsites: number;
  websiteCache: IWebsiteCache;
  dragDropSource?: string;
  shouldHideCloseButton?: boolean;
}) => {
  const [topWebsites, setTopWebsites] = useState<IWebsiteCacheItem[]>([]);
  const [shouldShowAll, setShouldShowAll] = useState(false);
  const [extraItemsCount, setExtraItemsCount] = useState(0);

  useEffect(() => {
    let isSubscribed = true;
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
  }, [
    (props.websiteCache as any).LAST_UPDATED?.valueOf(),
    shouldShowAll,
    props.filterByTag,
    props.maxWebsites,
  ]);

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
            {props.filterByTag && !props.shouldHideCloseButton && (
              <Grid item>
                <IconButton
                  className={classes.button}
                  onClick={() => props.toggleWebsiteTag(props.filterByTag!)}
                >
                  <CloseIcon width={config.ICON_SIZE} height={config.ICON_SIZE} />
                </IconButton>
              </Grid>
            )}
            {props.filterByTag && props.showAddWebsiteDialog && (
              <Grid item>
                <IconButton
                  className={classes.button}
                  onClick={() =>
                    props.filterByTag &&
                    props.showAddWebsiteDialog &&
                    props.showAddWebsiteDialog(props.filterByTag)
                  }
                >
                  <PlusIcon width={config.ICON_SIZE} height={config.ICON_SIZE} />
                </IconButton>
              </Grid>
            )}
          </Grid>
        </Grid>
      </Grid>
      <DraggableWebsites
        topWebsites={topWebsites}
        store={props.store}
        websiteTags={props.websiteTags}
        isDarkMode={props.isDarkMode}
        toggleWebsiteTag={props.toggleWebsiteTag}
        maxWebsites={props.maxWebsites}
        filterByTag={props.filterByTag}
        dragDropSource={props.dragDropSource}
      />
      {extraItemsCount > 0 && !shouldShowAll && (
        <IconButton
          className={classes.sideButton}
          onClick={() => {
            setShouldShowAll(!shouldShowAll);
          }}
        >
          <RightArrowIcon width="32" height="32" />
        </IconButton>
      )}
    </Root>
  );
};
