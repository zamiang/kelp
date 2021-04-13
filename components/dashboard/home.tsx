import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import React, { useEffect, useState } from 'react';
import MeetingRow from '../meeting/meeting-row';
import panelStyles from '../shared/panel-styles';
import { ISegment } from '../store/data-types';
import { IStore } from '../store/use-store';
import { DocumentsForToday } from './documents';
import { PeopleToday } from './people';

const Home = (props: { store: IStore }) => {
  const classes = panelStyles();
  const currentTime = new Date();
  const [segments, setSegments] = useState<ISegment[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await props.store.timeDataStore.getSegmentsForDay(currentTime);
      setSegments(result.sort((a, b) => (a.start < b.start ? -1 : 1)));
    };
    void fetchData();
  }, [props.isLoading, props.lastUpdated]);

  return (
    <div className={classes.panel}>
      <Typography variant="h6">Today&apos;s schedule</Typography>
      {segments.map((meeting) => (
        <MeetingRow
          isSmall={true}
          key={meeting.id}
          meeting={meeting}
          selectedMeetingId={null}
          store={props.store}
          shouldRenderCurrentTime={false}
        />
      ))}
      <Divider />
      <Typography variant="h6">People you are meeting with today</Typography>
      <PeopleToday store={props.store} selectedPersonId={null} isSmall />
      <Divider />
      <Typography variant="h6">Documents you may need today</Typography>
      <DocumentsForToday store={props.store} selectedDocumentId={null} isSmall={true} />
    </div>
  );
};

export default Home;
