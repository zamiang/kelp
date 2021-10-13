import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import React, { useEffect, useState } from 'react';
import DotsIcon from '../../public/icons/dots-black.svg';
import DotsIconWhite from '../../public/icons/dots-white.svg';
import { WebsiteTags } from '../shared/website-tag';
import { IWebsiteImage, IWebsiteItem, IWebsiteTag } from '../store/data-types';
import { IStore } from '../store/use-store';
import { IFeaturedWebsite } from './get-featured-websites';

const PREFIX = 'LargeWebsite';

const classes = {
  container: `${PREFIX}-container`,
  dots: `${PREFIX}-dots`,
  imageContainer: `${PREFIX}-imageContainer`,
  faviconContainer: `${PREFIX}-faviconContainer`,
  textContainer: `${PREFIX}-textContainer`,
  text: `${PREFIX}-text`,
  icon: `${PREFIX}-icon`,
};

const Root = styled('div')(({ theme }) => ({
  [`& .${classes.container}`]: {
    background: theme.palette.background.paper,
    opacity: 1,
    overflow: 'hidden',
    transition: 'opacity 0.3s',
    borderRadius: theme.shape.borderRadius,
    '&:hover': {
      opacity: 0.8,
    },
  },
  [`& .${classes.dots}`]: {
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
  [`&.${classes.imageContainer}`]: {
    backgroundSize: '133%',
    backgroundPosition: 'top',
    display: 'block',
    paddingBottom: '61.8%',
    overflow: 'hidden',
    height: 0,
    position: 'relative',
  },
  [`& .${classes.faviconContainer}`]: {
    background: theme.palette.background.paper,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 'calc(30.9% - 16px)',
    paddingBottom: 'calc(30.9% - 16px)',
  },
  [`& .${classes.textContainer}`]: {},
  [`& .${classes.icon}`]: {
    display: 'block',
    marginRight: theme.spacing(0.5),
  },
  [`& .${classes.text}`]: {
    marginTop: theme.spacing(2),
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
  if (props.image?.image) {
    return (
      <Root
        className={classes.imageContainer}
        style={{
          backgroundImage: `url('${props.ogImage || props.image.image}')`,
        }}
      >
        <div className={classes.dots}></div>
      </Root>
    );
  }
  return (
    <Root className={classes.faviconContainer}>
      <IconButton
        style={{
          backgroundColor: props.isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
        }}
        size="large"
      >
        <img src={`chrome://favicon/size/48@1x/${props.item.websiteId}`} height="16" width="16" />
      </IconButton>
    </Root>
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
    <Root>
      <Link href={website?.rawUrl} underline="none">
        <Box boxShadow={1} className={classes.container}>
          <WebsiteImage
            image={image}
            item={props.item}
            isDarkMode={props.isDarkMode}
            ogImage={website?.ogImage}
          />
        </Box>
        <Tooltip title={website?.title || ''}>
          <Typography noWrap className={classes.text}>
            {website ? website.title : 'loading'}
          </Typography>
        </Tooltip>
      </Link>
      <Grid
        container
        alignItems="center"
        className={classes.textContainer}
        justifyContent="space-between"
      >
        <Grid item xs zeroMinWidth>
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
    </Root>
  );
};
