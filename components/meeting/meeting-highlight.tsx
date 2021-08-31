import makeStyles from '@material-ui/core/styles/makeStyles';
import { setHours, setMinutes, subDays, subMinutes } from 'date-fns';
import { Dictionary, flatten } from 'lodash';
import React, { useEffect, useState } from 'react';
import { ISegment, IWebsiteTag } from '../store/data-types';
import { IStore } from '../store/use-store';
import { IFeaturedWebsite } from '../website/get-featured-websites';
import { FeaturedMeeting } from './featured-meeting';

const useStyles = makeStyles((theme) => ({
  highlight: {
    marginBottom: theme.spacing(4),
  },
}));

export const MeetingHighlight = (props: {
  store: IStore;
  toggleWebsiteTag: (tag: string, websiteId: string) => Promise<void>;
  websiteTags: IWebsiteTag[];
  currentFilter: string;
  isDarkMode: boolean;
  showWebsitePopup: (item: IFeaturedWebsite) => void;
}) => {
  const classes = useStyles();
  const currentTime = new Date();
  const [meetingsByDay, setMeetingsByDay] = useState<Dictionary<ISegment[]>>({});

  useEffect(() => {
    const fetchData = async () => {
      const result = await props.store.timeDataStore.getSegmentsByDay(
        subDays(setMinutes(setHours(new Date(), 0), 0), 0),
      );
      setMeetingsByDay(result);
    };
    void fetchData();
  }, [props.store.lastUpdated, props.store.isLoading]);

  let featuredMeeting: ISegment | undefined;
  // Assumes meetings are already sorted
  flatten(Object.values(meetingsByDay)).forEach((meeting) => {
    if (
      !featuredMeeting &&
      currentTime < meeting.end &&
      currentTime > subMinutes(meeting.start, 10)
    ) {
      featuredMeeting = meeting;
    }
  });

  if (!featuredMeeting) {
    return null;
  }

  return (
    <div className={classes.highlight}>
      <FeaturedMeeting
        store={props.store}
        meeting={featuredMeeting}
        currentFilter={props.currentFilter}
        showButton
        isDarkMode={props.isDarkMode}
        showWebsitePopup={props.showWebsitePopup}
        websiteTags={props.websiteTags}
        toggleWebsiteTag={props.toggleWebsiteTag}
      />
    </div>
  );
};
