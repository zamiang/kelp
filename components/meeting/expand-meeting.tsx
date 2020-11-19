import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { format } from 'date-fns';
import { flatten } from 'lodash';
import React from 'react';
import Linkify from 'react-linkify';
import AttendeeList from '../shared/attendee-list';
import DriveActivityList from '../shared/documents-from-drive-activity';
import AppBar from '../shared/elevate-app-bar';
import EmailsList from '../shared/emails-list';
import useExpandStyles from '../shared/expand-styles';
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

const ExpandedMeeting = (props: IStore & { meetingId: string; close: () => void }) => {
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
  const people = attendeeIds
    .map((id) => props.personDataStore.getPersonById(id)!)
    .filter((person) => !!person);
  const currentUser = props.personDataStore.getSelf();
  const documentsCurrentUserEditedWhileMeetingWithAttendees = props.personDataStore.getDriveActivityWhileMeetingWith(
    people,
    props.timeDataStore,
    props.driveActivityStore,
    currentUser && currentUser.id,
  );
  const recentEmailsFromAttendees = flatten(people.map((person) => person.emailIds));
  const driveActivityFromAttendees = flatten(
    people.map((person) => Object.values(person.driveActivity)),
  );
  const guestStats = getFormattedGuestStats(meeting.formattedAttendees);
  const isHtml = meeting.description && /<\/?[a-z][\s\S]*>/i.test(meeting.description);
  return (
    <React.Fragment>
      <AppBar externalLink={meeting.link} onClose={props.close} />
      <div className={classes.topContainer}>
        <Typography variant="h5" color="textPrimary" gutterBottom className={classes.title}>
          {meeting.summary || '(no title)'}
        </Typography>
        {format(meeting.start, 'EEEE, MMMM d')} ⋅ {format(meeting.start, 'p')} –{' '}
        {format(meeting.end, 'p')}
      </div>
      <Divider />
      <div className={classes.container}>
        <Grid container spacing={3} className={classes.content}>
          <Grid item xs={12} sm={7}>
            {hasDescription && !isHtml && (
              <Typography variant="body2" className={classes.description}>
                <Linkify>{meeting.description?.trim()}</Linkify>
              </Typography>
            )}
            {hasDescription && isHtml && (
              <Typography
                variant="body2"
                className={classes.description}
                dangerouslySetInnerHTML={{ __html: meeting.description!.trim() }}
              />
            )}
            {meeting.location && (
              <React.Fragment>
                <Typography variant="h6" className={classes.smallHeading}>
                  Location
                </Typography>
                <Typography variant="subtitle2" className={classes.overflowEllipsis}>
                  {meeting.location}
                </Typography>
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
    </React.Fragment>
  );
};

export default ExpandedMeeting;
