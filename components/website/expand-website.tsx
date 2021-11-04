import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import clsx from 'clsx';
import { clone } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import config from '../../constants/config';
import CloseIcon from '../../public/icons/close.svg';
import { getTagsForWebsite, isTagSelected } from '../shared/website-tag';
import { IWebsiteImage, IWebsiteTag } from '../store/data-types';
import { IStore } from '../store/use-store';
import { IWebsiteCache, IWebsiteCacheItem } from '../website/get-featured-websites';
import { LargeWebsite } from '../website/large-website';
import { DraggableWebsiteHighlights } from './draggable-website-highlights';

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
  smallButton: `${PREFIX}-smallButton`,
  tagForm: `${PREFIX}-tagForm`,
  hiddenWebsite: `${PREFIX}-hiddenWebsite`,
  topPadding: `${PREFIX}-topPadding`,
};

const Root = styled('div')(({ theme }) => ({
  [`& .${classes.heading}`]: {
    marginBottom: theme.spacing(2),
  },
  [`& .${classes.hiddenWebsite}`]: {
    textDecoration: 'line-through',
  },
  [`& .${classes.section}`]: {
    marginTop: theme.spacing(8),
  },
  [`& .${classes.topPadding}`]: {
    marginTop: theme.spacing(4),
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
  [`& .${classes.tagForm}`]: {},
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
  [`& .${classes.smallButton}`]: {
    width: 100,
    background: theme.palette.background.paper,
    color: theme.palette.primary.main,
    borderRadius: 16,
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
        <img
          src={`chrome://favicon/size/48@1x/${props.websiteId}`}
          height={config.ICON_SIZE}
          width={config.ICON_SIZE}
        />
      </IconButton>
    </div>
  );
};

const AddTagInput = (props: {
  store: IStore;
  userTags: IWebsiteTag[];
  websiteTags: string[];
  website: IWebsiteCacheItem;
  websiteCache: IWebsiteCache;
}) => {
  const [errorText, setErrorText] = useState<string | undefined>();
  const [value, setValue] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
  };

  const addTag = async () => {
    const tag = value;
    if (tag.length < 1) {
      return setErrorText('please enter text');
    }
    setErrorText(undefined);

    const t = clone(props.websiteTags);
    t.push(tag);
    const w = await props.store.websiteStore.updateTags(props.website.id, t.join(' '));
    if (w) {
      setValue('');
      // todo update store so that it refreshes
      (props.websiteCache[props.website.id] as any).tags = t.join(' ');
      props.store.incrementLoading();
    }
  };

  return (
    <div className={classes.tagForm}>
      <div>{errorText}</div>
      <Grid container justifyContent="space-between">
        <Grid item>
          <TextField
            type="text"
            placeholder="Enter a custom tag…"
            fullWidth
            autoFocus={true}
            onChange={handleChange}
            name="query"
            margin="dense"
            variant="standard"
            value={value}
            InputProps={{
              disableUnderline: true,
            }}
          />
        </Grid>
        <Grid item>
          <Button
            size="small"
            disableElevation={false}
            variant="outlined"
            className={classes.smallButton}
            onClick={addTag}
          >
            Add Tag
          </Button>
        </Grid>
      </Grid>
    </div>
  );
};

const ExpandWebsite = (props: {
  store: IStore;
  websiteId?: string;
  close?: () => void;
  toggleWebsiteTag: (tag: string, websiteId?: string) => Promise<void>;
  websiteTags: IWebsiteTag[];
  isDarkMode: boolean;
  websiteCache: IWebsiteCache;
  dragDropSource?: string;
}) => {
  const { slug }: any = useParams();
  const websiteId = props.websiteId || decodeURIComponent(slug);
  const [image, setImage] = useState<IWebsiteImage>();
  const [isHidden, setIsHidden] = useState(false);
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
      setImage(i);

      // potentially make into a util
      const domainBlocklistArray = await props.store.domainBlocklistStore.getAll();
      const websiteBlocklistArray = await props.store.websiteBlocklistStore.getAll();
      const domainBlocklist: { [id: string]: boolean } = {};
      const websiteBlocklist: { [id: string]: boolean } = {};

      domainBlocklistArray.forEach((item) => (domainBlocklist[item.id] = true));
      websiteBlocklistArray.forEach((item) => (websiteBlocklist[item.id] = true));

      setIsHidden(domainBlocklist[w.domain] || websiteBlocklist[w.id]);
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
      <div className={classes.topPadding}>
        <Grid container spacing={6}>
          <Grid item xs={6}>
            <Link href={website?.rawUrl} underline="none">
              <Box boxShadow={1} className={classes.container}>
                <LargeWebsiteImage
                  image={image}
                  websiteId={websiteId}
                  isDarkMode={props.isDarkMode}
                  ogImage={website?.ogImage}
                />
              </Box>
            </Link>
          </Grid>
          <Grid item xs={6}>
            <Grid
              container
              justifyContent="space-between"
              flexDirection="column"
              style={{ height: '100%' }}
            >
              <Grid item>
                <Link href={website?.rawUrl} underline="none">
                  <Typography
                    variant="h2"
                    color="textPrimary"
                    gutterBottom
                    className={isHidden ? classes.hiddenWebsite : undefined}
                  >
                    {website.title}
                  </Typography>
                </Link>
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
              <Grid item style={{ width: '100%' }}>
                <AddTagInput
                  store={props.store}
                  websiteCache={props.websiteCache}
                  website={website}
                  userTags={props.websiteTags}
                  websiteTags={websiteTags}
                />
              </Grid>
            </Grid>
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
                    <Grid item xs={3} key={item.id}>
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
        {websiteTags.map((t) => (
          <div className={classes.section} key={t} id={`tag-${t}`}>
            <DraggableWebsiteHighlights
              store={props.store}
              toggleWebsiteTag={props.toggleWebsiteTag}
              websiteTags={props.websiteTags}
              isDarkMode={props.isDarkMode}
              filterByTag={t}
              maxWebsites={4}
              websiteCache={props.websiteCache}
              dragDropSource={props.dragDropSource}
            />
          </div>
        ))}
      </div>
    </Root>
  );
};

export default ExpandWebsite;
