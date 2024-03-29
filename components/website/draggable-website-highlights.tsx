import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import config from '../../constants/config';
import CloseIcon from '../../public/icons/close.svg';
import { IWebsiteTag } from '../store/data-types';
import { IStore } from '../store/use-store';
import { IFeaturedWebsite, IWebsiteCache, IWebsiteCacheItem } from './get-featured-websites';
import { LargeWebsite } from './large-website';

const PREFIX = 'DraggableWebsiteHighlights';

export const classes = {
  topSection: `${PREFIX}-topSection`,
  button: `${PREFIX}-button`,
  sideButton: `${PREFIX}-sideButton`,
  loading: `${PREFIX}-loading`,
  rightContainer: `${PREFIX}-rightContainer`,
  iconSelected: `${PREFIX}-iconSelected`,
  iconText: `${PREFIX}-iconText`,
};

export const Root = styled('div')(({ theme }) => ({
  [`& .${classes.topSection}`]: {
    marginBottom: theme.spacing(2),
    position: 'relative',
    zIndex: 5,
    opacity: 1,
    transition: 'opacity 0.5s',
  },
  [`& .${classes.loading}`]: {
    opacity: 0.5,
  },
  [`& .${classes.iconText}`]: {
    color: theme.palette.text.primary,
  },
  [`& .${classes.rightContainer}`]: {
    marginRight: -47,
    width: 99,
  },
  [`& .${classes.iconSelected}`]: {
    color: theme.palette.primary.main,
  },
  [`& .${classes.button}`]: {
    opacity: 1,
    transition: 'opacity 0.3s ease-out',
    '&:hover': {
      opacity: 0.5,
    },
  },
  [`& .${classes.sideButton}`]: {
    opacity: 1,
    transition: 'opacity 0.3s ease-out',
    position: 'absolute',
    right: -50,
    top: 'calc(50% - 16px)',
    background: theme.palette.background.paper,
    color: theme.palette.text.primary,
    boxShadow: theme.shadows[1],
    width: 32,
    height: 32,
    overflow: 'hidden',
    '&:hover': {
      opacity: 0.5,
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
  filterByTag?: string;
  showAddWebsiteDialog?: (tag: string) => void;
  maxWebsites: number;
  websiteCache: IWebsiteCache;
  dragDropSource?: string;
  shouldHideCloseButton?: boolean;
  isLoading: boolean;
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
        className={clsx(classes.topSection, props.isLoading && classes.loading)}
      >
        <Grid item>
          <Typography variant="h3">{props.filterByTag || 'Recent'}</Typography>
        </Grid>
        <Grid item>
          <Grid container alignItems="center" spacing={2} className={classes.rightContainer}>
            {props.filterByTag && props.showAddWebsiteDialog && (
              <Grid item>
                <Typography
                  variant="body1"
                  color="primary"
                  onClick={() =>
                    props.filterByTag &&
                    props.showAddWebsiteDialog &&
                    props.showAddWebsiteDialog(props.filterByTag)
                  }
                  style={{ cursor: 'pointer' }}
                >
                  Add
                </Typography>
              </Grid>
            )}
            {props.filterByTag && !props.shouldHideCloseButton && (
              <Grid item>
                <IconButton
                  className={classes.button}
                  onClick={() => props.toggleWebsiteTag(props.filterByTag!)}
                >
                  <CloseIcon
                    width={config.ICON_SIZE}
                    height={config.ICON_SIZE}
                    className={classes.iconText}
                  />
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
          <Typography variant="body2">{extraItemsCount > 10 ? '10+' : extraItemsCount}</Typography>
        </IconButton>
      )}
    </Root>
  );
};
