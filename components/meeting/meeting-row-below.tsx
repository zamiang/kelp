import Grid from '@material-ui/core/Grid';
import React, { useEffect, useState } from 'react';
import { ISegment } from '../store/data-types';
import { IStore } from '../store/use-store';
import { IFeaturedWebsite, getWebsitesForMeeting } from '../website/get-featured-websites';
import { LargeWebsite } from '../website/large-website';
import { RightArrow } from '../website/right-arrow';

const maxResult = 3;
const maxDisplay = maxResult * 10;

const fetchData = async (
  meeting: ISegment,
  store: IStore,
  currentFilter: string,
  shouldShowAll: boolean,
  setWebsites: (websites: IFeaturedWebsite[]) => void,
  setExtraItemsCount: (n: number) => void,
) => {
  const result = await getWebsitesForMeeting(meeting, store);

  const filtereredWebsites = result.filter((item) =>
    item && currentFilter === 'all' ? true : item.websiteId.indexOf(currentFilter) > -1,
  );

  const extraResultLength = filtereredWebsites.length - maxResult;
  setExtraItemsCount(extraResultLength > maxDisplay ? maxDisplay : extraResultLength);
  if (shouldShowAll) {
    setWebsites(filtereredWebsites.slice(0, maxResult * 10));
  } else {
    setWebsites(filtereredWebsites.slice(0, maxResult));
  }
};

const MeetingRowBelow = (props: {
  meeting: ISegment;
  store: IStore;
  hideWebsite: (item: IFeaturedWebsite) => void;
  hideDialogUrl?: string;
  currentFilter: string;
}) => {
  const [websites, setWebsites] = useState<IFeaturedWebsite[]>([]);
  const [shouldShowAll, setShouldShowAll] = useState(false);
  const [extraItemsCount, setExtraItemsCount] = useState(0);

  useEffect(() => {
    void fetchData(
      props.meeting,
      props.store,
      props.currentFilter,
      shouldShowAll,
      setWebsites,
      setExtraItemsCount,
    );
  }, [
    props.store.isLoading,
    props.meeting.id,
    props.hideDialogUrl,
    shouldShowAll,
    props.currentFilter,
  ]);

  const togglePin = async (item: IFeaturedWebsite, isPinned: boolean) => {
    if (isPinned) {
      await props.store.websitePinStore.delete(item.websiteId);
    } else {
      await props.store.websitePinStore.create(item.websiteId);
    }
    void fetchData(
      props.meeting,
      props.store,
      props.currentFilter,
      shouldShowAll,
      setWebsites,
      setExtraItemsCount,
    );
  };

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
              togglePin={togglePin}
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
