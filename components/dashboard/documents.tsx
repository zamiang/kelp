import Typography from '@material-ui/core/Typography';
import { format, getDayOfYear } from 'date-fns';
import { sortBy } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import DocumentRow from '../documents/document-row';
import { getWeek } from '../shared/date-helpers';
import panelStyles from '../shared/panel-styles';
import rowStyles from '../shared/row-styles';
import { IDocument } from '../store/models/document-model';
import { ISegment } from '../store/models/segment-model';
import { IStore } from '../store/use-store';

interface IFeaturedDocument {
  document: IDocument;
  meetings: ISegment[];
  nextMeetingStartAt?: Date;
  text?: string;
}

/**
 * Gets documents in the featured section by looking through meetings for the coming week
 * Finds meeetings documents associated with those meetings
 * It sorts in decending order so upcoming meetings are next
 */
const maxResult = 5;
const getFeaturedDocuments = async (props: IStore) => {
  const currentDate = new Date();
  const week = getWeek(currentDate);
  const result = await props.segmentDocumentStore.getAllForWeek(week);
  const documents = await props.documentDataStore.getBulk(result.map((r) => r.documentId));

  // Hash of personId to meeting array
  const meetingsForDocument: { [id: string]: ISegment[] } = {};

  await Promise.all(
    result.map(async (r) => {
      if (!r.segmentId) {
        return;
      }
      const meeting = await props.timeDataStore.getById(r.segmentId);
      const documentId = r.documentId;
      if (meeting) {
        if (documentId && meetingsForDocument[documentId]) {
          meetingsForDocument[documentId].push(meeting);
        } else if (documentId) {
          meetingsForDocument[documentId] = [meeting];
        }
      }
    }),
  );
  const d = documents
    .map((document) => {
      const meetings = sortBy(meetingsForDocument[document.id], 'start');
      const nextMeetingStartAt = meetings[0] ? meetings[0].start : undefined;
      const text =
        meetings[0] && nextMeetingStartAt
          ? `${meetings[0].summary} on ${format(nextMeetingStartAt, 'EEEE, MMMM d')}`
          : undefined;
      return {
        document,
        meetings,
        nextMeetingStartAt,
        text,
      };
    })
    .filter((m) => m.nextMeetingStartAt);

  return sortBy(d, 'nextMeetingStartAt').slice(0, maxResult);
};

const AllDocuments = (props: {
  store: IStore;
  selectedDocumentId: string | null;
  setDocumentId?: (id: string) => void;
}) => {
  const classes = rowStyles();
  const [docs, setDocs] = useState<IDocument[]>([]);
  const [topDocuments, setTopDocuments] = useState<IFeaturedDocument[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await props.store.documentDataStore.getAll();
      setDocs(result.sort((a, b) => (a.name!.toLowerCase() < b.name!.toLowerCase() ? -1 : 1)));
    };
    void fetchData();
  }, [props.store.lastUpdated, props.store.isLoading]);

  useEffect(() => {
    const fetchData = async () => {
      const featuredDocuments = await getFeaturedDocuments(props.store);
      setTopDocuments(featuredDocuments);
      if (featuredDocuments[0] && featuredDocuments[0].document && props.setDocumentId) {
        props.setDocumentId(featuredDocuments[0].document.id);
      }
    };
    void fetchData();
  }, [props.store.lastUpdated, props.store.isLoading]);

  return (
    <React.Fragment>
      {topDocuments.length > 0 && (
        <div className={classes.rowHighlight}>
          <Typography className={classes.rowText} variant="body2">
            Recent documents
          </Typography>
          {topDocuments.map((doc) => (
            <DocumentRow
              key={doc.document.id}
              doc={doc.document}
              store={props.store}
              selectedDocumentId={props.selectedDocumentId}
              text={doc.text}
            />
          ))}
        </div>
      )}
      <div>
        {docs.map((doc) => (
          <DocumentRow
            key={doc.id}
            doc={doc}
            store={props.store}
            selectedDocumentId={props.selectedDocumentId}
          />
        ))}
      </div>
    </React.Fragment>
  );
};

export const DocumentsForToday = (props: {
  store: IStore;
  selectedDocumentId: string | null;
  isSmall?: boolean;
}) => {
  const classes = panelStyles();
  const [docs, setDocs] = useState<IDocument[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      const result = await props.store.segmentDocumentStore.getAllForDay(getDayOfYear(new Date()));
      const documents = await props.store.documentDataStore.getBulk(
        result.map((r) => r.documentId),
      );
      setDocs(documents.sort((a, b) => (a.name!.toLowerCase() < b.name!.toLowerCase() ? -1 : 1)));
    };
    void fetchData();
  }, [props.store.lastUpdated, props.store.isLoading]);
  return (
    <div className={classes.section}>
      {docs.map((doc: IDocument) => (
        <DocumentRow
          key={doc.id}
          doc={doc}
          store={props.store}
          selectedDocumentId={props.selectedDocumentId}
        />
      ))}
    </div>
  );
};

const Documents = (props: { store: IStore; setDocumentId?: (id: string) => void }) => {
  const classes = panelStyles();
  const selectedDocumentId = useLocation().pathname.replace('/docs/', '').replace('/', '');

  return (
    <div className={classes.panel}>
      <AllDocuments
        selectedDocumentId={selectedDocumentId}
        setDocumentId={props.setDocumentId}
        store={props.store}
      />
    </div>
  );
};

export default Documents;
