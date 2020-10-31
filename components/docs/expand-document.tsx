import Grid from '@material-ui/core/Grid';
import MuiLink from '@material-ui/core/Link';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
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
  const activity = props.driveActivityStore.getDriveActivityForDocument(document.link || '') || [];
  const people = uniqBy(activity, 'actorPersonId')
    .filter((activity) => !!activity.actorPersonId)
    .map((activity) => props.personDataStore.getPersonById(activity.actorPersonId!))
    .filter((person) => person && person.id) as IPerson[];
  const driveActivityIds = activity.map((item) => item.id);
  const meetings = props.timeDataStore.getSegmentsForDriveActivity(driveActivityIds);
  return (
    <div className={classes.container}>
      <Typography variant="h4" color="textPrimary" gutterBottom noWrap className={classes.title}>
        {document.name || '(no title)'}
      </Typography>
      <List dense={true} className={classes.inlineList} disablePadding={true}>
        {document.link && (
          <MuiLink target="_blank" rel="noreferrer" href={document.link}>
            <ListItem button={true}>
              <ListItemIcon>
                <InsertDriveFileIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Google Drive" />
            </ListItem>
          </MuiLink>
        )}
      </List>
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
          {document.updatedAt && (
            <React.Fragment>
              <Typography variant="h6" className={classes.smallHeading}>
                Last Edited
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
                Participants
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
