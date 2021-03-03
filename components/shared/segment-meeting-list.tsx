import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import EventIcon from '@material-ui/icons/Event';
import { format } from 'date-fns';
import { capitalize, uniqBy } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { IPerson } from '../store/models/person-model';
import { ISegmentDocument } from '../store/models/segment-document-model';
import { ISegment } from '../store/models/segment-model';
import { IStore } from '../store/use-store';
import useExpandStyles from './expand-styles';

const useRowStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    overflow: 'hidden',
  },
  icon: {
    height: 16,
    width: 16,
    display: 'block',
    marginTop: 2,
  },
  distanceToNow: {
    textAlign: 'right',
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
}));

const Meeting = (props: {
  meeting: ISegment;
  segmentDocument: ISegmentDocument;
  personStore: IStore['personDataStore'];
}) => {
  const classes = useRowStyles();
  const expandClasses = useExpandStyles();
  const router = useHistory();
  const [person, setPerson] = useState<IPerson | undefined>(undefined);

  useEffect(() => {
    const fetchData = async () => {
      if (props.segmentDocument.personId) {
        const result = await props.personStore.getPersonById(props.segmentDocument.personId);
        setPerson(result);
      }
    };
    void fetchData();
  }, [props.segmentDocument.personId]);

  const personText = person ? ` by ${person?.name || person?.emailAddresses}` : '';
  const tooltipText = `${capitalize(props.segmentDocument.reason)}${personText} on ${format(
    new Date(props.segmentDocument.date),
    "MMM do 'at' hh:mm a",
  )}`;
  const belowText = `${props.segmentDocument.reason}${personText}`;
  return (
    <Tooltip title={tooltipText} aria-label={tooltipText}>
      <Button
        className={expandClasses.listItem}
        onClick={() => router.push(`/meetings/${props.meeting.id}`)}
      >
        <Grid container wrap="nowrap" spacing={1} alignItems="flex-start">
          <Grid item>
            <EventIcon style={{ fontSize: 24, display: 'block' }} />
          </Grid>
          <Grid item xs={8}>
            <Typography variant="body2" noWrap>
              {props.meeting.summary || '(No title)'}
            </Typography>
            <Typography variant="caption" noWrap>
              {belowText}
            </Typography>
          </Grid>
          <Grid item xs={3} className={classes.distanceToNow}>
            <Typography variant="caption" color="textSecondary" noWrap>
              {format(props.meeting.start, "MMM do 'at' hh:mm a")}
            </Typography>
          </Grid>
        </Grid>
      </Button>
    </Tooltip>
  );
};

const SegmentDocumentItem = (props: {
  personStore: IStore['personDataStore'];
  timeStore: IStore['timeDataStore'];
  segmentDocument: ISegmentDocument;
}) => {
  const [meeting, setMeeting] = useState<ISegment | undefined>(undefined);

  useEffect(() => {
    const fetchData = async () => {
      if (props.segmentDocument.segmentId) {
        const result = await props.timeStore.getById(props.segmentDocument.segmentId);
        setMeeting(result);
      }
    };
    void fetchData();
  }, [props.segmentDocument.documentId]);

  if (!meeting) {
    return null;
  }

  return (
    <Meeting
      key={props.segmentDocument.id}
      personStore={props.personStore}
      meeting={meeting}
      segmentDocument={props.segmentDocument}
    />
  );
};

const SegmentMeetingList = (props: {
  segmentDocuments: ISegmentDocument[];
  personStore: IStore['personDataStore'];
  timeStore: IStore['timeDataStore'];
}) => {
  const segmentDocuments = uniqBy(
    props.segmentDocuments.sort((a, b) => (a.date > b.date ? -1 : 1)),
    'documentId',
  );
  if (segmentDocuments.length < 1) {
    return <Typography variant="caption">None</Typography>;
  }
  return (
    <div>
      {segmentDocuments.map((segmentDocument) => (
        <SegmentDocumentItem
          key={segmentDocument.id}
          personStore={props.personStore}
          segmentDocument={segmentDocument}
          timeStore={props.timeStore}
        />
      ))}
    </div>
  );
};

export default SegmentMeetingList;
