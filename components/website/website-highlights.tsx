import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import useTheme from '@mui/styles/useTheme';
import React, { useEffect, useState } from 'react';
import PlusIcon from '../../public/icons/plus-orange.svg';
import { LoadingSpinner } from '../shared/loading-spinner';
import { IWebsiteTag } from '../store/data-types';
import { IStore } from '../store/use-store';
import { IFeaturedWebsite, getFeaturedWebsites } from './get-featured-websites';
import { LargeWebsite } from './large-website';

const PREFIX = 'WebsiteHighlights';

const classes = {
  topSection: `${PREFIX}-topSection`,
};

const Root = styled('div')(({ theme }) => ({
  [`& .${classes.topSection}`]: {
    marginBottom: theme.spacing(2),
    position: 'relative',
    zIndex: 5,
  },
}));

const maxResult = 8;
const maxDisplay = maxResult * 8;

const fetchData = async (
  store: IStore,
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
    return true;
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
  toggleWebsiteTag: (tag: string, websiteId: string) => Promise<void>;
  websiteTags: IWebsiteTag[];
  isDarkMode: boolean;
  filterByTag?: string;
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
      props.store,
      shouldShowAll,
      setTopWebsites,
      setExtraItemsCount,
      isLarge ? 8 : 6,
      isSubscribed,
      props.filterByTag,
    );
    return () => (isSubscribed = false) as any;
  }, [props.store.isLoading, shouldShowAll, props.filterByTag]);

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
              <Grid item xs={isLarge ? 3 : 4} key={item.websiteId}>
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
