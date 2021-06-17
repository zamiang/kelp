import { makeStyles } from '@material-ui/core/styles';
import { setHours, setMinutes, subDays } from 'date-fns';
import { Dictionary, flatten } from 'lodash';
import React, { useEffect, useState } from 'react';
import { ISegment } from '../store/data-types';
import { IStore } from '../store/use-store';
import { IFeaturedWebsite } from '../website/get-featured-websites';
import { FeaturedMeeting } from './featured-meeting';

const useStyles = makeStyles(() => ({
  highlight: {},
}));

export const MeetingHighlight = (props: {
  store: IStore;
  hideWebsite: (item: IFeaturedWebsite) => void;
  hideDialogUrl?: string;
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
  }, [props.store.lastUpdated, props.store.isLoading, props.hideDialogUrl]);

  let featuredMeeting: ISegment | undefined;
  // Assumes meetings are already sorted
  flatten(Object.values(meetingsByDay)).forEach((meeting) => {
    if (!featuredMeeting && currentTime < meeting.end) {
      featuredMeeting = meeting;
    }
  });

  return (
    <div className={classes.highlight}>
      {featuredMeeting && (
        <FeaturedMeeting
          store={props.store}
          meeting={featuredMeeting}
          showButton
          hideWebsite={props.hideWebsite}
          hideDialogUrl={props.hideDialogUrl}
        />
      )}
    </div>
  );
};
