import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import CloseIcon from '../../public/icons/close.svg';
import { getTagsForWebsite, isTagSelected } from '../shared/website-tag';
import { IWebsiteImage, IWebsiteTag } from '../store/data-types';
import { IStore } from '../store/use-store';
import { IWebsiteCache, IWebsiteCacheItem } from '../website/get-featured-websites';
import { LargeWebsite } from '../website/large-website';

const PREFIX = 'WebsiteContainer';

const classes = {
  container: `${PREFIX}-container`,
  imageContainer: `${PREFIX}-imageContainer`,
  faviconContainer: `${PREFIX}-faviconContainer`,
  dots: `${PREFIX}-dots`,
  tags: `${PREFIX}-tags`,
  tag: `${PREFIX}-tag`,
  tagText: `${PREFIX}-tagText`,
  tagSelected: `${PREFIX}-tagSelected`,
  tagContainer: `${PREFIX}-tagContainer`,
  section: `${PREFIX}-section`,
  heading: `${PREFIX}-heading`,
  close: `${PREFIX}-close`,
};

const Root = styled('div')(({ theme }) => ({
  [`& .${classes.heading}`]: {
    marginBottom: theme.spacing(2),
  },
  [`& .${classes.section}`]: {
    marginTop: theme.spacing(8),
  },
  [`& .${classes.container}`]: {
    background: theme.palette.background.paper,
    opacity: 1,
    overflow: 'hidden',
    transition: 'opacity 0.3s',
    borderRadius: theme.shape.borderRadius,
    width: '100%',
    position: 'relative',
    '&:hover': {
      opacity: 0.8,
    },
  },
  [`& .${classes.tags}`]: { marginTop: theme.spacing(2) },
  [`& .${classes.tagContainer}`]: {
    display: 'inline-block',
    marginRight: theme.spacing(1),
  },
  [`& .${classes.tag}`]: {
    display: 'inline-block',
    transition: 'borderBottom 0.3s',
    borderBottom: '1px solid transparent',
    cursor: 'pointer',
    verticalAlign: 'top',
    '&:hover': {
      borderBottomColor: theme.palette.divider,
    },
  },
  [`& .${classes.tagSelected}`]: {
    pointerEvents: 'all',
    cursor: 'pointer',
    borderBottomColor: theme.palette.primary.dark,
    '&:hover': {
      opacity: 0.8,
      borderBottomColor: theme.palette.primary.dark,
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
  [`& .${classes.imageContainer}`]: {
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
  [`& .${classes.close}`]: {
    padding: 0,
    display: 'inline-block',
    verticalAlign: 'top',
    marginTop: 2,
    marginLeft: 3,
    cursor: 'pointer',
    opacity: 0.8,
    transition: 'opacity 0.3s',
    '&:hover': {
      opacity: 0.6,
    },
  },
}));

const LargeWebsiteImage = (props: {
  image?: IWebsiteImage;
  websiteId: string;
  isDarkMode: boolean;
  ogImage?: string;
}) => {
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
        size="large"
      >
        <img src={`chrome://favicon/size/48@1x/${props.websiteId}`} height="16" width="16" />
      </IconButton>
    </div>
  );
};

const ExpandWebsite = (props: {
  store: IStore;
  websiteId?: string;
  close?: () => void;
  toggleWebsiteTag: (tag: string, websiteId: string) => Promise<void>;
  websiteTags: IWebsiteTag[];
  isDarkMode: boolean;
  websiteCache: IWebsiteCache;
}) => {
  const { slug }: any = useParams();
  const websiteId = props.websiteId || decodeURIComponent(slug);
  const [image, setImage] = useState<IWebsiteImage>();
  const [website, setWebsite] = useState<IWebsiteCacheItem | undefined>(undefined);
  const [websitesAtDomain, setWebsitesAtDomain] = useState<IWebsiteCacheItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const w = props.websiteCache[websiteId];
      setWebsite(w);

      const websites = Object.values(props.websiteCache)
        .filter((c) => c.domain === w.domain)
        .sort((a, b) => (b?.visitCount > a?.visitCount ? 1 : -1));
      setWebsitesAtDomain(websites);

      const i = await props.store.websiteImageStore.getById(websiteId);
      return setImage(i);
    };
    void fetchData();
  }, [props.store.isLoading, websiteId]);

  if (!website) {
    return null;
  }

  const websiteTags = getTagsForWebsite(website.tags || '', props.websiteTags);

  const removeTag = async (tag: string) => {
    const updatedTags = websiteTags.filter((t) => t !== tag).join(' ');
    await props.store.websiteStore.updateTags(website.id, updatedTags);

    (props.websiteCache[websiteId] as any).tags = updatedTags;
    return props.store.incrementLoading();
  };

  return (
    <Root>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Box boxShadow={1} className={classes.container}>
            <LargeWebsiteImage
              image={image}
              websiteId={websiteId}
              isDarkMode={props.isDarkMode}
              ogImage={website?.ogImage}
            />
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="h2" color="textPrimary" gutterBottom>
            {website.title}
          </Typography>
          <div className={classes.tags}>
            {websiteTags.map((tag) => (
              <div className={classes.tagContainer} key={`${tag}-${websiteId}`}>
                <div
                  onClick={() => props.toggleWebsiteTag(tag, websiteId)}
                  className={clsx(
                    classes.tag,
                    isTagSelected(tag, props.websiteTags) && classes.tagSelected,
                  )}
                >
                  <Typography variant="body2">{tag}</Typography>
                </div>
                <div onClick={() => removeTag(tag)} className={classes.close}>
                  <CloseIcon width="18" height="18" />
                </div>
              </div>
            ))}
          </div>
        </Grid>
      </Grid>
      {websitesAtDomain.length > 0 && (
        <div className={classes.section} id="meetings">
          <Typography variant="h3" className={classes.heading}>
            Related Websites
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Grid container spacing={6}>
                {websitesAtDomain.map((item) => (
                  <Grid item xs={4} key={item.id}>
                    <LargeWebsite
                      item={item}
                      store={props.store}
                      isDarkMode={props.isDarkMode}
                      websiteTags={props.websiteTags}
                      toggleWebsiteTag={props.toggleWebsiteTag}
                    />
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </div>
      )}
    </Root>
  );
};

export default ExpandWebsite;
