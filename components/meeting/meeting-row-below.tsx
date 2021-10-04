import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import useMediaQuery from '@mui/material/useMediaQuery';
import useTheme from '@mui/styles/useTheme';
import React, { useEffect, useState } from 'react';
import { ISegment, ISegmentTag, IWebsiteTag } from '../store/data-types';
import { IStore } from '../store/use-store';
import {
  IFeaturedWebsite,
  fetchWebsitesForMeetingFiltered,
} from '../website/get-featured-websites';
import { LargeWebsite } from '../website/large-website';
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

  const theme = useTheme();
  const isMobile = useMediaQuery((theme as any).breakpoints.down('lg'), {
    defaultMatches: true,
  });

  useEffect(() => {
    let isSubscribed = true;
    void fetchWebsitesForMeetingFiltered(
      props.meeting,
      props.store,
      shouldShowAll,
      setWebsites,
      setExtraItemsCount,
      isSubscribed,
    );
    return () => (isSubscribed = false) as any;
  }, [props.store.isLoading, props.meeting.id, shouldShowAll]);

  if (websites.length < 1 && props.meetingTags.length < 1) {
    return null;
  }

  return (
    <Grid item xs={props.isFullWidth ? 12 : 11}>
      <Grid container spacing={isMobile ? 5 : 6}>
        {websites.map((item) => (
          <Grid item xs={3} key={item.websiteId}>
            <LargeWebsite
              item={item}
              store={props.store}
              smGridSize={4}
              websiteTags={props.websiteTags}
              toggleWebsiteTag={props.toggleWebsiteTag}
              isDarkMode={props.isDarkMode}
              showWebsitePopup={props.showWebsitePopup}
            />
          </Grid>
        ))}
      </Grid>
      {extraItemsCount > 0 && (
        <Button
          onClick={() => {
            setShouldShowAll(!shouldShowAll);
          }}
        >
          Show all
        </Button>
      )}
      {props.meetingTags.map((t) => (
        <div className={classes.section} key={t.id}>
          <div className={classes.topSection}>
            <Typography className={classes.title}>{t.tag}</Typography>
          </div>
          <WebsiteHighlights
            store={props.store}
            toggleWebsiteTag={props.toggleWebsiteTag}
            websiteTags={props.websiteTags}
            showWebsitePopup={props.showWebsitePopup}
            isDarkMode={props.isDarkMode}
            filterByTag={t.tag}
          />
        </div>
      ))}
    </Grid>
  );
};

export default MeetingRowBelow;
