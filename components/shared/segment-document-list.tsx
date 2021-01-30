import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { format, formatDistanceToNow } from 'date-fns';
import { capitalize, uniqBy } from 'lodash';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
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
}));

const Activity = (props: {
  document: IDocument;
  segmentDocument: ISegmentDocument;
  personStore: IStore['personDataStore'];
}) => {
  const classes = useRowStyles();
  const expandClasses = useExpandStyles();
  const router = useRouter();
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

  const tooltipText = `${capitalize(props.segmentDocument.reason)} by ${
    actor?.name || actor?.emailAddresses
  } on ${format(new Date(props.document.updatedAt!), "MMM do 'at' hh:mm a")}`;
  const belowText = `Recent ${props.segmentDocument.reason} by ${
    actor?.name || actor?.emailAddresses
  }`;

  return (
    <Tooltip title={tooltipText} aria-label={tooltipText}>
      <Button
        className={expandClasses.listItem}
        onClick={() => router.push(`?tab=docs&slug=${props.document.id}`)}
      >
        <Grid container wrap="nowrap" spacing={1} alignItems="flex-start">
          <Grid item>
            <img src={props.document.iconLink} className={classes.icon} />
          </Grid>
          <Grid item xs={8}>
            <Typography variant="body2" noWrap>
              {props.document.name}
            </Typography>
            <Typography variant="caption" noWrap>
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

const SegmentDocumentList = (props: {
  segmentDocuments: ISegmentDocument[];
  personStore: IStore['personDataStore'];
  docStore: IStore['documentDataStore'];
}) => {
  const classes = useExpandStyles();
  const segmentDocuments = uniqBy(
    props.segmentDocuments.sort((a, b) => (a.date > b.date ? -1 : 1)),
    'documentId',
  );
  if (segmentDocuments.length < 1) {
    return <Typography variant="caption">None</Typography>;
  }
  return (
    <div className={classes.list}>
      {segmentDocuments.map((segmentDocument) => (
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

export default SegmentDocumentList;
