import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import clsx from 'clsx';
import { format } from 'date-fns';
import { uniq } from 'lodash';
import React, { useEffect, useState } from 'react';
import Linkify from 'react-linkify';
import { useParams } from 'react-router-dom';
import EmailIcon from '../../public/icons/email-orange.svg';
import PlusIcon from '../../public/icons/plus-orange.svg';
import SaveIcon from '../../public/icons/save-orange.svg';
import VideoIcon from '../../public/icons/video-white.svg';
import { GoToSourceButton } from '../mobile/popup-header';
import AttendeeList from '../shared/attendee-list';
import useButtonStyles from '../shared/button-styles';
import useExpandStyles from '../shared/expand-styles';
import SegmentDocumentList from '../shared/segment-document-list';
import { IDocument, IFormattedAttendee, ISegment, ISegmentDocument } from '../store/data-types';
import { getFormattedGuestStats } from '../store/helpers';
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
      const documents = await Promise.all(
        documentIds.map(async (id) => props.documentDataStore.getById(id)),
      );
      setDocuments(documents);
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
      startIcon={<EmailIcon width="24" height="24" />}
      className={clsx(buttonClasses.button, buttonClasses.buttonPrimary)}
    >
      Email guests
    </Button>
  );
};

const createSmartMeetingNotes = (
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
    store.scope!,
    store.googleOauthToken!,
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
        <div className={classes.desktopSourceButton}>
          <GoToSourceButton store={props.store} type="meetings" id={meeting.id} />
        </div>
        <div className={classes.headingContainer}>
          <Typography variant="h3" gutterBottom>
            {meeting.summary || '(no title)'}
          </Typography>
          <Typography variant="h5">
            {format(meeting.start, 'EEEE, MMMM d')} ⋅ {format(meeting.start, 'p')} –{' '}
            {format(meeting.end, 'p')}
          </Typography>
        </div>
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
                startIcon={
                  isMeetingNotesLoading ? (
                    <CircularProgress size={20} />
                  ) : (
                    <PlusIcon width="24" height="24" />
                  )
                }
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
                startIcon={<SaveIcon width="24" height="24" />}
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
                startIcon={<VideoIcon width="24" height="24" />}
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
        {hasDocuments && (
          <React.Fragment>
            <Typography variant="h6" style={{ marginBottom: 0 }}>
              Documents you may need
            </Typography>
            <SegmentDocumentList
              segmentDocumentsForAttendees={segmentDocumentsForAttendees}
              segmentDocumentsFromPastMeetings={segmentDocumentsFromPastMeetings}
              segmentDocumentsForNonAttendees={segmentDocumentsForNonAttendees}
              store={props.store}
            />
          </React.Fragment>
        )}
        {hasDescription && !isHtml && (
          <div className={classes.section}>
            <Typography variant="h6">Description</Typography>
            <Typography className={classes.description}>
              <Linkify>{meeting.description?.trim()}</Linkify>
            </Typography>
          </div>
        )}
        {hasDescription && isHtml && (
          <div className={classes.section}>
            <Typography variant="h6">Description</Typography>
            <Typography
              className={classes.description}
              dangerouslySetInnerHTML={{ __html: meeting.description!.trim() }}
            />
          </div>
        )}
        {hasAttendees && (
          <div className={classes.section}>
            <Typography variant="h6">Guests</Typography>
            <Typography variant="caption" className={classes.smallCaption}>
              {guestStats}
            </Typography>
            <AttendeeList
              personStore={props.store.personDataStore}
              attendees={attendees}
              showAll={false}
            />
          </div>
        )}
        {meeting.location && (
          <div className={classes.section}>
            <Typography variant="h6">Location</Typography>
            <Typography variant="body2" className={classes.overflowEllipsis}>
              {meeting.location}
            </Typography>
          </div>
        )}
      </div>
    </React.Fragment>
  );
};

export default ExpandedMeeting;
