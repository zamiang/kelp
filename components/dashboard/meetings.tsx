import { differenceInCalendarDays } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { FeaturedMeeting } from '../meeting/featured-meeting';
import { LoadingSpinner } from '../shared/loading-spinner';
import panelStyles from '../shared/panel-styles';
import { ISegment, IWebsiteTag } from '../store/data-types';
import { IStore } from '../store/use-store';
import { IFeaturedWebsite } from '../website/get-featured-websites';

const DAYS_BACK = 5;
const DAYS_FORWARD = -1;

const Meetings = (props: {
  store: IStore;
  toggleWebsiteTag: (tag: string, websiteId: string) => Promise<void>;
  showWebsitePopup: (item: IFeaturedWebsite) => void;
  websiteTags: IWebsiteTag[];
  currentFilter: string;
  isDarkMode: boolean;
}) => {
  const [meetings, setMeetings] = useState<ISegment[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await props.store.timeDataStore.getSegments('asc');
      const filteredResults = result.filter((item) => {
        const difference = differenceInCalendarDays(new Date(), item.end);
        return difference < DAYS_BACK && difference > DAYS_FORWARD;
      });
      setMeetings(filteredResults);
    };
    void fetchData();
  }, [props.store.lastUpdated, props.store.isLoading]);

  const classes = panelStyles();
  const shouldRenderLoading = props.store.isMeetingsLoading;

  return (
    <div className={classes.panel}>
      {shouldRenderLoading && <LoadingSpinner />}
      {meetings.map((meeting) => (
        <FeaturedMeeting
          key={meeting.id}
          meeting={meeting}
          store={props.store}
          showLine
          currentFilter={props.currentFilter}
          isDarkMode={props.isDarkMode}
          happeningSoonLimit={60 * 4}
          websiteTags={props.websiteTags}
          toggleWebsiteTag={props.toggleWebsiteTag}
          showWebsitePopup={props.showWebsitePopup}
        />
      ))}
    </div>
  );
};

export default Meetings;
