import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import React, { useEffect, useState } from 'react';
import config from '../../../../constants/config';
import PlusIcon from '../../../../public/icons/plus.svg';
import { LoadingSpinner } from '../shared/loading-spinner';
import { IWebsiteTag } from '../store/data-types';
import { IStore } from '../store/use-store';
import { fetchData } from './draggable-website-highlights';
import { IFeaturedWebsite, IWebsiteCache } from './get-featured-websites';
import { LargeWebsite } from './large-website';
import '../../styles/components/website/draggable-website-highlights.css';

export const WebsiteHighlights = (props: {
  store: IStore;
  toggleWebsiteTag: (tag: string, websiteId: string) => Promise<void>;
  websiteTags: IWebsiteTag[];
  filterByTag?: string;
  websiteCache: IWebsiteCache;
}) => {
  const [topWebsites, setTopWebsites] = useState<IFeaturedWebsite[]>([]);
  const [shouldShowAll, setShouldShowAll] = useState(false);
  const [extraItemsCount, setExtraItemsCount] = useState(0);

  useEffect(() => {
    let isSubscribed = true;
    void fetchData(
      props.websiteCache,
      shouldShowAll,
      setTopWebsites,
      setExtraItemsCount,
      6,
      isSubscribed,
      props.filterByTag,
    );
    return () => (isSubscribed = false) as any;
  }, [(props.websiteCache as any).LAST_UPDATED?.valueOf(), shouldShowAll, props.filterByTag, true]);

  const shouldRenderLoading = props.store.isDocumentsLoading && topWebsites.length < 1;

  return (
    <div className="draggable-website-highlights" style={{ position: 'relative' }}>
      {shouldRenderLoading && <LoadingSpinner />}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        className="draggable-website-highlights__top-section"
      >
        <Box>
          <Typography variant="h3">{props.filterByTag || 'Recent'}</Typography>
        </Box>
        {extraItemsCount > 0 && !shouldShowAll && (
          <Box>
            <IconButton
              className="draggable-website-highlights__button"
              onClick={() => {
                setShouldShowAll(!shouldShowAll);
              }}
            >
              <PlusIcon
                width={config.ICON_SIZE}
                height={config.ICON_SIZE}
                className="draggable-website-highlights__icon-selected"
              />{' '}
            </IconButton>
          </Box>
        )}
      </Box>
      <Box sx={{ flexGrow: 1 }}>
        <Grid container columns={3} spacing={2}>
          {topWebsites.map((item) => (
            <Grid size={1} key={item.id}>
              <LargeWebsite
                item={item}
                store={props.store}
                websiteTags={props.websiteTags}
                toggleWebsiteTag={props.toggleWebsiteTag}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    </div>
  );
};
