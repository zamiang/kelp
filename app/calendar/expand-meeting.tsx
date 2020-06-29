import { Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';
import DocDataStore from '../store/doc-store';
import DriveActivityDataStore from '../store/drive-activity-store';
import EmailDataStore from '../store/email-store';
import PersonDataStore from '../store/person-store';
import { ISegment } from '../store/time-store';
import DriveActivityList from './drive-activity';
import EmailsForSegment from './emails';
import PeopleList from './people-list';

const useStyles = makeStyles((theme) => ({
  // todo move into theme
  container: {
    padding: theme.spacing(5),
    margin: 0,
    width: 'auto',
  },
  heading: {
    borderBottom: `2px solid ${theme.palette.secondary.main}`,
    marginBottom: 15,
    display: 'inline-block',
  },
  smallHeading: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(1),
    fontSize: theme.typography.body2.fontSize,
    textTransform: 'uppercase',
  },
}));

const ExpandedMeeting = (props: {
  meeting: ISegment;
  personStore: PersonDataStore;
  docStore: DocDataStore;
  driveActivityStore: DriveActivityDataStore;
  emailStore: EmailDataStore;
  handlePersonClick: (email: string) => void;
}) => {
  const classes = useStyles();
  const people = (props.meeting.attendees || [])
    .filter((person) => person.email)
    .map((person) => props.personStore.getPersonByEmail(person.email!));
  const hasPeople = people.length > 0;
  const hasEmails = props.meeting.emailIds.length > 0;
  const hasDescription = props.meeting.description && props.meeting.description.length > 0;
  const hasDriveActivity = props.meeting.driveActivityIds.length > 0;
  return (
    <div className={classes.container}>
      <Typography variant="h3" color="textPrimary" gutterBottom>
        {props.meeting.summary || '(no title)'}
      </Typography>
      <Grid container spacing={6}>
        <Grid item xs={8}>
          {hasDescription && <Typography variant="body2">{props.meeting.description!}</Typography>}
          {hasEmails && (
            <React.Fragment>
              <Typography variant="h6" className={classes.smallHeading}>
                Emails
              </Typography>
              <EmailsForSegment
                segment={props.meeting}
                emailStore={props.emailStore}
                personStore={props.personStore}
                handlePersonClick={props.handlePersonClick}
              />
            </React.Fragment>
          )}
          {hasDriveActivity && (
            <React.Fragment>
              <Typography variant="h6" className={classes.smallHeading}>
                Active Documents
              </Typography>
              <DriveActivityList
                driveActivityIds={props.meeting.driveActivityIds}
                driveActivityStore={props.driveActivityStore}
                docStore={props.docStore}
                personStore={props.personStore}
              />
            </React.Fragment>
          )}
        </Grid>
        {hasPeople && (
          <Grid item xs={4}>
            <Typography variant="h6" className={classes.heading}>
              Guests
            </Typography>
            <PeopleList people={people} handlePersonClick={props.handlePersonClick} />
          </Grid>
        )}
      </Grid>
    </div>
  );
};

export default ExpandedMeeting;
