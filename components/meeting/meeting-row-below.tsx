import Grid from '@material-ui/core/Grid';
import React, { useEffect, useState } from 'react';
import { ISegment } from '../store/data-types';
import { IStore } from '../store/use-store';
import { IFeaturedWebsite, getWebsitesForMeeting } from '../website/get-featured-websites';
import { LargeWebsite } from '../website/large-website';

const maxNumberOfWebsites = 6;

const MeetingRowBelow = (props: {
  meeting: ISegment;
  store: IStore;
  shouldPadLeft: boolean;
  hideWebsite: (item: IFeaturedWebsite) => void;
  hideDialogUrl?: string;
}) => {
  const [websites, setWebsites] = useState<IFeaturedWebsite[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await getWebsitesForMeeting(props.meeting, props.store);
      setWebsites(result.slice(0, maxNumberOfWebsites));
    };
    void fetchData();
  }, [props.store.isLoading, props.meeting.id, props.hideDialogUrl]);

  return (
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
  );
};

export default MeetingRowBelow;
