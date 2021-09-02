import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Link from '@material-ui/core/Link';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/core/styles/makeStyles';
import React, { useEffect, useState } from 'react';
import DotsIcon from '../../public/icons/dots-black.svg';
import DotsIconWhite from '../../public/icons/dots-white.svg';
import { WebsiteTags } from '../shared/website-tag';
import { IWebsiteImage, IWebsiteItem, IWebsiteTag } from '../store/data-types';
import { IStore } from '../store/use-store';
import { IFeaturedWebsite } from './get-featured-websites';

const useStyles = makeStyles((theme) => ({
  container: {
    background: theme.palette.background.paper,
    opacity: 1,
    transition: 'opacity 0.3s',
    overflow: 'hidden',
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
  },
  faviconContainer: {
    background: theme.palette.background.paper,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 3,
    paddingTop: 'calc(33% - 18px)',
    paddingBottom: 'calc(33% - 18px)',
  },
  textContainer: {
    marginTop: 5,
  },
  text: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    fontSize: theme.typography.h5.fontSize,
    fontFamily: theme.typography.h3.fontFamily,
    fontWeight: theme.typography.h3.fontWeight,
  },
}));

const WebsiteImage = (props: {
  image?: IWebsiteImage;
  item: IFeaturedWebsite;
  isDarkMode: boolean;
  ogImage?: string;
}) => {
  const classes = useStyles();

  if (props.image?.image) {
    return (
      <div
        className={classes.imageContainer}
        style={{
          backgroundImage: `url('${props.ogImage || props.image.image}')`,
        }}
      >
        <div className={classes.dots}></div>
      </div>
    );
  }
  return (
    <div className={classes.faviconContainer}>
      <IconButton
        style={{
          backgroundColor: props.isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
        }}
      >
        <img src={`chrome://favicon/size/48@1x/${props.item.websiteId}`} height="16" width="16" />
      </IconButton>
    </div>
  );
};

export const LargeWebsite = (props: {
  store: IStore;
  item: IFeaturedWebsite;
  toggleWebsiteTag: (tag: string, websiteId: string) => Promise<void>;
  showWebsitePopup: (item: IFeaturedWebsite) => void;
  smGridSize?: number;
  isDarkMode: boolean;
  websiteTags: IWebsiteTag[];
}) => {
  const [image, setImage] = useState<IWebsiteImage>();
  const [website, setWebsite] = useState<IWebsiteItem>();
  const classes = useStyles();

  useEffect(() => {
    let isSubscribed = true;
    const fetchData = async () => {
      const w = await props.store.websiteStore.getById(props.item.websiteId);
      return isSubscribed && setWebsite(w);
    };
    void fetchData();
    return () => (isSubscribed = false) as any;
  }, [props.item.websiteId]);

  useEffect(() => {
    let isSubscribed = true;
    const fetchData = async () => {
      const i = await props.store.websiteImageStore.getById(props.item.websiteId);
      return isSubscribed && setImage(i);
    };
    void fetchData();
    return () => (isSubscribed = false) as any;
  }, [props.item.websiteId]);

  return (
    <Grid item xs={props.smGridSize || (3 as any)}>
      <Link href={props.item.url} underline="none">
        <Box boxShadow={1} borderRadius={16} className={classes.container}>
          <WebsiteImage
            image={image}
            item={props.item}
            isDarkMode={props.isDarkMode}
            ogImage={website?.ogImage}
          />
        </Box>
        <Tooltip title={website?.title || ''}>
          <Typography noWrap className={classes.text}>
            {website?.title}
          </Typography>
        </Tooltip>
      </Link>
      <Grid
        container
        alignItems="center"
        className={classes.textContainer}
        justifyContent="space-between"
      >
        <Grid item>
          <IconButton size="small">
            <img
              src={`chrome://favicon/size/48@1x/${props.item.websiteId}`}
              height="16"
              width="16"
            />
          </IconButton>
        </Grid>
        <Grid item xs>
          <WebsiteTags
            store={props.store}
            item={props.item}
            toggleWebsiteTag={props.toggleWebsiteTag}
            userTags={props.websiteTags}
          />
        </Grid>
        <Grid item>
          <IconButton
            size="small"
            onClick={() => {
              void props.showWebsitePopup(props.item);
            }}
          >
            {props.isDarkMode ? (
              <DotsIconWhite width="16" height="16" />
            ) : (
              <DotsIcon width="16" height="16" />
            )}
          </IconButton>
        </Grid>
      </Grid>
    </Grid>
  );
};
