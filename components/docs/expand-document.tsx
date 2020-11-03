import Grid from '@material-ui/core/Grid';
import MuiLink from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import { format } from 'date-fns';
import { uniqBy } from 'lodash';
import React from 'react';
import DriveActivity from '../shared/drive-activity';
import useExpandStyles from '../shared/expand-styles';
import MeetingList from '../shared/meeting-list';
import PersonList from '../shared/person-list';
import { IPerson } from '../store/person-store';
import { IStore } from '../store/use-store';

const ExpandedDocument = (props: IStore & { documentId: string }) => {
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
    <div className={classes.container}>
      <Typography variant="h5" color="textPrimary" gutterBottom>
        {document.name || '(no title)'}
      </Typography>
      <Grid container spacing={3} className={classes.content}>
        <Grid item sm={7}>
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
        </Grid>
        <Grid item sm={5}>
          {document.link && (
            <MuiLink href={document.link} target="_blank" className={classes.link}>
              Google Docs{' '}
              <sub>
                <ExitToAppIcon fontSize="small" />
              </sub>
            </MuiLink>
          )}
          {document.updatedAt && (
            <React.Fragment>
              <Typography variant="h6" className={classes.smallHeading}>
                Last Modified
              </Typography>
              <div>{format(document.updatedAt, 'EEEE, MMMM d p')}</div>
            </React.Fragment>
          )}
          {document.viewedByMeAt && (
            <React.Fragment>
              <Typography variant="h6" className={classes.smallHeading}>
                You Last Viewed
              </Typography>
              <div>{format(document.viewedByMeAt, 'EEEE, MMMM d p')}</div>
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
  );
};

export default ExpandedDocument;
