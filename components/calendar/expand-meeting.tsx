import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { format } from 'date-fns';
import { flatten } from 'lodash';
import React from 'react';
import { IProps } from '../dashboard/container';
import AttendeeList from '../shared/attendee-list';
import DriveActivityList from '../shared/drive-activity';
import EmailsList from '../shared/emails-list';

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

const ExpandedMeeting = (props: IProps & { meetingId: string }) => {
  const classes = useStyles();
  const meeting = props.timeDataStore.getSegmentById(props.meetingId);
  if (!meeting) {
    return null;
  }
  const attendees = (meeting.formattedAttendees || []).filter((person) => person.personId);
  const hasAttendees = attendees.length > 0;
  const hasEmails = meeting.emailIds.length > 0;
  const hasDescription = meeting.description && meeting.description.length > 0;
  const hasDriveActivity = meeting.driveActivityIds.length > 0;
  const attendeeIds = (meeting.formattedAttendees || [])
    .filter((attendee) => !attendee.self)
    .map((attendee) => attendee.personId);
  const people = attendeeIds
    .map((id) => props.personDataStore.getPersonById(id))
    .filter((person) => !!person);
  const documentsCurrentUserEditedWhileMeetingWithAttendees = flatten(
    people.map((person) => {
      const segmentIds = person!.segmentIds;
      const segments = segmentIds.map(
        (id) => props.timeDataStore.getSegmentById(id)!.driveActivityIds,
      );
      return flatten(segments);
    }),
  );
  const recentEmailsFromAttendees = flatten(people.map((person) => person!.emailIds));
  const driveActivityFromAttendees = flatten(people.map((person) => person!.driveActivityIds));
  return (
    <div className={classes.container}>
      {meeting.link && (
        <Link color="secondary" target="_blank" href={meeting.link}>
          See in Google Calendar
        </Link>
      )}
      <Typography variant="h3" color="textPrimary" gutterBottom>
        {meeting.summary || '(no title)'}
      </Typography>
      <Typography variant="subtitle2" gutterBottom>
        <i>
          {format(meeting.start, 'EEEE, MMMM d')} ⋅ {format(meeting.start, 'p')}
          {' – '}
          {format(meeting.end, 'p')}
        </i>
      </Typography>
      <Grid container spacing={3} className={classes.content}>
        <Grid item xs={7}>
          {hasDescription && (
            <Typography
              variant="body2"
              style={{ wordWrap: 'break-word' }}
              dangerouslySetInnerHTML={{ __html: meeting.description! }}
            />
          )}
          {hasEmails && (
            <React.Fragment>
              <Typography variant="h6" className={classes.smallHeading}>
                Emails Sent or received during the meeting
              </Typography>
              <EmailsList
                emailIds={meeting.emailIds}
                emailStore={props.emailDataStore}
                personStore={props.personDataStore}
              />
            </React.Fragment>
          )}
          {hasDriveActivity && (
            <React.Fragment>
              <Typography variant="h6" className={classes.smallHeading}>
                Documents with activity during this meeting
              </Typography>
              <DriveActivityList
                driveActivityIds={meeting.driveActivityIds}
                driveActivityStore={props.driveActivityStore}
                docStore={props.docDataStore}
                personStore={props.personDataStore}
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
                docStore={props.docDataStore}
                personStore={props.personDataStore}
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
                emailStore={props.emailDataStore}
                personStore={props.personDataStore}
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
                docStore={props.docDataStore}
                personStore={props.personDataStore}
              />
            </React.Fragment>
          )}
        </Grid>
        {hasAttendees && (
          <Grid item xs={5}>
            <Typography variant="h6" className={classes.heading}>
              Guests
            </Typography>
            <AttendeeList personStore={props.personDataStore} attendees={attendees} />
          </Grid>
        )}
      </Grid>
    </div>
  );
};

export default ExpandedMeeting;
