import Grid from '@material-ui/core/Grid';
import React, { useEffect, useState } from 'react';
import { LoadingSpinner } from '../shared/loading-spinner';
import { IWebsiteTag } from '../store/data-types';
import { IStore } from '../store/use-store';
import { IFeaturedWebsite, getFeaturedWebsites } from './get-featured-websites';
import { LargeWebsite } from './large-website';
import { RightArrow } from './right-arrow';

const maxResult = 6;
const maxDisplay = maxResult * 8;

const fetchData = async (
  store: IStore,
  currentFilter: string,
  shouldShowAll: boolean,
  setWebsites: (websites: IFeaturedWebsite[]) => void,
  setExtraItemsCount: (n: number) => void,
  filterByTag?: string,
) => {
  const featuredWebsites = await getFeaturedWebsites(store);
  const filtereredWebsites = featuredWebsites.filter((item) => {
    if (filterByTag) {
      if (item.cleanText) {
        if (!item.cleanText.includes(filterByTag)) {
          return false;
        }
      }
    }
    return item && currentFilter === 'all' ? true : item.websiteId.includes(currentFilter);
  });

  const extraResultLength = filtereredWebsites.length - maxResult;
  setExtraItemsCount(extraResultLength > maxDisplay ? maxDisplay : extraResultLength);
  if (shouldShowAll) {
    setWebsites(filtereredWebsites.slice(0, maxResult * 10));
  } else {
    setWebsites(filtereredWebsites.slice(0, maxResult));
  }
};

export const WebsiteHighlights = (props: {
  store: IStore;
  currentFilter: string;
  hideWebsite: (item: IFeaturedWebsite) => void;
  toggleWebsiteTag: (tag: string, websiteId: string) => Promise<void>;
  websiteTags: IWebsiteTag[];
  hideDialogUrl?: string;
  isDarkMode: boolean;
  filterByTag?: string;
}) => {
  const [topWebsites, setTopWebsites] = useState<IFeaturedWebsite[]>([]);
  const [shouldShowAll, setShouldShowAll] = useState(false);
  const [extraItemsCount, setExtraItemsCount] = useState(0);
  // used to refetch websites
  const [pinIncrement, setPinIncrement] = useState(0);

  useEffect(() => {
    void fetchData(
      props.store,
      props.currentFilter,
      shouldShowAll,
      setTopWebsites,
      setExtraItemsCount,
      props.filterByTag,
    );
  }, [
    props.store.lastUpdated,
    props.store.isLoading,
    props.currentFilter,
    props.hideDialogUrl,
    shouldShowAll,
    pinIncrement,
  ]);

  const togglePin = async (item: IFeaturedWebsite, isPinned: boolean) => {
    if (isPinned) {
      await props.store.websitePinStore.delete(item.websiteId);
    } else {
      await props.store.websitePinStore.create(item.websiteId);
    }
    setPinIncrement(pinIncrement + 1);
  };

  const shouldRenderLoading = props.store.isDocumentsLoading && topWebsites.length < 1;

  return (
    <div style={{ position: 'relative' }}>
      {shouldRenderLoading && <LoadingSpinner />}
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Grid container spacing={5}>
            {topWebsites.map((item) => (
              <LargeWebsite
                key={item.websiteId}
                item={item}
                store={props.store}
                hideItem={props.hideWebsite}
                smGridSize={4}
                togglePin={togglePin}
                isDarkMode={props.isDarkMode}
                websiteTags={props.websiteTags}
                toggleWebsiteTag={props.toggleWebsiteTag}
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
