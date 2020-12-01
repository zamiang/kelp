import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import { format, isPast } from 'date-fns';
import { flatten } from 'lodash';
import React from 'react';
import Linkify from 'react-linkify';
import AttendeeList from '../shared/attendee-list';
import DriveActivityList from '../shared/documents-from-drive-activity';
import AppBar from '../shared/elevate-app-bar';
import useExpandStyles from '../shared/expand-styles';
import { IStore } from '../store/use-store';

const ExpandedMeeting = (props: IStore & { meetingId: string; close: () => void }) => {
  const classes = useExpandStyles();
  const meeting = props.timeDataStore.getSegmentById(props.meetingId);
  if (!meeting) {
    return null;
  }
  const isInPast = isPast(meeting.start);
  const attendees = (meeting.formattedAttendees || []).filter((person) => person.personId);
  const hasAttendees = attendees.length > 0;
  const hasDescription = meeting.description && meeting.description.length > 0;
  const attendeeAndCurrentUserDriveActivity = meeting.driveActivityIds
    .concat(meeting.currentUserDriveActivityIds)
    .map((id) => props.driveActivityStore.getById(id)!);
  const attendeeIds = (meeting.formattedAttendees || [])
    .filter((attendee) => !attendee.self)
    .map((attendee) => attendee.personId);

  const people = attendeeIds
    .map((id) => props.personDataStore.getPersonById(id)!)
    .filter((person) => !!person);
  const documentsCurrentUserEditedWhileMeetingWithAttendees = props.personDataStore.getDriveActivityWhileMeetingWith(
    people,
    props.timeDataStore,
    props.driveActivityStore,
  );
  const driveActivityFromAttendees = flatten(
    people.map((person) => Object.values(person.driveActivity)),
  );
  const guestStats = props.timeDataStore.getFormattedGuestStats(meeting);
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
        {isInPast && (
          <React.Fragment>
            <Typography variant="h6" className={classes.smallHeading}>
              Documents with activity by the attendees during this meeting
            </Typography>
            <DriveActivityList
              driveActivity={attendeeAndCurrentUserDriveActivity}
              docStore={props.documentDataStore}
              personStore={props.personDataStore}
            />
          </React.Fragment>
        )}
        <Typography variant="h6" className={classes.smallHeading}>
          Documents edited by you when with the attendees
        </Typography>
        <DriveActivityList
          driveActivity={documentsCurrentUserEditedWhileMeetingWithAttendees}
          docStore={props.documentDataStore}
          personStore={props.personDataStore}
        />
        <Typography variant="h6" className={classes.smallHeading}>
          Documents edited during previous meetings with the attendees
        </Typography>
        <DriveActivityList
          driveActivity={driveActivityFromAttendees}
          docStore={props.documentDataStore}
          personStore={props.personDataStore}
        />
        {hasAttendees && (
          <React.Fragment>
            <Typography variant="h6" className={classes.smallHeading}>
              Guests
            </Typography>
            <Typography variant="caption" className={classes.smallCaption}>
              {guestStats}
            </Typography>
            <AttendeeList personStore={props.personDataStore} attendees={attendees} />
          </React.Fragment>
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
      </div>
    </React.Fragment>
  );
};

export default ExpandedMeeting;
