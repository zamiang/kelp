import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Link from '@material-ui/core/Link';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/core/styles/makeStyles';
import React, { useEffect, useState } from 'react';
import CloseIcon from '../../public/icons/close.svg';
import PinIconWhite from '../../public/icons/pin-white.svg';
import PinIcon from '../../public/icons/pin.svg';
import { WebsiteTags } from '../shared/website-tag';
import { IWebsiteImage } from '../store/data-types';
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
    marginLeft: 5,
    marginTop: 1,
  },
  tags: {},
  tag: {},
  tagSelected: {},
}));

const WebsiteImage = (props: {
  image?: IWebsiteImage;
  item: IFeaturedWebsite;
  isDarkMode: boolean;
}) => {
  const classes = useStyles();

  if (props.image?.image) {
    return (
      <div
        className={classes.imageContainer}
        style={{
          backgroundImage: `url('${props.image.image}')`,
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
  hideItem: (item: IFeaturedWebsite) => void;
  togglePin: (item: IFeaturedWebsite, isPinned: boolean) => Promise<void>;
  smGridSize?: number;
  isDarkMode: boolean;
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
  }, [props.item.websiteId]);
  return (
    <Grid
      item
      xs={props.smGridSize || (4 as any)}
      onMouseEnter={() => setCloseVisible(true)}
      onMouseLeave={() => setCloseVisible(false)}
    >
      <Link href={props.item.rawUrl} underline="none">
        <Box boxShadow={1} borderRadius={16} className={classes.container}>
          <WebsiteImage image={image} item={props.item} isDarkMode={props.isDarkMode} />
        </Box>
        <Grid container alignItems="center" className={classes.textContainer}>
          <Grid item>
            <IconButton size="small">
              <img
                src={`chrome://favicon/size/48@1x/${props.item.websiteId}`}
                height="16"
                width="16"
                style={{ margin: '0 auto' }}
              />
            </IconButton>
          </Grid>
          <Grid item zeroMinWidth xs>
            <Tooltip title={props.item.text || ''}>
              <Typography noWrap className={classes.text}>
                {props.item.text}
              </Typography>
            </Tooltip>
          </Grid>
          {isCloseVisible && props.hideItem && (
            <Grid item>
              <IconButton
                size="small"
                onClick={(event) => {
                  event.stopPropagation();
                  event.preventDefault();
                  if (props.hideItem) {
                    void props.hideItem(props.item);
                  }
                  return false;
                }}
              >
                <CloseIcon width="16" height="16" />
              </IconButton>
            </Grid>
          )}
          {(isCloseVisible || props.item.isPinned) && props.togglePin && (
            <Grid item>
              <IconButton
                size="small"
                onClick={(event) => {
                  event.stopPropagation();
                  event.preventDefault();
                  if (props.togglePin) {
                    void props.togglePin(props.item, props.item.isPinned);
                  }
                  return false;
                }}
              >
                {props.isDarkMode ? (
                  <PinIconWhite width="16" height="16" />
                ) : (
                  <PinIcon width="16" height="16" />
                )}
              </IconButton>
            </Grid>
          )}
        </Grid>
      </Link>
      <WebsiteTags store={props.store} item={props.item} />
    </Grid>
  );
};
