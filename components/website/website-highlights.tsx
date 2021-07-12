import Grid from '@material-ui/core/Grid';
import React, { useEffect, useState } from 'react';
import { LoadingSpinner } from '../shared/loading-spinner';
import { IStore } from '../store/use-store';
import { IFeaturedWebsite, getFeaturedWebsites } from './get-featured-websites';
import { LargeWebsite } from './large-website';
import { RightArrow } from './right-arrow';

const maxResult = 12;
const maxDisplay = maxResult * 6;

const fetchData = async (
  store: IStore,
  currentFilter: string,
  shouldShowAll: boolean,
  setWebsites: (websites: IFeaturedWebsite[]) => void,
  setExtraItemsCount: (n: number) => void,
) => {
  const featuredWebsites = await getFeaturedWebsites(store);
  const filtereredWebsites = featuredWebsites.filter((item) =>
    item && currentFilter === 'all' ? true : item.websiteId.indexOf(currentFilter) > -1,
  );

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
  hideDialogUrl?: string;
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
    );
  }, [
    props.store.lastUpdated,
    props.store.isLoading,
    props.currentFilter,
    props.hideDialogUrl,
    shouldShowAll,
  ]);

  const togglePin = async (item: IFeaturedWebsite, isPinned: boolean) => {
    if (isPinned) {
      await props.store.websitePinStore.delete(item.websiteId);
    } else {
      await props.store.websitePinStore.create(item.websiteId);
    }
    void fetchData(
      props.store,
      props.currentFilter,
      shouldShowAll,
      setTopWebsites,
      setExtraItemsCount,
    );
  };

  const shouldRenderLoading = props.store.isDocumentsLoading && topWebsites.length < 1;

  return (
    <div style={{ position: 'relative' }}>
      {shouldRenderLoading && <LoadingSpinner />}
      <Grid container spacing={5}>
        {topWebsites.map((item) => (
          <LargeWebsite
            key={item.websiteId}
            item={item}
            store={props.store}
            hideItem={props.hideWebsite}
            smGridSize={4}
            togglePin={togglePin}
          />
        ))}
      </Grid>
      {extraItemsCount > 0 && (
        <RightArrow
          isEnabled={shouldShowAll}
          count={extraItemsCount}
          onClick={() => {
            setShouldShowAll(!shouldShowAll);
          }}
        />
      )}
    </div>
  );
};
