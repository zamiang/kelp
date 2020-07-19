import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { format } from 'date-fns';
import { flatten } from 'lodash';
import React from 'react';
import AttendeeList from '../shared/attendee-list';
import DriveActivityList from '../shared/drive-activity';
import EmailsList from '../shared/emails-list';
import DocDataStore from '../store/doc-store';
import DriveActivityDataStore from '../store/drive-activity-store';
import EmailDataStore from '../store/email-store';
import PersonDataStore from '../store/person-store';
import TimeStore, { ISegment } from '../store/time-store';

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
  timeStore: TimeStore;
  handlePersonClick: (email?: string) => void;
}) => {
  const classes = useStyles();
  const attendees = (props.meeting.formattedAttendees || []).filter((person) => person.personId);
  const hasAttendees = attendees.length > 0;
  const hasEmails = props.meeting.emailIds.length > 0;
  const hasDescription = props.meeting.description && props.meeting.description.length > 0;
  const hasDriveActivity = props.meeting.driveActivityIds.length > 0;
  const attendeeIds = (props.meeting.formattedAttendees || [])
    .filter((attendee) => !attendee.self)
    .map((attendee) => attendee.personId);
  const people = attendeeIds
    .map((id) => props.personStore.getPersonById(id))
    .filter((person) => !!person);
  const documentsCurrentUserEditedWhileMeetingWithAttendees = flatten(
    people.map((person) => {
      const segmentIds = person!.segmentIds;
      const segments = segmentIds.map((id) => props.timeStore.getSegmentById(id)!.driveActivityIds);
      return flatten(segments);
    }),
  );
  const recentEmailsFromAttendees = flatten(people.map((person) => person!.emailIds));
  const driveActivityFromAttendees = flatten(people.map((person) => person!.driveActivityIds));
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
                Emails Sent or received during the meeting
              </Typography>
              <EmailsList
                emailIds={props.meeting.emailIds}
                emailStore={props.emailStore}
                personStore={props.personStore}
                handlePersonClick={props.handlePersonClick}
              />
            </React.Fragment>
          )}
          {hasDriveActivity && (
            <React.Fragment>
              <Typography variant="h6" className={classes.smallHeading}>
                Documents with activity during this meeting
              </Typography>
              <DriveActivityList
                driveActivityIds={props.meeting.driveActivityIds}
                driveActivityStore={props.driveActivityStore}
                docStore={props.docStore}
                personStore={props.personStore}
              />
            </React.Fragment>
          )}
          {documentsCurrentUserEditedWhileMeetingWithAttendees.length > 0 && (
            <React.Fragment>
              <Typography variant="h6" className={classes.smallHeading}>
                Documents you edited while meeting with these attendees recently
              </Typography>
              <DriveActivityList
                driveActivityIds={documentsCurrentUserEditedWhileMeetingWithAttendees}
                driveActivityStore={props.driveActivityStore}
                docStore={props.docStore}
                personStore={props.personStore}
              />
            </React.Fragment>
          )}
          {recentEmailsFromAttendees.length > 0 && (
            <React.Fragment>
              <Typography variant="h6" className={classes.smallHeading}>
                Recent emails from people in this meeting
              </Typography>
              <EmailsList
                emailIds={recentEmailsFromAttendees}
                emailStore={props.emailStore}
                personStore={props.personStore}
                handlePersonClick={props.handlePersonClick}
              />
            </React.Fragment>
          )}
          {driveActivityFromAttendees.length > 0 && (
            <React.Fragment>
              <Typography variant="h6" className={classes.smallHeading}>
                Documents recently edited by people in this meeting
              </Typography>
              <DriveActivityList
                driveActivityIds={driveActivityFromAttendees}
                driveActivityStore={props.driveActivityStore}
                docStore={props.docStore}
                personStore={props.personStore}
              />
            </React.Fragment>
          )}
        </Grid>
        {hasAttendees && (
          <Grid item xs={5}>
            <Typography variant="h6" className={classes.heading}>
              Guests
            </Typography>
            <AttendeeList
              personStore={props.personStore}
              attendees={attendees}
              handlePersonClick={props.handlePersonClick}
            />
          </Grid>
        )}
      </Grid>
    </div>
  );
};

export default ExpandedMeeting;
