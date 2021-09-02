import Grid from '@material-ui/core/Grid';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import useTheme from '@material-ui/styles/useTheme';
import React, { useEffect, useState } from 'react';
import { LoadingSpinner } from '../shared/loading-spinner';
import { IWebsiteTag } from '../store/data-types';
import { IStore } from '../store/use-store';
import { IFeaturedWebsite, getFeaturedWebsites } from './get-featured-websites';
import { LargeWebsite } from './large-website';
import { RightArrow } from './right-arrow';

const maxResult = 8;
const maxDisplay = maxResult * 8;

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

export const WebsiteHighlights = (props: {
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
          <Grid container spacing={isMobile ? 5 : 6}>
            {topWebsites.map((item) => (
              <LargeWebsite
                key={item.websiteId}
                item={item}
                store={props.store}
                isDarkMode={props.isDarkMode}
                websiteTags={props.websiteTags}
                toggleWebsiteTag={props.toggleWebsiteTag}
                showWebsitePopup={props.showWebsitePopup}
              />
            ))}
          </Grid>
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
