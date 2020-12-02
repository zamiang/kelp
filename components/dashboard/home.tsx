import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import React from 'react';
import DocumentRow from '../documents/document-row';
import MeetingRow from '../meeting/meeting-row';
import expandStyles from '../shared/expand-styles';
import panelStyles from '../shared/panel-styles';
import TopBar from '../shared/top-bar';
import { IStore } from '../store/use-store';
import { DocumentsForToday } from './documents';
import { PeopleToday } from './people';

const Home = (props: IStore) => {
  const classes = panelStyles();
  const expandClasses = expandStyles();
  const currentTitle = 'Dashboard';
  const currentTime = new Date();
  const meetings = props.timeDataStore
    .getSegmentsForDay(currentTime)
    .sort((a, b) => (a.start < b.start ? -1 : 1));
  const recentlyEditedDocuments = props.documentDataStore
    .getDocsRecentlyEditedByCurrentUser(props.driveActivityStore, props.personDataStore)
    .slice(0, 10);
  return (
    <div className={classes.panel}>
      <TopBar title={currentTitle} />
      <br />
      <Grid container className={classes.row}>
        <Grid item sm={3}>
          <Typography variant="h6" className={expandClasses.smallHeading}>
            Today&apos;s schedule
          </Typography>
          {meetings.map((meeting) => (
            <MeetingRow
              noLeftMargin={true}
              key={meeting.id}
              currentTime={currentTime}
              meeting={meeting}
              selectedMeetingId={null}
              store={props}
              shouldRenderCurrentTime={false}
            />
          ))}
        </Grid>
        <Grid item sm={3}>
          <Typography variant="h6" className={expandClasses.smallHeading}>
            People you are meeting with today
          </Typography>
          <PeopleToday {...props} selectedPersonId={null} noLeftMargin={true} />
        </Grid>
        <Grid item sm={3}>
          <Typography variant="h6" className={expandClasses.smallHeading}>
            Documents you may need today
          </Typography>
          <DocumentsForToday {...props} selectedDocumentId={null} isSmall={true} />
        </Grid>
        <Grid item sm={3}>
          <Typography variant="h6" className={expandClasses.smallHeading}>
            Documents you recently edited
          </Typography>
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
      <Grid container className={classes.row}>
        <Grid item sm={3}>
          <Typography variant="h6" className={expandClasses.smallHeading}>
            Meeting Netowrk
          </Typography>
        </Grid>
        <Grid item sm={3}>
          <Typography variant="h6" className={expandClasses.smallHeading}>
            Document Netowrk
          </Typography>
        </Grid>
      </Grid>
    </div>
  );
};

export default Home;
