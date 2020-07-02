import { Grid, Link, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { format } from 'date-fns';
import React from 'react';
import DriveActivityList from '../shared/drive-activity';
import EmailsForSegment from '../shared/emails';
import PeopleList from '../shared/people-list';
import DocDataStore from '../store/doc-store';
import DriveActivityDataStore from '../store/drive-activity-store';
import EmailDataStore from '../store/email-store';
import PersonDataStore from '../store/person-store';
import { ISegment } from '../store/time-store';

const useStyles = makeStyles((theme) => ({
  // todo move into theme
  container: {
    padding: theme.spacing(5),
    margin: 0,
    width: 'auto',
  },
  heading: {
    borderBottom: `2px solid ${theme.palette.secondary.main}`,
    marginBottom: theme.spacing(2),
    display: 'inline-block',
    marginLeft: theme.spacing(1),
  },
  smallHeading: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(1),
    fontSize: theme.typography.body2.fontSize,
    textTransform: 'uppercase',
  },
  content: {
    marginTop: theme.spacing(1),
  },
}));

const ExpandedMeeting = (props: {
  meeting: ISegment;
  personStore: PersonDataStore;
  docStore: DocDataStore;
  driveActivityStore: DriveActivityDataStore;
  emailStore: EmailDataStore;
  handlePersonClick: (email?: string) => void;
}) => {
  const classes = useStyles();
  const people = (props.meeting.attendees || []).filter((person) => person.email);
  const hasPeople = people.length > 0;
  const hasEmails = props.meeting.emailIds.length > 0;
  const hasDescription = props.meeting.description && props.meeting.description.length > 0;
  const hasDriveActivity = props.meeting.driveActivityIds.length > 0;
  return (
    <div className={classes.container}>
      {props.meeting.link && (
        <Link color="secondary" target="_blank" href={props.meeting.link}>
          See in Google Calendar
        </Link>
      )}
      <Typography variant="h3" color="textPrimary" gutterBottom>
        {props.meeting.summary || '(no title)'}
      </Typography>
      <Typography variant="subtitle2" gutterBottom>
        <i>
          {format(props.meeting.start, 'EEEE, MMMM d')} ⋅ {format(props.meeting.start, 'p')}
          {' – '}
          {format(props.meeting.end, 'p')}
        </i>
      </Typography>
      <Grid container spacing={3} className={classes.content}>
        <Grid item xs={7}>
          {hasDescription && (
            <Typography
              variant="body2"
              style={{ wordWrap: 'break-word' }}
              dangerouslySetInnerHTML={{ __html: props.meeting.description! }}
            />
          )}
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
          <Grid item xs={5}>
            <Typography variant="h6" className={classes.heading}>
              Guests
            </Typography>
            <PeopleList
              personStore={props.personStore}
              attendees={people}
              handlePersonClick={props.handlePersonClick}
            />
          </Grid>
        )}
      </Grid>
    </div>
  );
};

export default ExpandedMeeting;
