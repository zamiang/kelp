import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/core/styles/makeStyles';
import React from 'react';
import { IWebsiteTag } from '../store/data-types';
import { IStore } from '../store/use-store';
import { IFeaturedWebsite } from './get-featured-websites';
import { WebsiteHighlights } from './website-highlights';

const useStyles = makeStyles((theme) => ({
  section: {
    marginBottom: theme.spacing(8),
  },
  title: {
    marginBottom: theme.spacing(1),
  },
}));

export const TagHighlights = (props: {
  store: IStore;
  currentFilter: string;
  hideWebsite: (item: IFeaturedWebsite) => void;
  toggleWebsiteTag: (tag: string, websiteId: string) => Promise<void>;
  websiteTags: IWebsiteTag[];
  hideDialogUrl?: string;
  isDarkMode: boolean;
}) => {
  const orderedTags = props.websiteTags;
  const classes = useStyles();

  return (
    <div>
      {orderedTags.map((t) => (
        <div className={classes.section} key={t.id}>
          <Typography variant="h2" className={classes.title}>
            {t.tag}
          </Typography>
          <WebsiteHighlights
            store={props.store}
            toggleWebsiteTag={props.toggleWebsiteTag}
            currentFilter={props.currentFilter}
            websiteTags={props.websiteTags}
            hideWebsite={props.hideWebsite}
            hideDialogUrl={props.hideDialogUrl}
            isDarkMode={props.isDarkMode}
            filterByTag={t.tag}
          />
        </div>
      ))}
    </div>
  );
};
