import Grid from '@material-ui/core/Grid';
import React, { useEffect, useState } from 'react';
import { ISegment } from '../store/data-types';
import { IStore } from '../store/use-store';
import {
  IFeaturedWebsite,
  fetchWebsitesForMeetingFiltered,
} from '../website/get-featured-websites';
import { LargeWebsite } from '../website/large-website';
import { RightArrow } from '../website/right-arrow';

const MeetingRowBelow = (props: {
  meeting: ISegment;
  store: IStore;
  hideWebsite: (item: IFeaturedWebsite) => void;
  hideDialogUrl?: string;
  currentFilter: string;
  isDarkMode: boolean;
  isFullWidth: boolean;
}) => {
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
    void fetchWebsitesForMeetingFiltered(
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
    <Grid item xs={props.isFullWidth ? 12 : 11}>
      <Grid container spacing={4}>
        {websites.map((item) => (
          <LargeWebsite
            key={item.websiteId}
            item={item}
            store={props.store}
            hideItem={props.hideWebsite}
            smGridSize={4}
            togglePin={togglePin}
            isDarkMode={props.isDarkMode}
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
    </Grid>
  );
};

export default MeetingRowBelow;
