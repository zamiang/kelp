import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import AddIcon from '@material-ui/icons/Add';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import MeetingRoomIcon from '@material-ui/icons/MeetingRoom';
import { format } from 'date-fns';
import { uniq } from 'lodash';
import React, { useEffect, useState } from 'react';
import Linkify from 'react-linkify';
import { useParams } from 'react-router-dom';
import AttendeeList from '../shared/attendee-list';
import useButtonStyles from '../shared/button-styles';
import useExpandStyles from '../shared/expand-styles';
import SegmentDocumentList from '../shared/segment-document-list';
import { getFormattedGuestStats } from '../store/helpers';
import { IFormattedAttendee } from '../store/models/attendee-model';
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

  if (!meeting) {
    return null;
  }

  const videoLinkDomain = meeting.videoLink ? new URL(meeting.videoLink).hostname : undefined;
  const shouldShowMeetingLink = !!meeting.videoLink;
  const hasAttendees = attendees.length > 0;
  const hasDescription = meeting.description && meeting.description.length > 0;

  const guestStats = getFormattedGuestStats(attendees);
  const isHtml = meeting.description && /<\/?[a-z][\s\S]*>/i.test(meeting.description);

  const hasMeetingNotes = !!meeting.meetingNotesLink;
  const hasDocuments =
    segmentDocumentsForAttendees.length > 0 ||
    segmentDocumentsForNonAttendees.length > 0 ||
    segmentDocumentsFromPastMeetings.length > 0;
  const editLink = meeting.link?.replace(
    'https://www.google.com/calendar/event?eid=',
    'https://calendar.google.com/calendar/u/0/r/eventedit/',
  );
  return (
    <React.Fragment>
      <div className={classes.topContainer}>
        <Typography variant="h5" color="textPrimary" gutterBottom>
          {meeting.summary || '(no title)'}
        </Typography>
        {format(meeting.start, 'EEEE, MMMM d')} ⋅ {format(meeting.start, 'p')} –{' '}
        {format(meeting.end, 'p')}
        <br />
        <br />
        <Grid container>
          {shouldShowMeetingLink && (
            <Grid item xs={12}>
              <Button
                onClick={() => window.open(meeting.videoLink, '_blank')}
                variant="contained"
                className={buttonClasses.button}
                startIcon={<MeetingRoomIcon />}
                disableElevation
              >
                Join {videoLinkDomain}
              </Button>
            </Grid>
          )}
          <Grid item xs={12}>
            <Button
              onClick={() => {
                const meetingNotesDocumentIds = uniq(
                  segmentDocumentsForAttendees
                    .concat()
                    .map((s) => s.documentId)
                    .concat(meeting.documentIdsFromDescription),
                );
                return createMeetingNotes(
                  meeting,
                  meetingNotesDocumentIds,
                  setMeetingNotesLoading,
                  props.store.personDataStore,
                  props.store.documentDataStore,
                  props.store.attendeeDataStore,
                  props.store.refetch,
                  props.store.scope,
                  props.store.googleOauthToken,
                );
              }}
              startIcon={
                isMeetingNotesLoading ? (
                  <CircularProgress size={20} color={'paper' as any} />
                ) : (
                  <AddIcon />
                )
              }
              disabled={isMeetingNotesLoading}
              disableElevation
            >
              Create Smart Meeting Notes
            </Button>
          </Grid>
          {hasMeetingNotes && (
            <Grid item xs={12}>
              <Button
                onClick={() => window.open(meeting.meetingNotesLink, '_blank')}
                startIcon={<InsertDriveFileIcon />}
              >
                View Meeting Notes
              </Button>
            </Grid>
          )}
          <Grid item xs={12}>
            <Button href={createMailtoLink(meeting)} className={classes.link}>
              Email guests
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Button href={editLink} className={classes.link}>
              View in Google
            </Button>
          </Grid>
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
        {hasDocuments && (
          <React.Fragment>
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
          </React.Fragment>
        )}
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
      </div>
    </React.Fragment>
  );
};

export default ExpandedMeeting;
