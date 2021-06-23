import Grid from '@material-ui/core/Grid';
import React, { useEffect, useState } from 'react';
import { ISegment } from '../store/data-types';
import { IStore } from '../store/use-store';
import { IFeaturedWebsite, getWebsitesForMeeting } from '../website/get-featured-websites';
import { LargeWebsite } from '../website/large-website';
import { RightArrow } from '../website/right-arrow';

const maxResult = 3;
const maxDisplay = maxResult * 10;

const MeetingRowBelow = (props: {
  meeting: ISegment;
  store: IStore;
  shouldPadLeft: boolean;
  hideWebsite: (item: IFeaturedWebsite) => void;
  hideDialogUrl?: string;
}) => {
  const [websites, setWebsites] = useState<IFeaturedWebsite[]>([]);
  const [shouldShowAll, setShouldShowAll] = useState(false);
  const [extraItemsCount, setExtraItemsCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const result = await getWebsitesForMeeting(props.meeting, props.store);

      const extraResultLength = result.length - maxResult;
      setExtraItemsCount(extraResultLength > maxDisplay ? maxDisplay : extraResultLength);
      if (shouldShowAll) {
        setWebsites(result.slice(0, maxResult * 10));
      } else {
        setWebsites(result.slice(0, maxResult));
      }
    };
    void fetchData();
  }, [props.store.isLoading, props.meeting.id, props.hideDialogUrl, shouldShowAll]);

  if (websites.length < 1) {
    return null;
  }

  return (
    <React.Fragment>
      <Grid item xs={12}>
        <Grid container spacing={4}>
          {websites.map((item) => (
            <LargeWebsite
              key={item.websiteId}
              item={item}
              store={props.store}
              hideItem={props.hideWebsite}
              smGridSize={4}
            />
          ))}
        </Grid>
      </Grid>
      {extraItemsCount > 0 && (
        <RightArrow
          isEnabled={shouldShowAll}
          count={extraItemsCount}
          onClick={() => {
            setShouldShowAll(!shouldShowAll);
          }}
        />
      )}
    </React.Fragment>
  );
};

export default MeetingRowBelow;
