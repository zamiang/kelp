import Grid from '@material-ui/core/Grid';
import ListItem from '@material-ui/core/ListItem';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import AttendeeList from '../shared/attendee-list';
import useRowStyles from '../shared/row-styles';
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
    marginLeft: 4,
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
  dot: {},
}));

const MeetingRow = (props: {
  meeting: ISegment;
  selectedMeetingId: string | null;
  shouldRenderCurrentTime: boolean;
  store: IStore;
  isSmall?: boolean;
  shoudlGreyOutPastEvents?: boolean;
}) => {
  const isSelected = props.selectedMeetingId === props.meeting.id;
  const classes = useStyles();
  const router = useHistory();
  const rowStyles = useRowStyles();
  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(null);
  const isPast = props.shoudlGreyOutPastEvents && props.meeting.end < new Date();

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
    <ListItem
      button={true}
      selected={isSelected}
      onClick={handleClick}
      ref={setReferenceElement as any}
      style={{ display: 'block' }}
      className={clsx(
        'ignore-react-onclickoutside',
        rowStyles.row,
        rowStyles.rowBorderRadius,
        classes.row,
        props.meeting.selfResponseStatus === 'accepted' && rowStyles.rowDefault,
        props.meeting.selfResponseStatus === 'tentative' && rowStyles.rowHint,
        props.meeting.selfResponseStatus === 'declined' && rowStyles.rowLineThrough,
        props.meeting.selfResponseStatus === 'needsAction' && rowStyles.rowHint,
        isPast && rowStyles.rowHint,
        isSelected && rowStyles.rowPrimaryMain,
        props.isSmall && classes.noLeftMargin,
      )}
    >
      <Grid container spacing={2} alignItems="center">
        <Grid item className={classes.dot}>
          <div
            className={clsx(
              rowStyles.border,
              props.meeting.selfResponseStatus === 'accepted' && rowStyles.borderSecondaryMain,
              props.meeting.selfResponseStatus === 'tentative' && rowStyles.borderSecondaryLight,
              props.meeting.selfResponseStatus === 'declined' && rowStyles.borderSecondaryLight,
              props.meeting.selfResponseStatus === 'needsAction' && rowStyles.borderSecondaryLight,
              props.selectedMeetingId === props.meeting.id && rowStyles.borderInfoMain,
            )}
          />
        </Grid>
        <Grid item xs zeroMinWidth className={clsx(props.isSmall && classes.smallContainer)}>
          <Grid container>
            <Grid item xs={12}>
              <Typography variant="h6">
                {format(props.meeting.start, 'p')} – {format(props.meeting.end, 'p')}
              </Typography>
              <Typography variant="body2" noWrap>
                <span style={{ fontWeight: 500 }}>{props.meeting.summary || '(no title)'}</span>{' '}
                {!props.isSmall && props.meeting.description
                  ? props.meeting.description.replace(/<[^>]+>/g, '')
                  : ''}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      {isSelected && <MeetingRowBelow meeting={props.meeting} store={props.store} />}
    </ListItem>
  );
};

export default MeetingRow;
