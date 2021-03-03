import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import VideocamIcon from '@material-ui/icons/Videocam';
import clsx from 'clsx';
import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import AttendeeList from '../shared/attendee-list';
import SegmentDocumentList from '../shared/segment-document-list';
import { IFormattedAttendee } from '../store/models/attendee-model';
import { ISegmentDocument } from '../store/models/segment-document-model';
import { ISegment } from '../store/models/segment-model';
import { IStore } from '../store/use-store';

const useBelowStyles = makeStyles((theme) => ({
  container: {
    marginLeft: theme.spacing(6),
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
    <div className={classes.container}>
      <SegmentDocumentList
        segmentDocumentsForAttendees={segmentDocumentsForAttendees}
        segmentDocumentsFromPastMeetings={segmentDocumentsFromPastMeetings}
        segmentDocumentsForNonAttendees={segmentDocumentsForNonAttendees}
        docStore={props.store.documentDataStore}
        personStore={props.store.personDataStore}
      />
      <AttendeeList
        personStore={props.store.personDataStore}
        attendees={attendees}
        showAll={false}
      />
    </div>
  );
};

const useStyles = makeStyles((theme) => ({
  time: { minWidth: 150, maxWidth: 180 },
  row: {
    paddingLeft: 0,
    width: 'auto',
    [theme.breakpoints.down('sm')]: {
      marginLeft: -4,
      paddingLeft: theme.spacing(2),
      borderRadius: 0,
    },
  },
  summary: {
    flex: 1,
    [theme.breakpoints.down('sm')]: {
      flex: 'none',
    },
  },
  noLeftMargin: {
    marginLeft: 0,
  },
  smallContainer: {
    flexDirection: 'column-reverse',
    overflow: 'hidden',
  },
  container: {
    display: 'block',
    width: '100%',
    textAlign: 'left',
  },
}));

const MeetingRow = (props: {
  meeting: ISegment;
  selectedMeetingId: string | null;
  shouldRenderCurrentTime: boolean;
  store: IStore;
  isSmall?: boolean;
}) => {
  const isSelected = props.selectedMeetingId === props.meeting.id;
  const classes = useStyles();
  const router = useHistory();
  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (isSelected && referenceElement) {
      referenceElement.scrollIntoView({ behavior: 'auto', block: 'center' });
    } else if (referenceElement && !props.selectedMeetingId && props.shouldRenderCurrentTime) {
      referenceElement.scrollIntoView({ behavior: 'auto', block: 'center' });
    }
  }, [!!referenceElement]);

  const handleClick = () => {
    void router.push(`/meetings/${props.meeting.id}`);
    return false;
  };
  return (
    <Button onClick={handleClick} ref={setReferenceElement as any} className={classes.container}>
      <Grid container spacing={1} alignItems="center">
        <Grid item>
          <KeyboardArrowRightIcon />
        </Grid>
        <Grid item xs zeroMinWidth className={clsx(props.isSmall && classes.smallContainer)}>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <Typography variant="body2">
                {format(props.meeting.start, 'p')} – {format(props.meeting.end, 'p')}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography noWrap>
                <span style={{ fontWeight: 500 }}>{props.meeting.summary || '(no title)'}</span>{' '}
                {!props.isSmall && props.meeting.description
                  ? props.meeting.description.replace(/<[^>]+>/g, '')
                  : ''}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
        {props.meeting.videoLink && (
          <Grid item>
            <IconButton target="_blank" href={props.meeting.videoLink}>
              <VideocamIcon color="primary" />
            </IconButton>
          </Grid>
        )}
      </Grid>
      {isSelected && <MeetingRowBelow meeting={props.meeting} store={props.store} />}
    </Button>
  );
};

export default MeetingRow;
