import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import React, { useEffect, useState } from 'react';
import { boxShadow } from '../../constants/theme';
import CloseIcon from '../../public/icons/close.svg';
import { LoadingSpinner } from '../shared/loading-spinner';
import { IStore } from '../store/use-store';
import { IFeaturedWebsite, getFeaturedWebsites } from '../website/get-featured-websites';
import { LargeWebsite } from '../website/large-website';

const useStyles = makeStyles((theme) => ({
  button: {
    textDecoration: 'none',
    cursor: 'pointer',
    boxShadow,
    borderRadius: 20,
    background: theme.palette.background.paper,
    color: theme.palette.primary.main,
    paddingRight: theme.spacing(3),
    paddingLeft: theme.spacing(3),
  },
  dialogContent: {
    padding: theme.spacing(8),
  },
}));

const maxResult = 8;

const AllWebsites = (props: { store: IStore; currentFilter: string }) => {
  const [topWebsites, setTopWebsites] = useState<IFeaturedWebsite[]>([]);
  const [hideDialogUrl, setHideDialogUrl] = useState<string | undefined>();
  const hideDialogDomain = hideDialogUrl ? new URL(hideDialogUrl).host : undefined;
  const classes = useStyles();

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
  }, [props.store.lastUpdated, props.store.isLoading, props.currentFilter]);

  const shouldRenderLoading = props.store.isDocumentsLoading && topWebsites.length < 1;

  const hideItem = (item: IFeaturedWebsite) => setHideDialogUrl(item.websiteId);

  const hideUrl = async (url: string) => {
    await props.store.websiteBlocklistStore.addWebsite(url);
    const featuredWebsite = await getFeaturedWebsites(props.store);
    setTopWebsites(featuredWebsite.filter(Boolean).slice(0, maxResult));
    setHideDialogUrl(undefined);
  };

  const hideDomain = async (domain: string) => {
    await props.store.domainBlocklistStore.addDomain(domain);
    const featuredWebsite = await getFeaturedWebsites(props.store);
    setTopWebsites(featuredWebsite.filter(Boolean).slice(0, maxResult));
    setHideDialogUrl(undefined);
  };

  return (
    <div>
      {shouldRenderLoading && <LoadingSpinner />}
      <Grid container spacing={4}>
        {topWebsites.map((item) => (
          <LargeWebsite key={item.websiteId} item={item} store={props.store} hideItem={hideItem} />
        ))}
      </Grid>
      <Dialog
        maxWidth="md"
        open={hideDialogUrl ? true : false}
        onBackdropClick={() => setHideDialogUrl(undefined)}
      >
        {hideDialogUrl && hideDialogDomain && (
          <div className={classes.dialogContent}>
            <Grid container justify="space-between">
              <Grid item>
                <Typography variant="h3" noWrap>
                  No longer recommend this website
                </Typography>
              </Grid>
              <Grid item>
                <IconButton onClick={() => setHideDialogUrl(undefined)}>
                  <CloseIcon width="24" height="24" />
                </IconButton>
              </Grid>
            </Grid>
            <Grid container alignItems="center" justify="space-between">
              <Grid item xs={5}>
                <Button
                  disableElevation={false}
                  onClick={() => hideDomain(hideDialogDomain)}
                  className={classes.button}
                >
                  Hide all from {hideDialogDomain}
                </Button>
              </Grid>
              <Grid item>
                <Typography variant="h3">OR</Typography>
              </Grid>
              <Grid item xs={5}>
                <Button
                  disableElevation={false}
                  onClick={() => hideUrl(hideDialogUrl)}
                  className={classes.button}
                >
                  Hide this website
                </Button>
              </Grid>
            </Grid>
          </div>
        )}
      </Dialog>
    </div>
  );
};

const WebsitesHighlights = (props: { store: IStore; currentFilter: string }) => (
  <div>
    <AllWebsites store={props.store} currentFilter={props.currentFilter} />
  </div>
);

export default WebsitesHighlights;
