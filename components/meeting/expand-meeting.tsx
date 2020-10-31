import Grid from '@material-ui/core/Grid';
import MuiLink from '@material-ui/core/Link';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';
import { format } from 'date-fns';
import { flatten } from 'lodash';
import React from 'react';
import Linkify from 'react-linkify';
import AttendeeList from '../shared/attendee-list';
import DriveActivityList from '../shared/documents-from-drive-activity';
import EmailsList from '../shared/emails-list';
import useExpandStyles from '../shared/expand-styles';
import { IPerson } from '../store/person-store';
import { IFormattedAttendee } from '../store/time-store';
import { IStore } from '../store/use-store';

const guestStatsHash = {
  needsAction: 'awaiting response',
  declined: 'no',
  tentative: 'maybe',
  accepted: 'yes',
  notAttending: 'no',
} as any;

const getFormattedGuestStats = (attendees: IFormattedAttendee[]) => {
  if (attendees.length < 2) {
    return null;
  }
  const guestStats = {
    accepted: 0,
    tentative: 0,
    needsAction: 0,
    declined: 0,
    notAttending: 0,
  } as any;
  attendees.map((attendee) => attendee.responseStatus && guestStats[attendee.responseStatus]++);

  return Object.keys(guestStats)
    .map((key) => {
      if (guestStats[key]) {
        // eslint-disable-next-line
        return `${guestStats[key as any]} ${guestStatsHash[key]}`;
      }
      return false;
    })
    .filter((text) => !!text)
    .join(', ');
};

const ExpandedMeeting = (props: IStore & { meetingId: string }) => {
  const classes = useExpandStyles();
  const meeting = props.timeDataStore.getSegmentById(props.meetingId);
  if (!meeting) {
    return null;
  }
  const attendees = (meeting.formattedAttendees || []).filter((person) => person.personId);
  const hasAttendees = attendees.length > 0;
  const hasEmails = meeting.emailIds.length > 0;
  const hasDescription = meeting.description && meeting.description.length > 0;
  const hasDriveActivity = meeting.driveActivityIds.length > 0;
  const meetingDriveActivity = meeting.driveActivityIds.map(
    (id) => props.driveActivityStore.getById(id)!,
  );
  const attendeeIds = (meeting.formattedAttendees || [])
    .filter((attendee) => !attendee.self)
    .map((attendee) => attendee.personId);

  // TODO: figure out filter types
  const people: IPerson[] = attendeeIds
    .map((id) => props.personDataStore.getPersonById(id))
    .filter((person) => !!person) as any;
  const documentsCurrentUserEditedWhileMeetingWithAttendees = flatten(
    people.map((person) => {
      const segmentIds = person.segmentIds;
      const segments = segmentIds.map(
        (id) => props.timeDataStore.getSegmentById(id)!.driveActivityIds,
      );
      return flatten(segments);
    }),
  ).map((id) => props.driveActivityStore.getById(id)!);
  const recentEmailsFromAttendees = flatten(people.map((person) => person.emailIds));
  const driveActivityFromAttendees = flatten(
    people.map((person) => Object.values(person.driveActivity)),
  );
  const guestStats = getFormattedGuestStats(meeting.formattedAttendees);
  return (
    <div className={classes.container}>
      <Typography variant="h4" color="textPrimary">
        {meeting.summary || '(no title)'}
      </Typography>
      <List dense={true} disablePadding={true}>
        <ListItem disableGutters={true}>
          <ListItemText
            primary={`${format(meeting.start, 'EEEE, MMMM d')} ⋅ ${format(
              meeting.start,
              'p',
            )} – ${format(meeting.end, 'p')}`}
          />
        </ListItem>
      </List>
      <Grid container spacing={3} className={classes.content}>
        <Grid item sm={7}>
          {hasDescription && (
            <Typography variant="body2" className={classes.description}>
              <Linkify>{meeting.description}</Linkify>
            </Typography>
          )}
          {meeting.location && (
            <React.Fragment>
              <Typography variant="h6" className={classes.smallHeading}>
                Location
              </Typography>
              <Typography variant="subtitle2">{meeting.location}</Typography>
            </React.Fragment>
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
                driveActivity={meetingDriveActivity}
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
                driveActivity={documentsCurrentUserEditedWhileMeetingWithAttendees}
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
                driveActivity={driveActivityFromAttendees}
                docStore={props.docDataStore}
                personStore={props.personDataStore}
              />
            </React.Fragment>
          )}
        </Grid>
        <Grid item sm={5}>
          {meeting.link && (
            <MuiLink href={meeting.link} target="_blank" className={classes.link}>
              <ListItem disableGutters={true}>
                <ListItemIcon>
                  <CalendarTodayIcon />
                </ListItemIcon>
                <ListItemText primary="Google Calendar" />
              </ListItem>
            </MuiLink>
          )}
          {hasAttendees && (
            <React.Fragment>
              <Typography variant="h6" className={classes.smallHeading}>
                Guests
              </Typography>
              <Typography variant="caption" className={classes.smallCaption}>
                {guestStats}
              </Typography>
              <br />
              <AttendeeList personStore={props.personDataStore} attendees={attendees} />
            </React.Fragment>
          )}
        </Grid>
      </Grid>
    </div>
  );
};

export default ExpandedMeeting;
