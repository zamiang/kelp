import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import { mediumFontFamily } from '../../constants/theme';
import PlusIcon from '../../public/icons/plus-orange.svg';
import VideoIcon from '../../public/icons/video-white.svg';
import useButtonStyles from '../shared/button-styles';
import SegmentDocumentList from '../shared/segment-document-list';
import { ISegment, ISegmentDocument } from '../store/data-types';
import { IStore } from '../store/use-store';
import { createSmartMeetingNotes } from './expand-meeting';

const useBelowStyles = makeStyles((theme) => ({
  container: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    marginLeft: theme.spacing(3),
    paddingBottom: 1,
    paddingLeft: theme.spacing(2),
    borderLeft: `1px solid ${theme.palette.divider}`,
  },
  buttonContainer: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    marginLeft: theme.spacing(2),
  },
  containerNoLeftMargin: {
    marginLeft: 0,
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
  const buttonClasses = useButtonStyles();
  const [isMeetingNotesLoading, setMeetingNotesLoading] = useState<boolean>(false);
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
  const hasDocuments =
    segmentDocumentsForAttendees.length > 0 ||
    segmentDocumentsForNonAttendees.length > 0 ||
    segmentDocumentsFromPastMeetings.length > 0;

  return (
    <div>
      {hasDocuments && (
        <div
          className={clsx(classes.container, !props.shouldPadLeft && classes.containerNoLeftMargin)}
        >
          <React.Fragment>
            <Typography variant="h6" className={classes.heading}>
              Documents you may need
            </Typography>
            <SegmentDocumentList
              segmentDocumentsForAttendees={segmentDocumentsForAttendees}
              segmentDocumentsFromPastMeetings={segmentDocumentsFromPastMeetings}
              segmentDocumentsForNonAttendees={segmentDocumentsForNonAttendees}
              store={props.store}
              isSmall
            />
          </React.Fragment>
        </div>
      )}
      <div
        className={clsx(
          classes.buttonContainer,
          !props.shouldPadLeft && classes.containerNoLeftMargin,
        )}
      >
        <Grid container spacing={1} alignItems="center" justify="space-between">
          <Grid item>
            <Button
              onClick={(event) => {
                event.stopPropagation();
                void createSmartMeetingNotes(
                  props.meeting,
                  props.store,
                  segmentDocumentsForAttendees,
                  setMeetingNotesLoading,
                );
                return false;
              }}
              variant="outlined"
              className={clsx(buttonClasses.button, buttonClasses.buttonPrimary)}
              startIcon={
                isMeetingNotesLoading ? (
                  <CircularProgress size={20} />
                ) : (
                  <PlusIcon width="24" height="24" />
                )
              }
              disabled={isMeetingNotesLoading}
            >
              Smart Notes
            </Button>
          </Grid>
          <Grid item>
            <IconButton
              onClick={() => window.open(props.meeting.videoLink, '_blank')}
              className={buttonClasses.circleButton}
            >
              <VideoIcon width="24" height="24" />
            </IconButton>
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

export default MeetingRowBelow;
