import Typography from '@mui/material/Typography';
import { uniqBy } from 'lodash';
import React, { useEffect, useState } from 'react';
import DocumentRow, { MissingDocumentRow } from '../documents/document-row';
import { IDocument, IPerson, ISegmentDocument } from '../store/data-types';
import { IStore } from '../store/use-store';
import useExpandStyles from './expand-styles';
import { getTooltipText } from './tooltip-text';

const SegmentDocumentItem = (props: {
  store: IStore;
  segmentDocument: ISegmentDocument;
  isSmall?: boolean;
}) => {
  const [document, setDocument] = useState<IDocument | undefined>(undefined);
  const [person, setPerson] = useState<IPerson | undefined>(undefined);

  useEffect(() => {
    const fetchData = async () => {
      if (props.segmentDocument.documentId) {
        const result = await props.store.documentDataStore.getById(
          props.segmentDocument.documentId,
        );
        setDocument(result);
      }
    };
    void fetchData();
  }, [props.segmentDocument.documentId]);

  useEffect(() => {
    const fetchData = async () => {
      if (props.segmentDocument.personId) {
        const result = await props.store.personDataStore.getById(props.segmentDocument.personId);
        setPerson(result);
      }
    };
    void fetchData();
  }, [props.segmentDocument.personId]);

  if (!document) {
    return (
      <MissingDocumentRow
        segmentDocument={props.segmentDocument}
        isSmall={props.isSmall}
        store={props.store}
      />
    );
  }

  const tooltipText = getTooltipText(props.segmentDocument, person);
  return (
    <DocumentRow
      key={props.segmentDocument.id}
      store={props.store}
      document={document}
      selectedDocumentId={null}
      noMargins={props.isSmall}
      tooltipText={tooltipText}
    />
  );
};

const SegmentDocumentForNonAttendees = (props: {
  segmentDocumentsForNonAttendeesCount: number;
  segmentDocumentsForNonAttendees: ISegmentDocument[];
  store: IStore;
  isSmall?: boolean;
}) => {
  const [shouldDisplayNonAttendees, setShouldDisplayNonAttendees] = useState<boolean>(false);
  const classes = useExpandStyles();
  return (
    <div>
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
            store={props.store}
            segmentDocument={segmentDocument}
            isSmall={props.isSmall}
          />
        ))}
    </div>
  );
};

const SegmentDocumentList = (props: {
  segmentDocuments?: ISegmentDocument[];
  segmentDocumentsForAttendees?: ISegmentDocument[];
  segmentDocumentsFromPastMeetings?: ISegmentDocument[];
  segmentDocumentsForNonAttendees?: ISegmentDocument[];
  store: IStore;
  isSmall?: boolean;
}) => {
  const segmentsToRender =
    props.segmentDocuments && props.segmentDocuments.length > 0
      ? uniqBy(props.segmentDocuments, 'documentId')
      : uniqBy(
          (props.segmentDocumentsForAttendees || []).concat(
            props.segmentDocumentsFromPastMeetings || [],
          ),
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
  return (
    <React.Fragment>
      {segmentsToRender.length > 0 && (
        <div>
          {segmentsToRender.map((segmentDocument) => (
            <SegmentDocumentItem
              key={segmentDocument.id}
              store={props.store}
              segmentDocument={segmentDocument}
              isSmall={props.isSmall}
            />
          ))}
        </div>
      )}
      {segmentDocumentsForNonAttendeesCount > 0 && (
        <SegmentDocumentForNonAttendees
          segmentDocumentsForNonAttendeesCount={segmentDocumentsForNonAttendeesCount}
          segmentDocumentsForNonAttendees={filteredSegmentDocumentsForNonAttendees}
          store={props.store}
          isSmall={props.isSmall}
        />
      )}
    </React.Fragment>
  );
};

export default SegmentDocumentList;
