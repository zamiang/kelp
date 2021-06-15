import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';
import { setHours, setMinutes, subDays } from 'date-fns';
import { Dictionary, flatten } from 'lodash';
import React, { useEffect, useState } from 'react';
import { ISegment } from '../store/data-types';
import { IStore } from '../store/use-store';
import { FeaturedMeeting } from './featured-meeting';
import { LineCalendar } from './line-calendar';

const useStyles = makeStyles((theme) => ({
  highlight: {
    position: 'absolute',
    top: theme.spacing(2),
    right: theme.spacing(2),
    width: 280,
    zIndex: 10,
  },
  lineContainer: {
    borderBottom: `2px solid ${theme.palette.divider}`,
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
}));

export const MeetingHighlight = (props: { store: IStore }) => {
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
    if (!featuredMeeting && currentTime < meeting.end) {
      featuredMeeting = meeting;
    }
  });

  return (
    <div className={classes.highlight}>
      <Box
        boxShadow={1}
        borderRadius={16}
        overflow="auto"
        style={{ background: '#fff', paddingBottom: 12 }}
      >
        <div className={classes.lineContainer}>
          <LineCalendar store={props.store} />
        </div>
        {featuredMeeting && (
          <FeaturedMeeting store={props.store} meeting={featuredMeeting} showButton />
        )}
      </Box>
    </div>
  );
};
