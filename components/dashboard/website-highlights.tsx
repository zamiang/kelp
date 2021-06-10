import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { subDays } from 'date-fns';
import { uniqBy } from 'lodash';
import React, { useEffect, useState } from 'react';
import config from '../../constants/config';
import { boxShadow } from '../../constants/theme';
import CloseIcon from '../../public/icons/close.svg';
import { LoadingSpinner } from '../shared/loading-spinner';
import { IDocument, ISegment, IWebsiteImage } from '../store/data-types';
import { IStore } from '../store/use-store';

interface IFeaturedWebsite {
  documentId?: string;
  websiteId: string;
  document?: IDocument;
  meetings: ISegment[];
  text?: string;
  date: Date;
}

/**
 * Gets documents in the featured section by looking through meetings for the coming week
 * Finds meeetings documents associated with those meetings
 * It sorts in decending order so upcoming meetings are next
 */
const maxResult = 12;

const getFeaturedWebsites = async (props: IStore) => {
  const currentDate = new Date();
  const filterTime = subDays(currentDate, config.NUMBER_OF_DAYS_BACK);

  // For documents edited by the current user that may not be associated with a meeting
  const driveActivity = await props.driveActivityStore.getCurrentUserDriveActivity();
  const filteredWebsites = await props.websitesStore.getAll(
    props.domainBlocklistStore,
    props.websiteBlocklistStore,
  );

  const filteredDriveActivity = driveActivity.filter((item) => item.time > filterTime);

  const urlCount: { [url: string]: number } = {};

  const currentUserDocuments = filteredDriveActivity
    .map((item) => {
      if (!item.documentId) {
        return null;
      }
      if (urlCount[item.link]) {
        urlCount[item.link] = urlCount[item.link] + 1;
      } else {
        urlCount[item.link] = 1;
      }
      return {
        documentId: item.id,
        meetings: [] as any,
        nextMeetingStartsAt: undefined,
        websiteId: item.link,
        text: item.title,
        date: item.time,
      } as IFeaturedWebsite;
    })
    .filter(Boolean) as IFeaturedWebsite[];

  const websiteVisits = filteredWebsites.map((item) => {
    if (urlCount[item.url]) {
      urlCount[item.url] = urlCount[item.url] + 1;
    } else {
      urlCount[item.url] = 1;
    }
    return {
      documentId: item.documentId,
      meetings: item.meetingId ? [item.meetingId] : ([] as any),
      nextMeetingStartsAt: undefined,
      websiteId: item.url,
      text: item.title,
      date: item.visitedTime,
    } as IFeaturedWebsite;
  });

  const concattedWebsitesAndDocuments = uniqBy(
    currentUserDocuments.concat(websiteVisits).sort((a, b) => (a.date > b.date ? -1 : 1)),
    'websiteId',
  );

  return concattedWebsitesAndDocuments.sort((a, b) =>
    urlCount[a.websiteId] > urlCount[b.websiteId] ? -1 : 1,
  );
};

const useStyles = makeStyles((theme) => ({
  container: {
    padding: theme.spacing(),
    background: theme.palette.background.paper,
    opacity: 1,
    transition: 'opacity 0.3s',
    '&:hover': {
      opacity: 0.8,
    },
  },
  dots: {
    backgroundImage:
      'radial-gradient(rgba(250, 250, 250, 0.5) 20%, transparent 20%), radial-gradient(rgba(250, 250, 250, 0.5) 20%, transparent 20%)',
    backgroundPosition: '0 0, 5px 5px',
    backgroundSize: '3px 3px',
    backgroundRepeat: 'repeat',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  imageContainer: {
    backgroundSize: 'cover',
    display: 'block',
    paddingBottom: '66%',
    overflow: 'hidden',
    height: 0,
    position: 'relative',
    marginTop: 3,
  },
}));

const LargeWebsite = (props: {
  store: IStore;
  item: IFeaturedWebsite;
  hideItem: (item: IFeaturedWebsite) => void;
}) => {
  const [image, setImage] = useState<IWebsiteImage>();
  const [isCloseVisible, setCloseVisible] = useState(false);
  const classes = useStyles();

  useEffect(() => {
    const fetchData = async () => {
      const i = await props.store.websiteImageStore.getById(props.item.websiteId);
      setImage(i);
    };
    void fetchData();
  }, []);

  return (
    <Grid
      item
      xs={3}
      onMouseEnter={() => setCloseVisible(true)}
      onMouseLeave={() => setCloseVisible(false)}
    >
      <Link href={props.item.websiteId} underline="none">
        <Box boxShadow={1} borderRadius={16} className={classes.container}>
          <Grid container alignItems="center">
            <Grid item>
              <IconButton size="small">
                <img
                  src={`chrome://favicon/size/48@1x/${props.item.websiteId}`}
                  height="14"
                  width="14"
                  style={{ margin: '0 auto' }}
                />
              </IconButton>
            </Grid>
            <Grid item zeroMinWidth xs>
              <Typography noWrap style={{ marginLeft: 3, marginTop: 1 }}>
                {props.item.text}
              </Typography>
            </Grid>
            {isCloseVisible && (
              <Grid item>
                <IconButton
                  size="small"
                  onClick={(event) => {
                    event.stopPropagation();
                    event.preventDefault();
                    void props.hideItem(props.item);
                    return false;
                  }}
                >
                  <CloseIcon width="14" height="14" />
                </IconButton>
              </Grid>
            )}
          </Grid>
          <div
            className={classes.imageContainer}
            style={{ backgroundImage: `url('${image?.image}')` }}
          >
            <div className={classes.dots}></div>
          </div>
        </Box>
      </Link>
    </Grid>
  );
};

const useStylesAllWebsites = makeStyles((theme) => ({
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

const AllWebsites = (props: { store: IStore; currentFilter: string }) => {
  const [topWebsites, setTopWebsites] = useState<IFeaturedWebsite[]>([]);
  const [hideDialogUrl, setHideDialogUrl] = useState<string | undefined>();
  const hideDialogDomain = hideDialogUrl ? new URL(hideDialogUrl).host : undefined;
  const classes = useStylesAllWebsites();

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
    setTopWebsites(featuredWebsite.filter(Boolean));
    setHideDialogUrl(undefined);
  };

  const hideDomain = async (domain: string) => {
    await props.store.domainBlocklistStore.addDomain(domain);
    const featuredWebsite = await getFeaturedWebsites(props.store);
    setTopWebsites(featuredWebsite.filter(Boolean));
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
