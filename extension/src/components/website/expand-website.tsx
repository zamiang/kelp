import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import clsx from 'clsx';
import { clone } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import config from '../../../../constants/config';
import CloseIcon from '../../../../public/icons/close.svg';
import { cleanupUrl } from '../shared/cleanup-url';
import { getTagsForWebsite, isTagSelected } from '../shared/website-tag';
import { IWebsiteImage, IWebsiteTag } from '../store/data-types';
import { IStore } from '../store/use-store';
import { IWebsiteCache, IWebsiteCacheItem } from '../website/get-featured-websites';
import { LargeWebsite } from '../website/large-website';
import { DraggableWebsiteHighlights } from './draggable-website-highlights';
import '../../styles/components/website/expand-website.css';

const MAX_TAGS = 10;

const LargeWebsiteImage = (props: {
  image?: IWebsiteImage;
  websiteId: string;
  ogImage?: string;
}) => {
  if (props.image?.image) {
    return (
      <div
        className="expand-website-image-container"
        style={{
          backgroundImage: `url('${props.ogImage || props.image.image}')`,
        }}
      >
        <div className="expand-website-dots"></div>
      </div>
    );
  }
  const domain = new URL(props.websiteId).hostname;
  if (domain) {
    return (
      <div className="expand-website-favicon-container">
        <IconButton className="expand-website-icon-button" size="large">
          <img
            src={`https://www.google.com/s2/favicons?domain_url=${domain}`}
            height={config.ICON_SIZE}
            width={config.ICON_SIZE}
          />
        </IconButton>
      </div>
    );
  }
  return null;
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
    <div className="expand-website-tag-form">
      {errorText && <div className="expand-website-error-text">{errorText}</div>}
      <div className="expand-website-tag-form-layout">
        <div className="expand-website-tag-input-container">
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
        </div>
        <div className="expand-website-tag-button-container">
          <Button
            size="small"
            variant="outlined"
            className="expand-website-small-button"
            onClick={addTag}
          >
            Add Tag
          </Button>
        </div>
      </div>
    </div>
  );
};

const ExpandWebsite = (props: {
  store: IStore;
  websiteId?: string;
  close?: () => void;
  toggleWebsiteTag: (tag: string, websiteId?: string) => Promise<void>;
  websiteTags: IWebsiteTag[];
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
      const url = cleanupUrl(websiteId);
      const w = props.websiteCache[url];
      if (!w) {
        console.error('Unable to find website for url: %s', url);
      }
      setWebsite(w);

      const websites = Object.values(props.websiteCache)
        .filter((c) => c.domain === w.domain)
        .sort((a, b) => (b?.visitCount > a?.visitCount ? 1 : -1));
      setWebsitesAtDomain(websites);

      const i = await props.store.websiteImageStore.getById(url);
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

  const websiteTags = getTagsForWebsite(website?.tags || '', props.websiteTags).slice(0, MAX_TAGS);

  const removeTag = async (tag: string) => {
    const updatedTags = websiteTags.filter((t) => t !== tag).join(' ');
    await props.store.websiteStore.updateTags(website.id, updatedTags);

    // Prevent prototype pollution
    if (websiteId === '__proto__' || websiteId === 'constructor' || websiteId === 'prototype') {
      throw new Error('Invalid websiteId');
    }
    (props.websiteCache[websiteId] as any).tags = updatedTags;
    return props.store.incrementLoading();
  };

  return (
    <div className="expand-website-root">
      <div className="expand-website-top-padding">
        <div className="expand-website-main-layout">
          <div className="expand-website-image-section">
            <Link href={website?.rawUrl} underline="none" className="expand-website-link">
              <div className="expand-website-container">
                <LargeWebsiteImage image={image} websiteId={websiteId} ogImage={website?.ogImage} />
              </div>
            </Link>
          </div>
          <div className="expand-website-content-section">
            <div className="expand-website-content-top">
              <Link href={website?.rawUrl} underline="none" className="expand-website-link">
                <Typography
                  variant="h2"
                  color="textPrimary"
                  className={clsx('expand-website-title', isHidden && 'expand-website-hidden')}
                >
                  {website.title}
                </Typography>
              </Link>
              {website.description && (
                <Typography
                  variant="body2"
                  color="textPrimary"
                  className={clsx(
                    'expand-website-description',
                    isHidden && 'expand-website-hidden',
                  )}
                >
                  {website.description}
                </Typography>
              )}
              <div className="expand-website-tags">
                {websiteTags.map((tag) => (
                  <div className="expand-website-tag-container" key={`${tag}-${websiteId}`}>
                    <div
                      onClick={() => props.toggleWebsiteTag(tag, websiteId)}
                      className={clsx(
                        'expand-website-tag',
                        isTagSelected(tag, props.websiteTags) && 'expand-website-tag-selected',
                      )}
                    >
                      <Typography variant="body2" className="expand-website-tag-text">
                        {tag}
                      </Typography>
                    </div>
                    <button onClick={() => removeTag(tag)} className="expand-website-tag-close">
                      <CloseIcon width="18" height="18" className="expand-website-close-icon" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="expand-website-content-bottom">
              <AddTagInput
                store={props.store}
                websiteCache={props.websiteCache}
                website={website}
                userTags={props.websiteTags}
                websiteTags={websiteTags}
              />
            </div>
          </div>
        </div>
        {websitesAtDomain.length > 0 && (
          <div className="expand-website-section" id="meetings">
            <Typography variant="h3" className="expand-website-section-heading">
              Related Websites
            </Typography>
            <div className="expand-website-grid-container">
              <div className="expand-website-grid">
                {websitesAtDomain.map((item) => (
                  <div className="expand-website-grid-item" key={item.id}>
                    <LargeWebsite
                      item={item}
                      store={props.store}
                      websiteTags={props.websiteTags}
                      toggleWebsiteTag={props.toggleWebsiteTag}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {websiteTags.map((t) => (
          <div className="expand-website-section" key={t} id={`tag-${t}`}>
            <DraggableWebsiteHighlights
              store={props.store}
              toggleWebsiteTag={props.toggleWebsiteTag}
              websiteTags={props.websiteTags}
              filterByTag={t}
              maxWebsites={3}
              websiteCache={props.websiteCache}
              dragDropSource={props.dragDropSource}
              shouldHideCloseButton={true}
              isLoading={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpandWebsite;
