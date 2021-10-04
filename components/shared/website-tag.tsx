import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import { IWebsiteTag } from '../store/data-types';
import { IStore } from '../store/use-store';
import { IFeaturedWebsite } from '../website/get-featured-websites';

const PREFIX = 'WebsiteTags';

const classes = {
  tags: `${PREFIX}-tags`,
  tag: `${PREFIX}-tag`,
  tagSelected: `${PREFIX}-tagSelected`,
};

const Root = styled('div')(({ theme }) => ({
  [`&.${classes.tags}`]: {
    overflow: 'hidden',
    height: 22,
  },

  [`& .${classes.tag}`]: {
    display: 'inline-block',
    marginRight: theme.spacing(1 / 2),
    marginLeft: theme.spacing(1 / 2),
    transition: 'borderBottom 0.3s',
    borderBottom: '1px solid transparent',
    cursor: 'pointer',
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
}));

export const isTagSelected = (text: string, userTags: IWebsiteTag[]) => {
  const existingTagText = userTags.map((t) => t.tag);
  return existingTagText.includes(text);
};

export const toggleWebsiteTag = async (
  tag: string,
  userTags: IWebsiteTag[],
  store: IStore,
  websiteId?: string,
) => {
  if (isTagSelected(tag, userTags)) {
    if (websiteId) {
      const website = await store.websiteStore.getById(websiteId);
      if (website) {
        return store.websiteStore.updateTags(
          website.id,
          (website.tags || '').replace(tag, '').trim().replace('  ', ' '),
        );
      }
    } else {
      return store.websiteTagStore.deleteAllForTag(tag);
    }
  }
  if (websiteId) {
    return store.websiteTagStore.create(tag, websiteId);
  }
};

export const getTagsForWebsite = async (tags: string, userTags: IWebsiteTag[]) => {
  const sorted = tags
    .trim()
    .split(' ')
    .sort((a, b) => {
      const isASelected = isTagSelected(a, userTags);
      const isBSelected = isTagSelected(b, userTags);
      if (isASelected && !isBSelected) {
        return -1;
      } else if (isBSelected && !isASelected) {
        return 1;
      }
      return 0;
    });
  // Ensure there are no blank tags
  return sorted.filter((t) => t.length > 2 && t.length < 15);
};

export const WebsiteTags = (props: {
  store: IStore;
  item: IFeaturedWebsite;
  userTags: IWebsiteTag[];
  toggleWebsiteTag: (text: string, websiteId: string) => void;
}) => {
  const [websiteTags, setWebsiteTags] = useState<string[]>([]);

  useEffect(() => {
    let isSubscribed = true;
    const fetchData = async () => {
      const website = await props.store.websiteStore.getById(props.item.websiteId);
      if (website?.tags) {
        const i = await getTagsForWebsite(website.tags || '', props.userTags);
        return isSubscribed && setWebsiteTags(i);
      } else {
        return isSubscribed && setWebsiteTags([]);
      }
    };
    void fetchData();
    return () => (isSubscribed = false) as any;
  }, [props.item.websiteId, props.userTags.length]);

  return (
    <Root className={classes.tags}>
      {websiteTags.map((tag) => (
        <div
          key={`${tag}-${props.item.websiteId}`}
          onClick={() => props.toggleWebsiteTag(tag, props.item.websiteId)}
          className={clsx(classes.tag, isTagSelected(tag, props.userTags) && classes.tagSelected)}
        >
          <Typography variant="body2">{tag}</Typography>
        </div>
      ))}
    </Root>
  );
};
