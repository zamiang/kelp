import Typography from '@mui/material/Typography';
import clsx from 'clsx';
import { uniq } from 'lodash';
import React, { useEffect, useState } from 'react';
import { IWebsiteTag } from '../store/data-types';
import { IStore } from '../store/use-store';
import { IFeaturedWebsite } from '../website/get-featured-websites';
import '../../styles/components/shared/website-tag.css';

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
    return store.websiteTagStore.delete(tag);
  }
  return store.websiteTagStore.create(tag, websiteId);
};

export const getTagsForWebsite = (tags: string, userTags: IWebsiteTag[]) => {
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
  return uniq(sorted.filter((t) => t.length > 2 && t.length < 15));
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
      const result = await props.store.websiteStore.getById(props.item.id);
      if (result.success && result.data?.tags) {
        const i = getTagsForWebsite(result.data.tags || '', props.userTags);
        return isSubscribed && setWebsiteTags(i);
      } else {
        return isSubscribed && setWebsiteTags([]);
      }
    };
    void fetchData();
    return () => (isSubscribed = false) as any;
  }, [props.item.id, props.userTags.length]);

  return (
    <div className="website-tags">
      {websiteTags.map((tag) => (
        <div
          key={`${tag}-${props.item.id}`}
          onClick={() => props.toggleWebsiteTag(tag, props.item.id)}
          className={clsx(
            'website-tag',
            isTagSelected(tag, props.userTags) && 'website-tag--selected',
          )}
        >
          <Typography variant="subtitle2">{tag}</Typography>
        </div>
      ))}
    </div>
  );
};
