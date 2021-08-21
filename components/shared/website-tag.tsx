import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/core/styles/makeStyles';
import clsx from 'clsx';
import { uniqBy } from 'lodash';
import React, { useEffect, useState } from 'react';
import { IWebsiteTag } from '../store/data-types';
import { IStore } from '../store/use-store';
import { IFeaturedWebsite } from '../website/get-featured-websites';
import { cleanText } from './tfidf';

const useStyles = makeStyles((theme) => ({
  tags: {
    height: 20,
    overflow: 'hidden',
    marginTop: theme.spacing(0.5),
  },
  tag: {
    display: 'inline-block',
    marginRight: theme.spacing(2),
    paddingLeft: theme.spacing(0.5),
    paddingRight: theme.spacing(0.5),
    opacity: 0,
    transition: 'opacity 0.3s',
    borderRadius: 5,
    pointerEvents: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  tagVisible: {
    pointerEvents: 'all',
    cursor: 'pointer',
    opacity: 0.8,
  },
  tagSelected: {
    pointerEvents: 'all',
    cursor: 'pointer',
    background: theme.palette.primary.dark,
    opacity: 1,
  },
}));

const isTagSelected = (text: string, userTags: IWebsiteTag[]) => {
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

const getTagsForWebsite = async (websiteTitle: string, store: IStore, userTags: IWebsiteTag[]) => {
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
  isHovering: boolean;
}) => {
  const [websiteTags, setWebsiteTags] = useState<string[]>([]);
  const classes = useStyles();

  useEffect(() => {
    const fetchData = async () => {
      const i = await getTagsForWebsite(
        props.item.cleanText ||
          cleanText(props.item.text || '')
            .join(' ')
            .toLocaleLowerCase(),
        props.store,
        props.userTags,
      );
      setWebsiteTags(i);
    };
    void fetchData();
  }, [props.item.websiteId, props.userTags.length]);

  return (
    <div className={classes.tags}>
      {websiteTags.map((tag) => (
        <div
          key={`${tag}-${props.item.websiteId}`}
          onClick={() => props.toggleWebsiteTag(tag, props.item.websiteId)}
          className={clsx(
            classes.tag,
            props.isHovering && classes.tagVisible,
            isTagSelected(tag, props.userTags) && classes.tagSelected,
          )}
        >
          <Typography>{tag}</Typography>
        </div>
      ))}
    </div>
  );
};
