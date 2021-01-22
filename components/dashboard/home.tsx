import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import useComponentSize from '@rehooks/component-size';
import React, { useRef } from 'react';
import { MOBILE_WIDTH } from '../../pages/dashboard';
import DocumentRow from '../documents/document-row';
import MeetingRow from '../meeting/meeting-row';
import expandStyles from '../shared/expand-styles';
import panelStyles from '../shared/panel-styles';
import { IStore } from '../store/use-store';
import Timeline from '../timeline/timeline';
import { DocumentsForToday } from './documents';
import { PeopleToday } from './people';

const Home = (props: IStore) => {
  const ref = useRef(null);
  const size = useComponentSize(ref);
  const classes = panelStyles();
  const expandClasses = expandStyles();
  const currentTime = new Date();
  const meetings = props.timeDataStore
    .getSegmentsForDay(currentTime)
    .sort((a, b) => (a.start < b.start ? -1 : 1));
  const recentlyEditedDocuments = props.documentDataStore
    .getDocsRecentlyEditedByCurrentUser(props.driveActivityStore, props.personDataStore)
    .slice(0, 10);
  return (
    <div className={classes.panel} ref={ref}>
      {size.width > MOBILE_WIDTH && <Timeline width={size.width} height={400} {...props} />}
      <br />
      <Grid container className={classes.homeRow}>
        <Grid item xs={12} sm={3}>
          <Typography variant="h6" className={expandClasses.smallHeading}>
            Today&apos;s schedule
          </Typography>
          <Divider />
          {meetings.map((meeting) => (
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
        <Grid item xs={12} sm={3}>
          <Typography variant="h6" className={expandClasses.smallHeading}>
            People you are meeting with today
          </Typography>
          <Divider />
          <PeopleToday {...props} selectedPersonId={null} noLeftMargin={true} />
        </Grid>
        <Grid item xs={12} sm={3}>
          <Typography variant="h6" className={expandClasses.smallHeading}>
            Documents you may need today
          </Typography>
          <Divider />
          <DocumentsForToday {...props} selectedDocumentId={null} isSmall={true} />
        </Grid>
        <Grid item xs={12} sm={3}>
          <Typography variant="h6" className={expandClasses.smallHeading}>
            Documents you recently edited
          </Typography>
          <Divider />
          {recentlyEditedDocuments.map((doc) => (
            <DocumentRow
              store={props}
              key={doc.id}
              doc={doc}
              selectedDocumentId={null}
              isSmall={true}
            />
          ))}
        </Grid>
      </Grid>
    </div>
  );
};

export default Home;
