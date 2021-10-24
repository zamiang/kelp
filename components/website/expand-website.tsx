import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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
  tagGroup: `${PREFIX}-tagGroup`,
  tag: `${PREFIX}-tag`,
  tagSelected: `${PREFIX}-tagSelected`,
  section: `${PREFIX}-section`,
  rowText: `${PREFIX}-rowText`,
};

const Root = styled('div')(({ theme }) => ({
  [`& .${classes.container}`]: {
    display: 'block',
    margin: `${theme.spacing(1)} auto`,
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

  return (
    <Root>
      <Grid container>
        <Grid item xs={8}>
          <Box boxShadow={1} className={classes.container}>
            <LargeWebsiteImage
              image={image}
              websiteId={websiteId}
              isDarkMode={props.isDarkMode}
              ogImage={website?.ogImage}
            />
          </Box>
        </Grid>
        <Grid item xs={4}>
          <Typography variant="h3" color="textPrimary" gutterBottom>
            {website.title}
          </Typography>
          <div className={classes.tagGroup}>
            {websiteTags.map((tag) => (
              <div
                key={`${tag}-${websiteId}`}
                onClick={() => props.toggleWebsiteTag(tag, websiteId)}
                className={clsx(
                  classes.tag,
                  isTagSelected(tag, props.websiteTags) && classes.tagSelected,
                )}
              >
                <Typography variant="body2">{tag}</Typography>
              </div>
            ))}
          </div>
        </Grid>
      </Grid>
      <div className={classes.container}>
        {websitesAtDomain.length > 0 && (
          <div className={classes.section} id="meetings">
            <Typography variant="h6" className={classes.rowText}>
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
      </div>
    </Root>
  );
};

export default ExpandWebsite;
