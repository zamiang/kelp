import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import AddIcon from '@material-ui/icons/Add';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import VideocamIcon from '@material-ui/icons/Videocam';
import clsx from 'clsx';
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
import { IDocument } from '../store/models/document-model';
import { ISegmentDocument } from '../store/models/segment-document-model';
import { ISegment } from '../store/models/segment-model';
import { IStore } from '../store/use-store';
import { createMeetingNotes } from './create-meeting-notes';

const EmailGuestsButton = (props: {
  meeting: ISegment;
  segmentDocuments: ISegmentDocument[];
  documentDataStore: IStore['documentDataStore'];
}) => {
  const buttonClasses = useButtonStyles();

  const [documents, setDocuments] = useState<(IDocument | undefined)[]>([]);
  const documentIds = props.segmentDocuments.map((s) => s.documentId);

  useEffect(() => {
    const fetchData = async () => {
      const docs = await Promise.all(
        documentIds.map(async (id) => props.documentDataStore.get(id)),
      );
      setDocuments(docs);
    };
    void fetchData();
  }, [documentIds.join('')]);

  const bodyText = `Hello, %0D%0A%0D%0A${documents
    .map((d) => `${d?.name} - ${d?.link}%0D%0A`)
    .join(' ')}%0D%0A%0D%0AThanks,%0D%0A%0D%0AEmail generated by http://www.kelp.nyc `;
  const link = `mailto:${props.meeting.attendees.map((a) => a.email).join(',')}?subject=${
    props.meeting.summary
  }&body=${bodyText}`;

  return (
    <Button
      href={link}
      target="_blank"
      variant="outlined"
      className={clsx(buttonClasses.button, buttonClasses.buttonPrimary)}
    >
      Email guests
    </Button>
  );
};

export const createSmartMeetingNotes = (
  meeting: ISegment,
  store: IStore,
  segmentDocumentsForAttendees: ISegmentDocument[],
  setMeetingNotesLoading: (isLoading: boolean) => void,
) => {
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
    store.personDataStore,
    store.documentDataStore,
    store.attendeeDataStore,
    store.refetch,
    store.scope,
    store.googleOauthToken,
  );
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
        <Grid container spacing={2}>
          {!hasMeetingNotes && (
            <Grid item xs={6}>
              <Button
                onClick={() =>
                  createSmartMeetingNotes(
                    meeting,
                    props.store,
                    segmentDocumentsForAttendees,
                    setMeetingNotesLoading,
                  )
                }
                startIcon={isMeetingNotesLoading ? <CircularProgress size={20} /> : <AddIcon />}
                disabled={isMeetingNotesLoading}
                disableElevation
                variant="outlined"
                className={clsx(buttonClasses.button, buttonClasses.buttonPrimary)}
              >
                Smart Notes
              </Button>
            </Grid>
          )}
          {hasMeetingNotes && (
            <Grid item xs={6}>
              <Button
                variant="outlined"
                onClick={() => window.open(meeting.meetingNotesLink, '_blank')}
                startIcon={<InsertDriveFileIcon />}
                className={clsx(buttonClasses.button, buttonClasses.buttonPrimary)}
              >
                View Notes
              </Button>
            </Grid>
          )}
          <Grid item xs={6}>
            <EmailGuestsButton
              meeting={meeting}
              segmentDocuments={segmentDocumentsForAttendees.concat(
                segmentDocumentsFromPastMeetings,
              )}
              documentDataStore={props.store.documentDataStore}
            />
          </Grid>
          {shouldShowMeetingLink && (
            <Grid item xs={12}>
              <Button
                onClick={() => window.open(meeting.videoLink, '_blank')}
                variant="contained"
                disableElevation
                color="primary"
                startIcon={<VideocamIcon color={'paper' as any} />}
                className={buttonClasses.button}
              >
                Join {videoLinkDomain}
              </Button>
            </Grid>
          )}
        </Grid>
      </div>
      <Divider />
      <div className={classes.container}>
        {hasDescription && !isHtml && (
          <React.Fragment>
            <Typography variant="h6">Description</Typography>
            <Typography variant="body2" className={classes.description}>
              <Linkify>{meeting.description?.trim()}</Linkify>
            </Typography>
          </React.Fragment>
        )}
        {hasDocuments && (
          <React.Fragment>
            <Typography variant="h6">Documents you may need</Typography>
            <SegmentDocumentList
              segmentDocumentsForAttendees={segmentDocumentsForAttendees}
              segmentDocumentsFromPastMeetings={segmentDocumentsFromPastMeetings}
              segmentDocumentsForNonAttendees={segmentDocumentsForNonAttendees}
              store={props.store}
            />
          </React.Fragment>
        )}
        {hasDescription && isHtml && (
          <React.Fragment>
            <Typography variant="h6">Description</Typography>
            <Typography
              variant="body2"
              className={classes.description}
              dangerouslySetInnerHTML={{ __html: meeting.description!.trim() }}
            />
          </React.Fragment>
        )}
        {hasAttendees && (
          <React.Fragment>
            <Typography variant="h6">Guests</Typography>
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
            <Typography variant="h6">Location</Typography>
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
