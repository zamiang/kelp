import { styled } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import useTheme from '@mui/styles/useTheme';
import React from 'react';
import { IWebsiteTag } from '../store/data-types';
import { IStore } from '../store/use-store';
import { DraggableWebsiteHighlights } from './draggable-website-highlights';
import { IWebsiteCache } from './get-featured-websites';

const PREFIX = 'TagHighlights';

const classes = {
  section: `${PREFIX}-section`,
};

const Root = styled('div')(({ theme }) => ({
  [`& .${classes.section}`]: {
    marginBottom: theme.spacing(8),
  },
}));

export const TagHighlights = (props: {
  store: IStore;
  toggleWebsiteTag: (tag: string, websiteId?: string) => Promise<void>;
  websiteTags: IWebsiteTag[];
  showAddWebsiteDialog: (tag: string) => void;
  websiteCache: IWebsiteCache;
  dragDropSource?: string;
  tagRowLoading?: string;
}) => {
  const theme = useTheme();
  const orderedTags = props.websiteTags;
  const isLarge = useMediaQuery((theme as any).breakpoints.up('lg'));

  return (
    <Root>
      {orderedTags.map((t) => (
        <div className={classes.section} key={t.id} id={`tag-${t.tag}`}>
          <DraggableWebsiteHighlights
            store={props.store}
            toggleWebsiteTag={props.toggleWebsiteTag}
            websiteTags={props.websiteTags}
            filterByTag={t.tag}
            showAddWebsiteDialog={props.showAddWebsiteDialog}
            maxWebsites={isLarge ? 4 : 3}
            websiteCache={props.websiteCache}
            dragDropSource={props.dragDropSource}
            isLoading={t.tag === props.tagRowLoading}
          />
        </div>
      ))}
    </Root>
  );
};
