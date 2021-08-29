import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/core/styles/makeStyles';
import React, { useEffect, useState } from 'react';
import { ISegment, ISegmentTag, IWebsiteTag } from '../store/data-types';
import { IStore } from '../store/use-store';
import {
  IFeaturedWebsite,
  fetchWebsitesForMeetingFiltered,
} from '../website/get-featured-websites';
import { LargeWebsite } from '../website/large-website';
import { RightArrow } from '../website/right-arrow';
import { WebsiteHighlights } from '../website/website-highlights';

const useStyles = makeStyles((theme) => ({
  section: {
    marginTop: theme.spacing(4),
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

const MeetingRowBelow = (props: {
  meeting: ISegment;
  store: IStore;
  hideDialogUrl?: string;
  currentFilter: string;
  isDarkMode: boolean;
  isFullWidth: boolean;
  websiteTags: IWebsiteTag[];
  meetingTags: ISegmentTag[];
  showWebsitePopup: (item: IFeaturedWebsite) => void;
  toggleWebsiteTag: (tag: string, websiteId: string) => Promise<void>;
  toggleMeetingTag: (tag: string, meetingId: string, meetingSummary: string) => void;
}) => {
  const classes = useStyles();
  const [websites, setWebsites] = useState<IFeaturedWebsite[]>([]);
  const [shouldShowAll, setShouldShowAll] = useState(false);
  const [extraItemsCount, setExtraItemsCount] = useState(0);

  useEffect(() => {
    void fetchWebsitesForMeetingFiltered(
      props.meeting,
      props.store,
      props.currentFilter,
      shouldShowAll,
      setWebsites,
      setExtraItemsCount,
    );
  }, [
    props.store.lastUpdated,
    props.store.isLoading,
    props.meeting.id,
    props.hideDialogUrl,
    shouldShowAll,
    props.currentFilter,
  ]);

  if (websites.length < 1 && props.meetingTags.length < 1) {
    return null;
  }

  return (
    <Grid item xs={props.isFullWidth ? 12 : 11}>
      <Grid container spacing={4}>
        {websites.map((item) => (
          <LargeWebsite
            key={item.websiteId}
            item={item}
            store={props.store}
            smGridSize={4}
            websiteTags={props.websiteTags}
            toggleWebsiteTag={props.toggleWebsiteTag}
            isDarkMode={props.isDarkMode}
            showWebsitePopup={props.showWebsitePopup}
          />
        ))}
      </Grid>
      {extraItemsCount > 0 && (
        <div style={{ marginTop: 12 }}>
          <RightArrow
            isEnabled={shouldShowAll}
            isDarkMode={props.isDarkMode}
            count={extraItemsCount}
            onClick={() => {
              setShouldShowAll(!shouldShowAll);
            }}
          />
        </div>
      )}
      {props.meetingTags.map((t) => (
        <div className={classes.section} key={t.id}>
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
              <Button
                onClick={() =>
                  props.toggleMeetingTag(t.tag, props.meeting.id, props.meeting.summary || '')
                }
              >
                Remove
              </Button>
            </Grid>
          </Grid>
          <WebsiteHighlights
            store={props.store}
            toggleWebsiteTag={props.toggleWebsiteTag}
            currentFilter={props.currentFilter}
            websiteTags={props.websiteTags}
            showWebsitePopup={props.showWebsitePopup}
            hideDialogUrl={props.hideDialogUrl}
            isDarkMode={props.isDarkMode}
            filterByTag={t.tag}
          />
        </div>
      ))}
    </Grid>
  );
};

export default MeetingRowBelow;
