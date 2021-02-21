import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { format, formatDistanceToNow } from 'date-fns';
import { capitalize, unionBy, uniqBy } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { IDocument } from '../store/models/document-model';
import { IPerson } from '../store/models/person-model';
import { ISegmentDocument } from '../store/models/segment-document-model';
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
  noWrap: {
    overflow: 'hidden',
  },
}));

const Activity = (props: {
  document: IDocument;
  segmentDocument: ISegmentDocument;
  personStore: IStore['personDataStore'];
}) => {
  const classes = useRowStyles();
  const expandClasses = useExpandStyles();
  const router = useHistory();
  const [actor, setActor] = useState<IPerson | undefined>(undefined);

  useEffect(() => {
    const fetchData = async () => {
      if (props.segmentDocument.personId) {
        const result = await props.personStore.getPersonById(props.segmentDocument.personId);
        setActor(result);
      }
    };
    void fetchData();
  }, [props.segmentDocument.personId]);
  const actorText = actor ? `by ${actor?.name || actor?.emailAddresses}` : '';
  const tooltipText = `${capitalize(props.segmentDocument.reason)} ${actorText} on ${format(
    new Date(props.document.updatedAt!),
    "MMM do 'at' hh:mm a",
  )}`;
  const belowText = `${props.segmentDocument.reason}${actorText}`;

  return (
    <Tooltip title={tooltipText} aria-label={tooltipText}>
      <Button
        className={expandClasses.listItem}
        onClick={() => router.push(`/docs/${props.document.id}`)}
      >
        <Grid container spacing={1} alignItems="flex-start">
          <Grid item>
            <img src={props.document.iconLink} className={classes.icon} />
          </Grid>
          <Grid item xs={11} sm={8} zeroMinWidth>
            <Typography variant="body2" noWrap>
              {props.document.name}
            </Typography>
            <Typography variant="caption" noWrap className={classes.noWrap}>
              {belowText}
            </Typography>
          </Grid>
          <Grid item xs={3} className={classes.distanceToNow}>
            <Typography variant="caption" color="textSecondary" noWrap>
              {formatDistanceToNow(new Date(props.document.updatedAt!))} ago
            </Typography>
          </Grid>
        </Grid>
      </Button>
    </Tooltip>
  );
};

const SegmentDocumentItem = (props: {
  personStore: IStore['personDataStore'];
  docStore: IStore['documentDataStore'];
  segmentDocument: ISegmentDocument;
}) => {
  const [document, setDocument] = useState<IDocument | undefined>(undefined);
  console.log(props.segmentDocument, '<<<<<<<');
  useEffect(() => {
    const fetchData = async () => {
      if (props.segmentDocument.documentId) {
        const result = await props.docStore.get(props.segmentDocument.documentId);
        setDocument(result);
      }
    };
    void fetchData();
  }, [props.segmentDocument.documentId]);

  if (!document) {
    return null;
  }

  return (
    <Activity
      key={props.segmentDocument.id}
      personStore={props.personStore}
      document={document}
      segmentDocument={props.segmentDocument}
    />
  );
};

const SegmentDocumentForNonAttendees = (props: {
  readonly segmentDocumentsForNonAttendeesCount: number;
  readonly segmentDocumentsForNonAttendees: ISegmentDocument[];
  readonly personStore: IStore['personDataStore'];
  readonly docStore: IStore['documentDataStore'];
}) => {
  const [shouldDisplayNonAttendees, setShouldDisplayNonAttendees] = useState<boolean>(false);
  const classes = useExpandStyles();
  return (
    <div className={classes.list}>
      {props.segmentDocumentsForNonAttendeesCount > 0 && !shouldDisplayNonAttendees && (
        <div>
          <Typography
            onClick={() => setShouldDisplayNonAttendees(true)}
            variant="caption"
            className={classes.showMoreButton}
          >
            + Show {props.segmentDocumentsForNonAttendeesCount} documents from non-attendees
          </Typography>
        </div>
      )}
      {props.segmentDocumentsForNonAttendeesCount > 0 &&
        shouldDisplayNonAttendees &&
        props.segmentDocumentsForNonAttendees.map((segmentDocument) => (
          <SegmentDocumentItem
            key={segmentDocument.id}
            personStore={props.personStore}
            segmentDocument={segmentDocument}
            docStore={props.docStore}
          />
        ))}
    </div>
  );
};

const SegmentDocumentList = (props: {
  readonly segmentDocuments?: ISegmentDocument[];
  readonly segmentDocumentsForAttendees?: ISegmentDocument[];
  readonly segmentDocumentsFromPastMeetings?: ISegmentDocument[];
  readonly segmentDocumentsForNonAttendees?: ISegmentDocument[];
  readonly personStore: IStore['personDataStore'];
  readonly docStore: IStore['documentDataStore'];
}) => {
  const classes = useExpandStyles();
  console.log(props.segmentDocuments, '<<<<<');
  console.log(props.segmentDocumentsForAttendees, '<<<<<');
  console.log(props.segmentDocumentsFromPastMeetings, '<<<<<<');
  console.log(props.segmentDocumentsForNonAttendees, '<<<<<<');
  const segmentsToRender =
    props.segmentDocuments && props.segmentDocuments.length > 0
      ? uniqBy(props.segmentDocuments, 'documentId')
      : unionBy(
          props.segmentDocumentsForAttendees,
          props.segmentDocumentsFromPastMeetings,
          'documentId',
        );
  const documentIds = segmentsToRender.map((s) => s.documentId);
  const filteredSegmentDocumentsForNonAttendees =
    props.segmentDocumentsForNonAttendees && props.segmentDocumentsForNonAttendees.length > 0
      ? uniqBy(
          props.segmentDocumentsForNonAttendees.filter(
            (segment) => !documentIds.includes(segment.documentId),
          ),
          'documentId',
        )
      : [];
  const segmentDocumentsForNonAttendeesCount = filteredSegmentDocumentsForNonAttendees.length;
  if (segmentsToRender.length < 1) {
    return <Typography variant="caption">None</Typography>;
  }
  return (
    <React.Fragment>
      <div className={classes.list}>
        {segmentsToRender.map((segmentDocument) => (
          <SegmentDocumentItem
            key={segmentDocument.id}
            personStore={props.personStore}
            segmentDocument={segmentDocument}
            docStore={props.docStore}
          />
        ))}
      </div>
      {segmentDocumentsForNonAttendeesCount > 0 && (
        <SegmentDocumentForNonAttendees
          segmentDocumentsForNonAttendeesCount={segmentDocumentsForNonAttendeesCount}
          segmentDocumentsForNonAttendees={filteredSegmentDocumentsForNonAttendees}
          personStore={props.personStore}
          docStore={props.docStore}
        />
      )}
    </React.Fragment>
  );
};

export default SegmentDocumentList;
