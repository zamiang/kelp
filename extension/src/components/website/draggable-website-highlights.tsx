import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import config from '../../../../constants/config';
import CloseIcon from '../../../../public/icons/close.svg';
import { IWebsiteTag } from '../store/data-types';
import { IStore } from '../store/use-store';
import { IFeaturedWebsite, IWebsiteCache, IWebsiteCacheItem } from './get-featured-websites';
import { LargeWebsite } from './large-website';
import '../../styles/components/website/draggable-website-highlights.css';

const getWebsitesForTag = (websiteCache: IWebsiteCache, filterByTag?: string) => {
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
  store: IStore;
  toggleWebsiteTag: (tag: string, websiteId: string) => Promise<void>;
  websiteTags: IWebsiteTag[];
}) => (
  <LargeWebsite
    key={props.item.id}
    item={props.item}
    store={props.store}
    websiteTags={props.websiteTags}
    toggleWebsiteTag={props.toggleWebsiteTag}
  />
);

const WebsiteGrid = (props: {
  topWebsites: IWebsiteCacheItem[];
  store: IStore;
  toggleWebsiteTag: (tag: string, websiteId: string) => Promise<void>;
  websiteTags: IWebsiteTag[];
}) => (
  <Grid container columns={3} spacing={2}>
    {props.topWebsites.map((item: IWebsiteCacheItem) => (
      <Grid size={1} key={item.id}>
        <Website
          item={item}
          store={props.store}
          websiteTags={props.websiteTags}
          toggleWebsiteTag={props.toggleWebsiteTag}
        />
      </Grid>
    ))}
  </Grid>
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
    <div className="draggable-website-highlights" style={{ position: 'relative' }}>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        className={clsx(
          'draggable-website-highlights__top-section',
          props.isLoading && 'draggable-website-highlights__loading',
        )}
      >
        <Box>
          <Typography variant="h3">{props.filterByTag || 'Recent'}</Typography>
        </Box>
        <Box>
          <Box
            display="flex"
            alignItems="center"
            gap={2}
            className="draggable-website-highlights__right-container"
          >
            {props.filterByTag && props.showAddWebsiteDialog && (
              <Box>
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
              </Box>
            )}
            {props.filterByTag && !props.shouldHideCloseButton && (
              <Box>
                <IconButton
                  className="draggable-website-highlights__button"
                  onClick={() => props.toggleWebsiteTag(props.filterByTag!)}
                >
                  <CloseIcon
                    width={config.ICON_SIZE}
                    height={config.ICON_SIZE}
                    className="draggable-website-highlights__icon-text"
                  />
                </IconButton>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
      <WebsiteGrid
        topWebsites={topWebsites}
        store={props.store}
        websiteTags={props.websiteTags}
        toggleWebsiteTag={props.toggleWebsiteTag}
      />
      {extraItemsCount > 0 && !shouldShowAll && (
        <IconButton
          className="draggable-website-highlights__side-button"
          onClick={() => {
            setShouldShowAll(!shouldShowAll);
          }}
        >
          <Typography variant="body2">{extraItemsCount > 10 ? '10+' : extraItemsCount}</Typography>
        </IconButton>
      )}
    </div>
  );
};
