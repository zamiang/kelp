import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import MeetingRoomIcon from '@material-ui/icons/MeetingRoom';
import { format, isToday } from 'date-fns';
import { flatten } from 'lodash';
import React, { useState } from 'react';
import Linkify from 'react-linkify';
import { IFormattedDriveActivity } from '../fetch/fetch-drive-activity';
import AttendeeList from '../shared/attendee-list';
import useButtonStyles from '../shared/button-styles';
import DriveActivityList from '../shared/documents-from-drive-activity';
import AppBar from '../shared/elevate-app-bar';
import useExpandStyles from '../shared/expand-styles';
import { ISegment } from '../store/time-store';
import { IStore } from '../store/use-store';
import { createDocument } from './create-meeting-notes';

const createMeetingNotes = async (
  meeting: ISegment,
  documentsCurrentUserEditedWhileMeetingWithAttendees: IFormattedDriveActivity[],
  setMeetingNotesLoading: (isLoading: boolean) => void,
  personDataStore: IStore['personDataStore'],
  documentDataStore: IStore['documentDataStore'],
  refetch: () => void,
) => {
  setMeetingNotesLoading(true);
  const document = await createDocument(
    meeting,
    documentsCurrentUserEditedWhileMeetingWithAttendees,
    personDataStore,
    documentDataStore,
  );
  setMeetingNotesLoading(false);
  const emailsToInvite = meeting.formattedAttendees
    .map((a) => {
      const shouldInvite = !a.self && a.responseStatus === 'accepted';
      if (shouldInvite) {
        const person = personDataStore.getPersonById(a.personId);
        if (person && person.emailAddresses.length > 0) {
          return person.emailAddresses[0];
        }
      }
    })
    .filter(Boolean);

  const params = new URLSearchParams({
    actionButton: '1',
    userstoinvite: emailsToInvite.join(','),
  });
  const documentShareUrl = `https://docs.google.com/document/d/${document.id}?${params.toString()}`;
  window.open(documentShareUrl, '_blank');
  refetch();
};

const ExpandedMeeting = (
  props: IStore & { meetingId: string; close: () => void; hideHeader?: boolean },
) => {
  const classes = useExpandStyles();
  const buttonClasses = useButtonStyles();
  const [isMeetingNotesLoading, setMeetingNotesLoading] = useState<boolean>(false);
  const meeting = props.timeDataStore.getSegmentById(props.meetingId);
  if (!meeting) {
    return null;
  }
  const attendees = (meeting.formattedAttendees || []).filter((person) => person.personId);
  const hasAttendees = attendees.length > 0;
  const hasDescription = meeting.description && meeting.description.length > 0;
  const shouldShowMeetingLink = !!meeting.hangoutLink && isToday(meeting.start);
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
  const meetingNotesLink = '';
  const hasMeetingNotes = !!meetingNotesLink;
  return (
    <React.Fragment>
      {!props.hideHeader && <AppBar externalLink={meeting.link} onClose={props.close} />}
      <div className={classes.topContainer}>
        <Typography variant="h5" color="textPrimary" gutterBottom className={classes.title}>
          {meeting.summary || '(no title)'}
        </Typography>
        {format(meeting.start, 'EEEE, MMMM d')} ⋅ {format(meeting.start, 'p')} –{' '}
        {format(meeting.end, 'p')}
        <br />
        <br />
        <Grid container spacing={2}>
          <Grid item>
            <Button
              onClick={() =>
                createMeetingNotes(
                  meeting,
                  documentsCurrentUserEditedWhileMeetingWithAttendees,
                  setMeetingNotesLoading,
                  props.personDataStore,
                  props.documentDataStore,
                  props.refetch,
                )
              }
              variant="contained"
              className={buttonClasses.selected}
              startIcon={
                isMeetingNotesLoading ? (
                  <CircularProgress size={20} color={'paper' as any} />
                ) : (
                  <InsertDriveFileIcon />
                )
              }
              disabled={isMeetingNotesLoading}
              disableElevation
            >
              Create Smart Meeting Notes
            </Button>
          </Grid>
          {hasMeetingNotes && (
            <Grid item>
              <Button
                onClick={async () => {
                  window.open(meetingNotesLink, '_blank');
                }}
                variant="contained"
                className={buttonClasses.selected}
                startIcon={<InsertDriveFileIcon />}
                disableElevation
              >
                View Meeting Notes
              </Button>
            </Grid>
          )}
          {shouldShowMeetingLink && (
            <Grid item>
              <Button
                onClick={() => window.open(meeting.hangoutLink, '_blank')}
                variant="contained"
                className={buttonClasses.selected}
                startIcon={<MeetingRoomIcon />}
                disableElevation
              >
                Join with Google Meet
              </Button>
            </Grid>
          )}
        </Grid>
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
        <Typography variant="h6" className={classes.smallHeading}>
          Documents you may need
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
            <AttendeeList
              personStore={props.personDataStore}
              attendees={attendees}
              showAll={false}
            />
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
        <Typography variant="h6" className={classes.smallHeading}>
          Did you mean to invite
        </Typography>
        <AttendeeList personStore={props.personDataStore} attendees={attendees} showAll={false} />
      </div>
    </React.Fragment>
  );
};

export default ExpandedMeeting;
