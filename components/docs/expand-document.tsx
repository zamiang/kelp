import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { format } from 'date-fns';
import { uniqBy } from 'lodash';
import React from 'react';
import DriveActivity from '../shared/drive-activity';
import AppBar from '../shared/elevate-app-bar';
import useExpandStyles from '../shared/expand-styles';
import MeetingList from '../shared/meeting-list';
import PersonList from '../shared/person-list';
import { IPerson } from '../store/person-store';
import { IStore } from '../store/use-store';

const ExpandedDocument = (props: IStore & { documentId: string; close: () => void }) => {
  const classes = useExpandStyles();
  const document = props.docDataStore.getByLink(props.documentId);
  if (!document) {
    return null;
  }
  const activity = props.driveActivityStore.getDriveActivityForDocument(document.id) || [];
  const people = uniqBy(activity, 'actorPersonId')
    .filter((activity) => !!activity.actorPersonId)
    .map((activity) => props.personDataStore.getPersonById(activity.actorPersonId!))
    .filter((person) => person && person.id) as IPerson[];
  const driveActivityIds = activity.map((item) => item.id);
  const meetings = props.timeDataStore.getSegmentsForDriveActivity(driveActivityIds);
  return (
    <React.Fragment>
      <AppBar onClose={props.close} externalLink={document.link} />
      <div className={classes.topContainer}>
        <Typography variant="h5" color="textPrimary" gutterBottom className={classes.title}>
          {document.name || '(no title)'}
        </Typography>
        {document.updatedAt && <i>Modified: {format(document.updatedAt, 'EEEE, MMMM d p')}</i>}
      </div>
      <Divider />
      <div className={classes.container}>
        <Grid container spacing={3} className={classes.content}>
          <Grid item>
            {activity.length > 0 && (
              <React.Fragment>
                <Typography variant="h6" className={classes.smallHeading}>
                  Activity
                </Typography>
                <DriveActivity driveActivity={activity} personStore={props.personDataStore} />
              </React.Fragment>
            )}
            {meetings.length > 0 && (
              <React.Fragment>
                <Typography variant="h6" className={classes.smallHeading}>
                  Meetings
                </Typography>
                <MeetingList segments={meetings} personStore={props.personDataStore} />
              </React.Fragment>
            )}
            {people.length > 0 && (
              <React.Fragment>
                <Typography variant="h6" className={classes.smallHeading}>
                  Contributors
                </Typography>
                <PersonList personStore={props.personDataStore} people={people} />
              </React.Fragment>
            )}
          </Grid>
        </Grid>
      </div>
    </React.Fragment>
  );
};

export default ExpandedDocument;
