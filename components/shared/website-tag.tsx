import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/core/styles/makeStyles';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import { IStore } from '../store/use-store';
import { IFeaturedWebsite } from '../website/get-featured-websites';

const useStyles = makeStyles(() => ({
  tags: {},
  tag: {},
  tagSelected: {},
}));

const isTagSelected = (text: string, userTags: IWebsiteTag[]) => {
  const existingTagText = userTags.map((t) => t.text);
  return existingTagText.includes(text);
};

const toggleWebsiteTag = async (
  tag: string,
  websiteId: string,
  userTags: IWebsiteTag[],
  store: IStore,
) => {
  if (isTagSelected(tag, userTags)) {
    await store.websiteTagStore.addTag(tag, websiteId);
  } else {
    await store.websiteTagStore.removeTag(tag, websiteId);
  }
  return;
};

export const WebsiteTags = (props: {
  store: IStore;
  item: IFeaturedWebsite;
  userTags: IWebsiteTag[];
  toggleWebsiteTag: (text: string, websiteId: string) => void;
}) => {
  const [tags, setTags] = useState<IWebsiteTag>([]);
  const classes = useStyles();

  useEffect(() => {
    const fetchData = async () => {
      const i = await props.store.websiteTagStore.getById(props.item.websiteId);
      setTags(i);
    };
    void fetchData();
  }, [props.item.websiteId]);

  return (
    <div className={classes.tags}>
      {tags.map((tag) => (
        <div
          key={tag.id}
          onClick={() => props.toggleWebsiteTag(tag.text, props.item.websiteId)}
          className={clsx(
            classes.tag,
            isTagSelected(tag.text, props.userTags) && classes.tagSelected,
          )}
        >
          <Typography>{tag.text}</Typography>
        </div>
      ))}
    </div>
  );
};
