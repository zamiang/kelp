import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import { format } from 'date-fns';
import { uniqBy } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { IFormattedDriveActivity } from '../fetch/fetch-drive-activity';
import AvatarList from '../shared/avatar-list';
import AppBar from '../shared/elevate-app-bar';
import useExpandStyles from '../shared/expand-styles';
import SegmentMeetingList from '../shared/segment-meeting-list';
import { IDocument } from '../store/models/document-model';
import { IPerson } from '../store/models/person-model';
import { ISegmentDocument } from '../store/models/segment-document-model';
import { IStore } from '../store/use-store';

const ExpandedDocument = (props: { store: IStore; documentId?: string; close?: () => void }) => {
  const classes = useExpandStyles();
  const { slug }: any = useParams();
  const documentId = props.documentId || slug;
  const [document, setDocument] = useState<IDocument | undefined>(undefined);
  const [driveActivity, setDriveActivity] = useState<IFormattedDriveActivity[]>([]);
  const [people, setPeople] = useState<IPerson[]>([]);
  const [segmentDocuments, setSegmentDocuments] = useState<ISegmentDocument[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (documentId) {
        const result = await props.store.documentDataStore.getByLink(documentId);
        setDocument(result);
      }
    };
    void fetchData();
  }, [documentId]);

  useEffect(() => {
    const fetchData = async () => {
      if (documentId) {
        const result = await props.store.driveActivityStore.getDriveActivityForDocument(documentId);
        setDriveActivity(result);
      }
    };
    void fetchData();
  }, [documentId]);

  useEffect(() => {
    const fetchData = async () => {
      if (documentId) {
        const result = await props.store.segmentDocumentStore.getAllForSegmentId(documentId);
        setSegmentDocuments(result);
      }
    };
    void fetchData();
  }, [documentId]);

  useEffect(() => {
    const fetchData = async () => {
      if (driveActivity.length > 0) {
        const peopleIds = uniqBy(driveActivity, 'actorPersonId')
          .map((item) => item.actorPersonId)
          .filter(Boolean) as string[];

        const people = await props.store.personDataStore.getBulk(peopleIds);
        setPeople(people);
      }
    };
    void fetchData();
  }, [driveActivity.length]);

  if (!document) {
    return null;
  }

  return (
    <React.Fragment>
      <AppBar onClose={props.close} externalLink={document.link} />
      <div className={classes.topContainer}>
        <Typography variant="h5" color="textPrimary" gutterBottom className={classes.title}>
          {document.name || '(no title)'}
        </Typography>
        {document.updatedAt && (
          <React.Fragment>Modified: {format(document.updatedAt, 'EEEE, MMMM d p')}</React.Fragment>
        )}
      </div>
      <Divider />
      <div className={classes.container}>
        <Typography variant="h6" className={classes.triGroupHeading}>
          Collaborators
        </Typography>
        <Typography className={classes.highlight}>
          <AvatarList people={people} shouldDisplayNone={true} />
        </Typography>
        <Typography variant="h6" className={classes.smallHeading}>
          Meetings
        </Typography>
        <SegmentMeetingList
          segmentDocuments={segmentDocuments}
          timeStore={props.store.timeDataStore}
          personStore={props.store.personDataStore}
        />
      </div>
    </React.Fragment>
  );
};

export default ExpandedDocument;
