import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import React, { useEffect, useState } from 'react';
import SegmentDocumentList from '../shared/segment-document-list';
import { ISegmentDocument } from '../store/models/segment-document-model';
import { meetingId } from '../store/use-homepage-store';
import { IStore } from '../store/use-store';

const useStyles = makeStyles((theme) => ({
  summary: {
    border: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(2),
    background: theme.palette.background.paper,
  },
}));

const Documents = (props: { store: IStore }) => {
  const classes = useStyles();
  const [segmentDocuments, setSegmentDocuments] = useState<ISegmentDocument[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (meetingId) {
        const segmentDocuments = await props.store.segmentDocumentStore.getAllForSegmentId(
          meetingId,
        );
        setSegmentDocuments(segmentDocuments);
      }
    };
    void fetchData();
  }, [meetingId]);

  return (
    <div className={classes.summary}>
      <Typography variant="h6">Documents you may need</Typography>
      <SegmentDocumentList
        segmentDocuments={segmentDocuments}
        docStore={props.store.documentDataStore}
        personStore={props.store.personDataStore}
      />
    </div>
  );
};

export default Documents;
