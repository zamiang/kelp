import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/core/styles/makeStyles';
import clsx from 'clsx';
import { uniqBy } from 'lodash';
import React, { useEffect, useState } from 'react';
import { IWebsiteTag } from '../store/data-types';
import { IStore } from '../store/use-store';
import { IFeaturedWebsite } from '../website/get-featured-websites';

const useStyles = makeStyles(() => ({
  tags: {},
  tag: {},
  tagSelected: {},
}));

const isTagSelected = (text: string, userTags: IWebsiteTag[]) => {
  const existingTagText = userTags.map((t) => t.tag);
  return existingTagText.includes(text);
};

export const toggleWebsiteTag = async (
  tag: string,
  websiteId: string,
  userTags: IWebsiteTag[],
  store: IStore,
) => {
  if (isTagSelected(tag, userTags)) {
    await store.websiteTagStore.create(tag, websiteId);
  } else {
    await store.websiteTagStore.delete(tag, websiteId);
  }
  return;
};

const getTagsForWebsite = async (websiteTitle: string, store: IStore) => {
  const tfidf = await store.tfidfStore.getTfidf(store);
  const values = uniqBy(tfidf.tfidfs(websiteTitle), (t) => t.term);
  const sorted = values.sort((a, b) => b.value - a.value);
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
    const fetchData = async () => {
      const i = await getTagsForWebsite(props.item.text!, props.store);
      setWebsiteTags(i);
    };
    void fetchData();
  }, [props.item.websiteId]);

  return (
    <div className={classes.tags}>
      {websiteTags.map((tag) => (
        <div
          key={`${tag}-${props.item.websiteId}`}
          onClick={() => toggleWebsiteTag(tag, props.item.websiteId, props.userTags, props.store)}
          className={clsx(classes.tag, isTagSelected(tag, props.userTags) && classes.tagSelected)}
        >
          <Typography>{tag}</Typography>
        </div>
      ))}
    </div>
  );
};
