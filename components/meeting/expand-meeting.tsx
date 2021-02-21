import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import MeetingRoomIcon from '@material-ui/icons/MeetingRoom';
import { format, isToday } from 'date-fns';
import { uniq } from 'lodash';
import React, { useEffect, useState } from 'react';
import Linkify from 'react-linkify';
import { useParams } from 'react-router-dom';
import AttendeeList from '../shared/attendee-list';
import useButtonStyles from '../shared/button-styles';
import AppBar from '../shared/elevate-app-bar';
import useExpandStyles from '../shared/expand-styles';
import SegmentDocumentList from '../shared/segment-document-list';
import { getFormattedGuestStats } from '../store/helpers';
import { IFormattedAttendee } from '../store/models/attendee-model';
import { IDocument } from '../store/models/document-model';
import { ISegmentDocument } from '../store/models/segment-document-model';
import { ISegment } from '../store/models/segment-model';
import { IStore } from '../store/use-store';
import { createDocument } from './create-meeting-notes';

const createMailtoLink = (meeting: ISegment) =>
  `mailto:${meeting.attendees.map((a) => a.email).join(',')}?subject=${meeting.summary}`;

const createMeetingNotes = async (
  meeting: ISegment,
  documentIds: string[],
  setMeetingNotesLoading: (isLoading: boolean) => void,
  personDataStore: IStore['personDataStore'],
  documentDataStore: IStore['documentDataStore'],
  attendeeDataStore: IStore['attendeeDataStore'],
  refetch: () => void,
  scope: string,
  authToken: string,
) => {
  setMeetingNotesLoading(true);
  const document = await createDocument(
    meeting,
    documentIds,
    personDataStore,
    documentDataStore,
    attendeeDataStore,
    scope,
    authToken,
  );
  // Not sure if a good idea
  // await addDocumentToCalendarEvent(meeting, document);
  setMeetingNotesLoading(false);
  const emailsToInvite = meeting.attendees
    .map((a) => {
      const shouldInvite = !a.self && a.responseStatus === 'accepted';
      if (shouldInvite) {
        return a.email;
      }
    })
    .filter(Boolean);

  const params = new URLSearchParams({
    actionButton: '1',
    userstoinvite: emailsToInvite.join(','),
  });
  const documentShareUrl = document
    ? `https://docs.google.com/document/d/${document.id}?${params.toString()}`
    : null;
  if (documentShareUrl) {
    window.open(documentShareUrl, '_blank');
  }
  refetch();
};

const ExpandedMeeting = (props: {
  store: IStore;
  meetingId?: string;
  close?: () => void;
  hideHeader?: boolean;
}) => {
  const classes = useExpandStyles();
  const buttonClasses = useButtonStyles();
  const { slug }: any = useParams();
  const meetingId = props.meetingId || slug;
  const [isMeetingNotesLoading, setMeetingNotesLoading] = useState<boolean>(false);
  const [meeting, setMeeting] = useState<ISegment | undefined>(undefined);
  const [meetingNotesDocument, setMeetingNotesDocument] = useState<IDocument | undefined>(
    undefined,
  );
  const [attendees, setAttendees] = useState<IFormattedAttendee[]>([]);
  const [segmentDocumentsForAttendees, setSegmentDocumentsForAttendees] = useState<
    ISegmentDocument[]
  >([]);
  const [segmentDocumentsForNonAttendees, setSegmentDocumentsForNonAttendees] = useState<
    ISegmentDocument[]
  >([]);
  const [segmentDocumentsFromPastMeetings, setSegmentDocumentsFromPastMeetings] = useState<
    ISegmentDocument[]
  >([]);

  useEffect(() => {
    const fetchData = async () => {
      if (meetingId) {
        const result = await props.store.timeDataStore.getById(meetingId);
        setMeeting(result);
      }
    };
    void fetchData();
  }, [props.store.isLoading, meetingId]);

  useEffect(() => {
    const fetchData = async () => {
      if (meetingId) {
        const result = await props.store.attendeeDataStore.getAllForSegmentId(meetingId);
        setAttendees(result);
      }
    };
    void fetchData();
  }, [props.store.isLoading, meetingId]);

  useEffect(() => {
    const fetchData = async () => {
      if (meetingId) {
        const result = await props.store.segmentDocumentStore.getAllForSegmentId(meetingId);
        setSegmentDocumentsForAttendees(result.filter((s) => s.isPersonAttendee));
        setSegmentDocumentsForNonAttendees(result.filter((s) => !s.isPersonAttendee));
      }
    };
    void fetchData();
  }, [props.store.isLoading, meetingId]);

  useEffect(() => {
    const fetchData = async () => {
      if (meeting?.summary) {
        const result = await props.store.segmentDocumentStore.getAllForMeetingName(
          meeting?.summary,
        );
        setSegmentDocumentsFromPastMeetings(result ? result.filter((s) => s.isPersonAttendee) : []);
      } else {
        setSegmentDocumentsFromPastMeetings([]);
      }
    };
    void fetchData();
  }, [props.store.isLoading, meeting?.summary]);

  useEffect(() => {
    const fetchData = async () => {
      if (meeting?.documentIdsFromDescription[0]) {
        const result = await props.store.documentDataStore.getByLink(
          meeting.documentIdsFromDescription[0],
        );
        setMeetingNotesDocument(result);
      } else {
        setMeetingNotesDocument(undefined);
      }
    };
    void fetchData();
  }, [props.store.isLoading, meetingId, meeting]);

  if (!meeting) {
    return null;
  }

  const hasAttendees = attendees.length > 0;
  const hasDescription = meeting.description && meeting.description.length > 0;
  const shouldShowMeetingLink = !!meeting.hangoutLink && isToday(meeting.start);

  const guestStats = getFormattedGuestStats(attendees);
  const isHtml = meeting.description && /<\/?[a-z][\s\S]*>/i.test(meeting.description);

  const meetingNotesLink = meetingNotesDocument?.link;
  const hasMeetingNotes = !!meetingNotesLink;
  const editLink = meeting.link?.replace(
    'https://www.google.com/calendar/event?eid=',
    'https://calendar.google.com/calendar/u/0/r/eventedit/',
  );
  const meetingNotesDocumentIds = uniq(
    segmentDocumentsForAttendees.concat(segmentDocumentsForNonAttendees).map((s) => s.documentId),
  );
  return (
    <React.Fragment>
      {!props.hideHeader && (
        <AppBar
          emailLink={createMailtoLink(meeting)}
          externalLink={editLink}
          onClose={props.close}
        />
      )}
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
                  meetingNotesDocumentIds,
                  setMeetingNotesLoading,
                  props.store.personDataStore,
                  props.store.documentDataStore,
                  props.store.attendeeDataStore,
                  props.store.refetch,
                  props.store.scope,
                  props.store.googleOauthToken,
                )
              }
              variant="contained"
              className={buttonClasses.button}
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
                onClick={() => window.open(meetingNotesLink, '_blank')}
                variant="contained"
                className={buttonClasses.button}
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
                className={buttonClasses.button}
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
          <React.Fragment>
            <Typography variant="h6" className={classes.smallHeading}>
              Description
            </Typography>
            <Typography variant="body2" className={classes.description}>
              <Linkify>{meeting.description?.trim()}</Linkify>
            </Typography>
          </React.Fragment>
        )}
        <Typography variant="h6" className={classes.smallHeading}>
          Documents you may need
        </Typography>
        <SegmentDocumentList
          segmentDocumentsForAttendees={segmentDocumentsForAttendees}
          segmentDocumentsFromPastMeetings={segmentDocumentsFromPastMeetings}
          segmentDocumentsForNonAttendees={segmentDocumentsForNonAttendees}
          docStore={props.store.documentDataStore}
          personStore={props.store.personDataStore}
        />
        {hasDescription && isHtml && (
          <React.Fragment>
            <Typography variant="h6" className={classes.smallHeading}>
              Description
            </Typography>
            <Typography
              variant="body2"
              className={classes.description}
              dangerouslySetInnerHTML={{ __html: meeting.description!.trim() }}
            />
          </React.Fragment>
        )}
        {hasAttendees && (
          <React.Fragment>
            <Typography variant="h6" className={classes.smallHeading}>
              Guests
            </Typography>
            <Typography variant="caption" className={classes.smallCaption}>
              {guestStats}
            </Typography>
            <AttendeeList
              personStore={props.store.personDataStore}
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
            <Typography variant="body2" className={classes.overflowEllipsis}>
              {meeting.location}
            </Typography>
          </React.Fragment>
        )}
        <Typography variant="h6" className={classes.smallHeading}>
          Did you mean to invite…
        </Typography>
        [todo]
      </div>
    </React.Fragment>
  );
};

export default ExpandedMeeting;
