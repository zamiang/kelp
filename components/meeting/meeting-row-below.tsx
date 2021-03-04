import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import VideocamIcon from '@material-ui/icons/Videocam';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import AttendeeList from '../shared/attendee-list';
import SegmentDocumentList from '../shared/segment-document-list';
import { IFormattedAttendee } from '../store/models/attendee-model';
import { ISegmentDocument } from '../store/models/segment-document-model';
import { ISegment } from '../store/models/segment-model';
import { IStore } from '../store/use-store';

const useBelowStyles = makeStyles((theme) => ({
  container: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    marginLeft: theme.spacing(4),
    paddingLeft: theme.spacing(2),
    borderLeft: `1px solid ${theme.palette.divider}`,
  },
  buttonContainer: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    marginLeft: theme.spacing(4),
  },
  buttonStyle: {
    width: '100%',
    borderRadius: theme.spacing(2),
    fontWeight: 500,
  },
  buttonPrimary: {
    color: theme.palette.primary.main,
  },
}));

const MeetingRowBelow = (props: { meeting: ISegment; store: IStore }) => {
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
      const result = await props.store.attendeeDataStore.getAllForSegmentId(props.meeting.id);
      setAttendees(result);
    };
    void fetchData();
  }, [props.store.isLoading, props.meeting.id]);

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

  return (
    <div>
      <div className={classes.container}>
        <Typography variant="h6">Documents you may need</Typography>
        <SegmentDocumentList
          segmentDocumentsForAttendees={segmentDocumentsForAttendees}
          segmentDocumentsFromPastMeetings={segmentDocumentsFromPastMeetings}
          segmentDocumentsForNonAttendees={segmentDocumentsForNonAttendees}
          store={props.store}
          isSmall
        />
        <Typography variant="h6">Attendees</Typography>
        <AttendeeList
          personStore={props.store.personDataStore}
          attendees={attendees}
          showAll={false}
          isSmall={true}
        />
      </div>
      <div className={classes.buttonContainer}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Button
              variant="outlined"
              className={clsx(classes.buttonStyle, classes.buttonPrimary)}
              startIcon={<AddIcon color="primary" />}
            >
              Smart Notes
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<VideocamIcon color={'paper' as any} />}
              className={classes.buttonStyle}
            >
              Join
            </Button>
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

export default MeetingRowBelow;
