import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import React, { useEffect, useState } from 'react';
import MeetingRow from '../meeting/meeting-row';
import panelStyles from '../shared/panel-styles';
import { ISegment } from '../store/data-types';
import { IStore } from '../store/use-store';
import BarChart from '../timeline/bar-chart';
import { DocumentsForToday } from './documents';
import { PeopleToday } from './people';

const Home = (props: IStore) => {
  const classes = panelStyles();
  const currentTime = new Date();
  const [segments, setSegments] = useState<ISegment[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await props.timeDataStore.getSegmentsForDay(currentTime);
      setSegments(result.sort((a, b) => (a.start < b.start ? -1 : 1)));
    };
    void fetchData();
  }, [props.isLoading, props.lastUpdated]);

  return (
    <div className={classes.panel}>
      <div>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <BarChart type="meetings" {...props} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <BarChart type="people" {...props} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <BarChart type="documents" {...props} />
          </Grid>
        </Grid>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6">Today&apos;s schedule</Typography>
            <Divider />
            {segments.map((meeting) => (
              <MeetingRow
                isSmall={true}
                key={meeting.id}
                meeting={meeting}
                selectedMeetingId={null}
                store={props}
                shouldRenderCurrentTime={false}
              />
            ))}
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6">People you are meeting with today</Typography>
            <Divider />
            <PeopleToday store={props} selectedPersonId={null} isSmall />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6">Documents you may need today</Typography>
            <Divider />
            <DocumentsForToday store={props} selectedDocumentId={null} isSmall={true} />
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

export default Home;
