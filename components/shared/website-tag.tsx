import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/core/styles/makeStyles';
import clsx from 'clsx';
import { uniqBy } from 'lodash';
import React, { useEffect, useState } from 'react';
import { IWebsiteTag } from '../store/data-types';
import { IStore } from '../store/use-store';
import { IFeaturedWebsite } from '../website/get-featured-websites';

const useStyles = makeStyles((theme) => ({
  tags: {
    overflow: 'hidden',
    height: 22,
  },
  tag: {
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
  tagSelected: {
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
      return store.websiteTagStore.delete(tag, websiteId);
    }
    return store.websiteTagStore.deleteAllForTag(tag);
  }
  if (websiteId) {
    return store.websiteTagStore.create(tag, websiteId);
  }
};

export const getTagsForWebsite = async (
  websiteTitle: string,
  store: IStore,
  userTags: IWebsiteTag[],
) => {
  const tfidf = await store.tfidfStore.getTfidf(store);
  const values = uniqBy(tfidf.tfidfs(websiteTitle), (t) => t.term);
  const sorted = values.sort((a, b) => {
    const isASelected = isTagSelected(a.term, userTags);
    const isBSelected = isTagSelected(b.term, userTags);
    if (isASelected && !isBSelected) {
      return -1;
    } else if (isBSelected && !isASelected) {
      return 1;
    }
    return a.value > b.value ? -1 : 1;
  });
  return sorted.map((a) => a.term);
};

export const WebsiteTags = (props: {
  store: IStore;
  item: IFeaturedWebsite;
  userTags: IWebsiteTag[];
  toggleWebsiteTag: (text: string, websiteId: string) => void;
}) => {
  const [websiteTags, setWebsiteTags] = useState<string[]>([]);
  const classes = useStyles();

  useEffect(() => {
    let isSubscribed = true;
    const fetchData = async () => {
      const website = await props.store.websiteStore.getById(props.item.websiteId);
      if (website?.tags) {
        const i = await getTagsForWebsite(website.tags || '', props.store, props.userTags);
        return isSubscribed && setWebsiteTags(i);
      } else {
        return isSubscribed && setWebsiteTags([]);
      }
    };
    void fetchData();
    return () => (isSubscribed = false) as any;
  }, [props.item.websiteId, props.userTags.length]);

  return (
    <div className={classes.tags}>
      {websiteTags.map((tag) => (
        <div
          key={`${tag}-${props.item.websiteId}`}
          onClick={() => props.toggleWebsiteTag(tag, props.item.websiteId)}
          className={clsx(classes.tag, isTagSelected(tag, props.userTags) && classes.tagSelected)}
        >
          <Typography variant="body2">{tag}</Typography>
        </div>
      ))}
    </div>
  );
};
