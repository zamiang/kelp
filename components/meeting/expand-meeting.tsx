import Grid from '@material-ui/core/Grid';
import MuiLink from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import { format } from 'date-fns';
import { flatten } from 'lodash';
import React from 'react';
import AttendeeList from '../shared/attendee-list';
import DriveActivityList from '../shared/drive-activity';
import EmailsList from '../shared/emails-list';
import useExpandStyles from '../shared/expand-styles';
import { IPerson } from '../store/person-store';
import { IStore } from '../store/use-store';

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

  // TODO: Improve creator/organizer logic
  const shouldShowCreator = meeting.creator ? true : false;
  const shouldShowOrganizer = meeting.organizer ? true : false;
  const organizer = meeting.formattedOrganizer;
  const creator = meeting.formattedCreator;
  return (
    <div className={classes.container}>
      {meeting.link && (
        <MuiLink className={classes.link} target="_blank" href={meeting.link}>
          See in Google Calendar
        </MuiLink>
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
        <Grid item sm={7}>
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
          {shouldShowOrganizer && organizer && (
            <React.Fragment>
              <Typography variant="h6" className={classes.smallHeading}>
                Organizer
              </Typography>
              <AttendeeList personStore={props.personDataStore} attendees={[organizer]} />
            </React.Fragment>
          )}
          {shouldShowCreator && creator && (
            <React.Fragment>
              <Typography variant="h6" className={classes.smallHeading}>
                Creator
              </Typography>
              <AttendeeList personStore={props.personDataStore} attendees={[creator]} />
            </React.Fragment>
          )}
          {hasAttendees && (
            <React.Fragment>
              <Typography variant="h6" className={classes.smallHeading}>
                Guests
              </Typography>
              <AttendeeList personStore={props.personDataStore} attendees={attendees} />
            </React.Fragment>
          )}
        </Grid>
      </Grid>
    </div>
  );
};

export default ExpandedMeeting;
