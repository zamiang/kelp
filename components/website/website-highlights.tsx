import Grid from '@material-ui/core/Grid';
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
  filterByTag?: string,
) => {
  const featuredWebsites = await getFeaturedWebsites(store);
  const filtereredWebsites = await Promise.all(
    featuredWebsites.filter(async (item) => {
      if (filterByTag) {
        const website = await store.websiteStore.getById(item.websiteId);
        const tags = website?.tags;
        if (tags) {
          return tags.includes(filterByTag);
        }
      }
      return item && currentFilter === 'all';
    }),
  );

  const extraResultLength = filtereredWebsites.length - maxResult;
  setExtraItemsCount(extraResultLength > maxDisplay ? maxDisplay : extraResultLength);
  if (shouldShowAll) {
    setWebsites(filtereredWebsites.slice(0, maxWebsites * 10));
  } else {
    setWebsites(filtereredWebsites.slice(0, maxWebsites));
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

  useEffect(() => {
    void fetchData(
      props.store,
      props.currentFilter,
      shouldShowAll,
      setTopWebsites,
      setExtraItemsCount,
      props.maxWebsites || maxResult,
      props.filterByTag,
    );
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
          <Grid container spacing={6}>
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
