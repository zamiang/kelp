import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import { mediumFontFamily } from '../../constants/theme';
import ArrowIcon from '../../public/icons/chevron-right.svg';
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
    fontWeight: 500,
    fontFamily: mediumFontFamily,
    marginBottom: theme.spacing(0.5),
    textAlign: 'left',
    marginLeft: theme.spacing(2),
  },
  rightIcon: {
    float: 'right',
    marginTop: -theme.spacing(1),
    marginRight: theme.spacing(1),
    transition: 'all 0.3s',
    transform: 'rotate(90deg)',
  },
  rightIconUp: {
    transform: 'rotate(-90deg)',
  },
}));

const MeetingRowBelow = (props: { meeting: ISegment; store: IStore; shouldPadLeft: boolean }) => {
  const classes = useBelowStyles();
  const [attendees, setAttendees] = useState<IFormattedAttendee[]>([]);
  const [shouldDisplayAttendeeList, setAttendeeListDisplay] = useState<boolean>(false);

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
          <Typography
            variant="h6"
            className={classes.heading}
            onClick={(event) => {
              event.stopPropagation();
              setAttendeeListDisplay(!shouldDisplayAttendeeList);
              return false;
            }}
          >
            {attendees.length} Guests
            <IconButton
              className={clsx(classes.rightIcon, shouldDisplayAttendeeList && classes.rightIconUp)}
            >
              <ArrowIcon width="24" height="24" />
            </IconButton>
          </Typography>
          {shouldDisplayAttendeeList && (
            <AttendeeList
              personStore={props.store.personDataStore}
              attendees={attendees}
              showAll={false}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default MeetingRowBelow;
