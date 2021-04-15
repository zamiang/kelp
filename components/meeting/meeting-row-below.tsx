import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import React, { useEffect, useState } from 'react';
import { mediumFontFamily } from '../../constants/theme';
import AttendeeList from '../shared/attendee-list';
import SegmentDocumentList from '../shared/segment-document-list';
import { IFormattedAttendee, ISegment, ISegmentDocument } from '../store/data-types';
import { IStore } from '../store/use-store';

const useBelowStyles = makeStyles((theme) => ({
  container: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  buttonContainer: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    marginLeft: theme.spacing(2),
  },
  containerNoLeftMargin: {
    marginLeft: theme.spacing(2),
  },
  heading: {
    color: theme.palette.secondary.main,
    fontWeight: 500,
    fontFamily: mediumFontFamily,
    marginBottom: theme.spacing(0.5),
  },
}));

const MeetingRowBelow = (props: { meeting: ISegment; store: IStore; shouldPadLeft: boolean }) => {
  const classes = useBelowStyles();
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
      const result = await props.store.segmentDocumentStore.getAllForSegmentId(props.meeting.id);
      setSegmentDocumentsForAttendees(result.filter((s) => s.isPersonAttendee));
      setSegmentDocumentsForNonAttendees(result.filter((s) => !s.isPersonAttendee));
    };
    void fetchData();
  }, [props.store.isLoading, props.meeting.id]);

  useEffect(() => {
    const fetchData = async () => {
      if (props.meeting.summary) {
        const result = await props.store.segmentDocumentStore.getAllForMeetingName(
          props.meeting.summary,
        );
        setSegmentDocumentsFromPastMeetings(result ? result.filter((s) => s.isPersonAttendee) : []);
      } else {
        setSegmentDocumentsFromPastMeetings([]);
      }
    };
    void fetchData();
  }, [props.store.isLoading, props.meeting?.summary]);

  useEffect(() => {
    const fetchData = async () => {
      if (props.meeting.id) {
        const result = await props.store.attendeeDataStore.getAllForSegmentId(props.meeting.id);
        setAttendees(result);
      }
    };
    void fetchData();
  }, [props.store.isLoading, props.meeting.id]);

  const hasDocuments =
    segmentDocumentsForAttendees.length > 0 ||
    segmentDocumentsForNonAttendees.length > 0 ||
    segmentDocumentsFromPastMeetings.length > 0;

  const hasAttendees = attendees.length > 0;

  return (
    <div>
      {hasDocuments && (
        <div className={classes.container}>
          <Typography variant="h6" className={classes.heading}>
            Documents you may need
          </Typography>
          <SegmentDocumentList
            segmentDocumentsForAttendees={segmentDocumentsForAttendees}
            segmentDocumentsFromPastMeetings={segmentDocumentsFromPastMeetings}
            segmentDocumentsForNonAttendees={segmentDocumentsForNonAttendees}
            store={props.store}
          />
        </div>
      )}
      {hasAttendees && (
        <div className={classes.container}>
          <Typography variant="h6" className={classes.heading}>
            Attendees
          </Typography>
          <AttendeeList
            personStore={props.store.personDataStore}
            attendees={attendees}
            showAll={false}
          />
        </div>
      )}
    </div>
  );
};

export default MeetingRowBelow;
