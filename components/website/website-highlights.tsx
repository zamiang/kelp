import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import useTheme from '@mui/styles/useTheme';
import React, { useEffect, useState } from 'react';
import PlusIcon from '../../public/icons/plus-orange.svg';
import { LoadingSpinner } from '../shared/loading-spinner';
import { IWebsiteTag } from '../store/data-types';
import { IStore } from '../store/use-store';
import { Root, classes, fetchData } from './draggable-website-highlights';
import { IFeaturedWebsite, IWebsiteCache } from './get-featured-websites';
import { LargeWebsite } from './large-website';

export const WebsiteHighlights = (props: {
  store: IStore;
  toggleWebsiteTag: (tag: string, websiteId: string) => Promise<void>;
  websiteTags: IWebsiteTag[];
  isDarkMode: boolean;
  filterByTag?: string;
  websiteCache: IWebsiteCache;
  showWebsitePopup: (item: IFeaturedWebsite) => void;
}) => {
  const [topWebsites, setTopWebsites] = useState<IFeaturedWebsite[]>([]);
  const [shouldShowAll, setShouldShowAll] = useState(false);
  const [extraItemsCount, setExtraItemsCount] = useState(0);

  const theme = useTheme();
  const isLarge = useMediaQuery((theme as any).breakpoints.up('lg'));

  useEffect(() => {
    let isSubscribed = true;
    void fetchData(
      props.websiteCache,
      shouldShowAll,
      setTopWebsites,
      setExtraItemsCount,
      isLarge ? 8 : 6,
      isSubscribed,
      props.filterByTag,
    );
    return () => (isSubscribed = false) as any;
  }, [
    (props.websiteCache as any).LAST_UPDATED?.valueOf(),
    shouldShowAll,
    props.filterByTag,
    isLarge,
  ]);

  const shouldRenderLoading = props.store.isDocumentsLoading && topWebsites.length < 1;

  return (
    <Root style={{ position: 'relative' }}>
      {shouldRenderLoading && <LoadingSpinner />}
      <Grid
        container
        alignItems="center"
        justifyContent="space-between"
        className={classes.topSection}
      >
        <Grid item>
          <Typography variant="h3">{props.filterByTag || 'Recent'}</Typography>
        </Grid>
        {extraItemsCount > 0 && !shouldShowAll && (
          <Grid item>
            <IconButton
              className={classes.button}
              onClick={() => {
                setShouldShowAll(!shouldShowAll);
              }}
            >
              <PlusIcon width="24" height="24" />{' '}
            </IconButton>
          </Grid>
        )}
      </Grid>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Grid container spacing={6}>
            {topWebsites.map((item) => (
              <Grid item xs={isLarge ? 3 : 4} key={item.id}>
                <LargeWebsite
                  item={item}
                  store={props.store}
                  isDarkMode={props.isDarkMode}
                  websiteTags={props.websiteTags}
                  toggleWebsiteTag={props.toggleWebsiteTag}
                  showWebsitePopup={props.showWebsitePopup}
                />
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Root>
  );
};
