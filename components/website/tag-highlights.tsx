import makeStyles from '@material-ui/core/styles/makeStyles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import useTheme from '@material-ui/styles/useTheme';
import React from 'react';
import { IWebsiteTag } from '../store/data-types';
import { IStore } from '../store/use-store';
import { DraggableWebsiteHighlights } from './draggable-website-highlights';
import { IFeaturedWebsite } from './get-featured-websites';

const useStyles = makeStyles((theme) => ({
  section: {
    marginBottom: theme.spacing(8),
  },
}));

export const TagHighlights = (props: {
  store: IStore;
  toggleWebsiteTag: (tag: string, websiteId?: string) => Promise<void>;
  websiteTags: IWebsiteTag[];
  isDarkMode: boolean;
  showWebsitePopup: (item: IFeaturedWebsite) => void;
}) => {
  const theme = useTheme();

  const orderedTags = props.websiteTags;
  const classes = useStyles();
  const isLarge = useMediaQuery((theme as any).breakpoints.up('lg'));

  console.log(isLarge);
  return (
    <div>
      {orderedTags.map((t) => (
        <div className={classes.section} key={t.id} id={`tag-${t.tag}`}>
          <DraggableWebsiteHighlights
            store={props.store}
            toggleWebsiteTag={props.toggleWebsiteTag}
            websiteTags={props.websiteTags}
            isDarkMode={props.isDarkMode}
            filterByTag={t.tag}
            showWebsitePopup={props.showWebsitePopup}
            maxWebsites={isLarge ? 4 : 3}
          />
        </div>
      ))}
    </div>
  );
};
