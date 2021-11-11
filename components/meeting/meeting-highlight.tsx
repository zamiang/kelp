import { styled } from '@mui/material/styles';
import { setHours, setMinutes, subDays, subMinutes } from 'date-fns';
import { Dictionary, flatten } from 'lodash';
import React, { useEffect, useState } from 'react';
import { ISegment, IWebsiteTag } from '../store/data-types';
import { IStore } from '../store/use-store';
import { IWebsiteCache } from '../website/get-featured-websites';
import { FeaturedMeeting } from './featured-meeting';

const PREFIX = 'MeetingHighlight';

const classes = {
  highlight: `${PREFIX}-highlight`,
};

const Root = styled('div')(({ theme }) => ({
  [`&.${classes.highlight}`]: {
    marginBottom: theme.spacing(4),
  },
}));

export const MeetingHighlight = (props: {
  store: IStore;
  toggleWebsiteTag: (tag: string, websiteId: string) => Promise<void>;
  websiteTags: IWebsiteTag[];
  websiteCache: IWebsiteCache;
}) => {
  const currentTime = new Date();
  const [meetingsByDay, setMeetingsByDay] = useState<Dictionary<ISegment[]>>({});

  useEffect(() => {
    let isSubscribed = true;
    const fetchData = async () => {
      const result = await props.store.timeDataStore.getSegmentsByDay(
        subDays(setMinutes(setHours(new Date(), 0), 0), 0),
      );
      return isSubscribed && setMeetingsByDay(result);
    };
    void fetchData();
    return () => (isSubscribed = false) as any;
  }, [props.store.isLoading]);

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
    <Root className={classes.highlight}>
      <FeaturedMeeting
        store={props.store}
        meeting={featuredMeeting}
        showButton
        websiteTags={props.websiteTags}
        toggleWebsiteTag={props.toggleWebsiteTag}
        websiteCache={props.websiteCache}
      />
    </Root>
  );
};
