import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../../../../constants/config';
import CloseIcon from '../../../../public/icons/close.svg';
import DotsIcon from '../../../../public/icons/dots.svg';
import { WebsiteTags } from '../shared/website-tag';
import { IWebsiteImage, IWebsiteItem, IWebsiteTag } from '../store/data-types';
import { IStore } from '../store/use-store';
import { IFeaturedWebsite } from './get-featured-websites';
import '../../styles/components/website/large-website.css';

const WebsiteImage = (props: {
  image?: IWebsiteImage;
  item: IFeaturedWebsite;
  ogImage?: string;
}) => {
  if (props.image?.image) {
    return (
      <div
        className="large-website__image-container"
        style={{
          backgroundImage: `url('${props.ogImage || props.image.image}')`,
        }}
      >
        <div className="large-website__dots"></div>
      </div>
    );
  }
  const domain = new URL(props.item.id).hostname;
  if (domain) {
    return (
      <div className="large-website__favicon-container">
        <IconButton size="large" className="large-website__icon-button">
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

export const LargeWebsite = (props: {
  store: IStore;
  item: IFeaturedWebsite;
  toggleWebsiteTag: (tag: string, websiteId: string) => Promise<void>;
  smGridSize?: number;
  websiteTags: IWebsiteTag[];
}) => {
  const navigate = useNavigate();
  const [shouldShowRemove, setShouldShowRemove] = useState(false);
  const [image, setImage] = useState<IWebsiteImage>();
  const [website, setWebsite] = useState<IWebsiteItem>();

  useEffect(() => {
    let isSubscribed = true;
    const fetchData = async () => {
      const result = await props.store.websiteStore.getById(props.item.id);
      if (result.success && result.data) {
        return isSubscribed && setWebsite(result.data);
      }
    };
    void fetchData();
    return () => (isSubscribed = false) as any;
  }, [props.item.id]);

  useEffect(() => {
    let isSubscribed = true;
    const fetchData = async () => {
      const i = await props.store.websiteImageStore.getById(props.item.id);
      return isSubscribed && setImage(i);
    };
    void fetchData();
    return () => (isSubscribed = false) as any;
  }, [props.item.id]);

  const hideWebsite = async (websiteId: string) => {
    await props.store.websiteBlocklistStore.addWebsite(websiteId);
    // setIsHidden(true);
    props.store.incrementLoading();
  };

  return (
    <div
      className="large-website"
      onMouseEnter={() => setShouldShowRemove(true)}
      onMouseLeave={() => setShouldShowRemove(false)}
    >
      {shouldShowRemove && (
        <IconButton
          className="large-website__remove-button"
          onClick={() => void hideWebsite(props.item.id)}
        >
          <CloseIcon width={config.ICON_SIZE} height={config.ICON_SIZE} />
        </IconButton>
      )}
      <Link href={website?.rawUrl} underline="none">
        <Box boxShadow={1} className="large-website__container">
          <WebsiteImage image={image} item={props.item} ogImage={website?.ogImage} />
        </Box>
        <Tooltip title={website?.title || ''}>
          <Typography noWrap className="large-website__text" variant="body2">
            {website ? website.title : 'loading'}
          </Typography>
        </Tooltip>
      </Link>
      <div className="large-website__text-container">
        <div className="large-website__tags-container">
          <WebsiteTags
            store={props.store}
            item={props.item}
            toggleWebsiteTag={props.toggleWebsiteTag}
            userTags={props.websiteTags}
          />
        </div>
        <div>
          <IconButton
            size="small"
            disableRipple
            onClick={() => navigate(`/websites/${encodeURIComponent(props.item.id)}`)}
            className="large-website__dots-button"
          >
            <DotsIcon
              width={config.ICON_SIZE}
              height={config.ICON_SIZE}
              className="large-website__dots-icon"
            />
          </IconButton>
        </div>
      </div>
    </div>
  );
};
