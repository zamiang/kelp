import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
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
    color: theme.palette.text.primary,
    fontSize: theme.typography.h3.fontSize,
  },
  topSection: {
    marginBottom: theme.spacing(1),
    position: 'relative',
    zIndex: 5,
  },
}));

export const TagHighlights = (props: {
  store: IStore;
  currentFilter: string;
  toggleWebsiteTag: (tag: string, websiteId?: string) => Promise<void>;
  websiteTags: IWebsiteTag[];
  isDarkMode: boolean;
  showWebsitePopup: (item: IFeaturedWebsite) => void;
}) => {
  const orderedTags = props.websiteTags;
  const classes = useStyles();

  return (
    <div>
      {orderedTags.map((t) => (
        <div className={classes.section} key={t.id} id={`tag-${t.tag}`}>
          <Grid
            container
            alignItems="center"
            justifyContent="space-between"
            className={classes.topSection}
          >
            <Grid item>
              <Typography className={classes.title}>{t.tag}</Typography>
            </Grid>
            <Grid item>
              <Button onClick={() => props.toggleWebsiteTag(t.tag)}>Remove</Button>
            </Grid>
          </Grid>
          <WebsiteHighlights
            store={props.store}
            toggleWebsiteTag={props.toggleWebsiteTag}
            currentFilter={props.currentFilter}
            websiteTags={props.websiteTags}
            isDarkMode={props.isDarkMode}
            filterByTag={t.tag}
            showWebsitePopup={props.showWebsitePopup}
          />
        </div>
      ))}
    </div>
  );
};
