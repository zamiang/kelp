import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import MeetingRow from '../meeting/meeting-row';
import expandStyles from '../shared/expand-styles';
import panelStyles from '../shared/panel-styles';
import { ISegment } from '../store/models/segment-model';
import { IStore } from '../store/use-store';
import BarChart from '../timeline/bar-chart';
import { DocumentsForToday } from './documents';
import { PeopleToday } from './people';

const Home = (props: IStore) => {
  const classes = panelStyles();
  const expandClasses = expandStyles();
  const currentTime = new Date();
  const [segments, setSegments] = useState<ISegment[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await props.timeDataStore.getSegmentsForDay(props.day);
      setSegments(result.sort((a, b) => (a.start < b.start ? -1 : 1)));
    };
    void fetchData();
  }, [props.day]);

  return (
    <div className={classes.panel}>
      <Grid container className={clsx(classes.homeRow, classes.homeRowTop)} spacing={4}>
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
      <Grid container className={classes.homeRow} spacing={4}>
        <Grid item xs={12} sm={4}>
          <Typography variant="h6" className={expandClasses.smallHeading}>
            Today&apos;s schedule
          </Typography>
          <Divider />
          {segments.map((meeting) => (
            <MeetingRow
              isSmall={true}
              key={meeting.id}
              currentTime={currentTime}
              meeting={meeting}
              selectedMeetingId={null}
              store={props}
              shouldRenderCurrentTime={false}
            />
          ))}
        </Grid>
        <Grid item xs={12} sm={4}>
          <Typography variant="h6" className={expandClasses.smallHeading}>
            People you are meeting with today
          </Typography>
          <Divider />
          <PeopleToday {...props} selectedPersonId={null} noLeftMargin={true} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <Typography variant="h6" className={expandClasses.smallHeading}>
            Documents you may need today
          </Typography>
          <Divider />
          <DocumentsForToday {...props} selectedDocumentId={null} isSmall={true} />
        </Grid>
      </Grid>
    </div>
  );
};

export default Home;
