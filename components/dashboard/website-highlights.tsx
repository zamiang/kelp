import Grid from '@material-ui/core/Grid';
import React, { useEffect, useState } from 'react';
import { LoadingSpinner } from '../shared/loading-spinner';
import { IStore } from '../store/use-store';
import { IFeaturedWebsite, getFeaturedWebsites } from '../website/get-featured-websites';
import { LargeWebsite } from '../website/large-website';

const maxResult = 6;

export const WebsiteHighlights = (props: {
  store: IStore;
  currentFilter: string;
  hideWebsite: (item: IFeaturedWebsite) => void;
  hideDialogUrl?: string;
}) => {
  const [topWebsites, setTopWebsites] = useState<IFeaturedWebsite[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const featuredWebsites = await getFeaturedWebsites(props.store);
      const filtereredWebsites = featuredWebsites.filter((item) =>
        item && props.currentFilter === 'all'
          ? true
          : item.websiteId.indexOf(props.currentFilter) > -1,
      );
      setTopWebsites(filtereredWebsites.slice(0, maxResult));
    };
    void fetchData();
  }, [props.store.lastUpdated, props.store.isLoading, props.currentFilter, props.hideDialogUrl]);

  const shouldRenderLoading = props.store.isDocumentsLoading && topWebsites.length < 1;

  return (
    <div>
      {shouldRenderLoading && <LoadingSpinner />}
      <Grid container spacing={4}>
        {topWebsites.map((item) => (
          <LargeWebsite
            key={item.websiteId}
            item={item}
            store={props.store}
            hideItem={props.hideWebsite}
            smGridSize={4}
          />
        ))}
      </Grid>
    </div>
  );
};
