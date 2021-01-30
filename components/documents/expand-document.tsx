import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import { format } from 'date-fns';
import { uniqBy } from 'lodash';
import React, { useEffect, useState } from 'react';
import AvatarList from '../shared/avatar-list';
import AppBar from '../shared/elevate-app-bar';
import useExpandStyles from '../shared/expand-styles';
import MeetingList from '../shared/meeting-list';
import { IDocument } from '../store/models/document-model';
import { IPerson } from '../store/models/person-model';
import { ISegmentDocument } from '../store/models/segment-document-model';
import { ISegment } from '../store/models/segment-model';
import { IStore } from '../store/use-store';

const ExpandedDocument = (props: IStore & { documentId: string; close: () => void }) => {
  const classes = useExpandStyles();
  const [document, setDocument] = useState<IDocument | undefined>(undefined);
  const [segmentDocuments, setSegmentDocuments] = useState<ISegmentDocument[]>([]);
  const [people, setPeople] = useState<IPerson[]>([]);
  const [attendeeSegments, setAttendeeSegments] = useState<ISegment[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (props.documentId) {
        const result = await props.documentDataStore.getByLink(props.documentId);
        setDocument(result);
      }
    };
    void fetchData();
  }, [props.documentId]);

  useEffect(() => {
    const fetchData = async () => {
      if (props.documentId) {
        const result = await props.segmentDocumentStore.getAllForDocumentId(props.documentId);
        setSegmentDocuments(result);
      }
    };
    void fetchData();
  }, [props.documentId]);

  useEffect(() => {
    const fetchData = async () => {
      if (segmentDocuments.length > 0) {
        const peopleIds = uniqBy(segmentDocuments, 'personId')
          .filter((segmentDocument) => !!segmentDocument.personId)
          .map((segmentDocument) => segmentDocument.personId);

        const people = await props.personDataStore.getBulk(peopleIds);
        setPeople(people);
      }
    };
    void fetchData();
  }, [segmentDocuments.length]);

  useEffect(() => {
    const fetchData = async () => {
      if (segmentDocuments.length > 0) {
        const segmentIds = uniqBy(segmentDocuments, 'segmentId')
          .filter((segmentDocument) => !!segmentDocument.segmentId)
          .map((segmentDocument) => segmentDocument.segmentId!);

        const segments = await props.timeDataStore.getBulk(segmentIds);
        setAttendeeSegments(segments);
      }
    };
    void fetchData();
  }, [segmentDocuments.length]);

  if (!document) {
    return null;
  }

  // TODO: Fill out these
  const currentUserMeetings = [] as any;
  const segmentsWithDocumentInDescription = [] as any;
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
          Meetings where this document is listed in the description
        </Typography>
        <MeetingList
          segments={segmentsWithDocumentInDescription}
          personStore={props.personDataStore}
        />
        <Typography variant="h6" className={classes.smallHeading}>
          Meetings where you edited this document
        </Typography>
        <MeetingList segments={currentUserMeetings} personStore={props.personDataStore} />
        <Typography variant="h6" className={classes.smallHeading}>
          Meetings where attendees edited this document
        </Typography>
        <MeetingList segments={attendeeSegments} personStore={props.personDataStore} />
      </div>
    </React.Fragment>
  );
};

export default ExpandedDocument;
