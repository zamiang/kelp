import Typography from '@material-ui/core/Typography';
import { formatDistanceToNow, getDayOfYear, subDays } from 'date-fns';
import { sortBy, uniqBy } from 'lodash';
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
  documentId: string;
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
const daysToLookBack = 7;
const getFeaturedDocuments = async (props: IStore) => {
  const currentDate = new Date();
  const week = getWeek(currentDate);
  const result = await props.segmentDocumentStore.getAllForWeek(week);
  const documents = await props.documentDataStore.getBulk(result.map((r) => r.documentId));

  // For documents edited by the current users that may not be associated with a meeting
  const driveActivity = await props.driveActivityStore.getCurrentUserDriveActivity();
  const filterTime = subDays(currentDate, daysToLookBack);
  const currentUserDocuments = await Promise.all(
    uniqBy(
      driveActivity.filter((item) => item.time > filterTime),
      'documentId',
    ).map(async (item) => {
      const document = await props.documentDataStore.getById(item.documentId!);
      return {
        documentId: document!.id,
        document: document!,
        meetings: [] as any,
        nextMeetingStartsAt: undefined,
        text: `You edited this document ${formatDistanceToNow(item.time)} ago`,
      } as IFeaturedDocument;
    }),
  );

  // Hash of documentId to meeting array
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
          ? `${meetings[0].summary} ${formatDistanceToNow(nextMeetingStartAt)} ago`
          : undefined;
      return {
        documentId: document.id,
        document,
        meetings,
        nextMeetingStartAt,
        text,
      } as IFeaturedDocument;
    })
    .filter((m) => m.nextMeetingStartAt);

  return uniqBy(sortBy(d, 'nextMeetingStartAt').concat(currentUserDocuments), 'documentId').slice(
    0,
    maxResult,
  );
};

const AllDocuments = (props: {
  store: IStore;
  selectedDocumentId: string | null;
  setDocumentId?: (id: string) => void;
}) => {
  const classes = rowStyles();
  const [documents, setDocuments] = useState<IDocument[]>([]);
  const [topDocuments, setTopDocuments] = useState<IFeaturedDocument[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await props.store.documentDataStore.getAll();
      setDocuments(result.sort((a, b) => (a.name!.toLowerCase() < b.name!.toLowerCase() ? -1 : 1)));
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
          <Typography className={classes.rowText} variant="h6">
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
        {documents.map((document) => (
          <DocumentRow
            key={document.id}
            doc={document}
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
  const [documents, setDocuments] = useState<IDocument[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      const result = await props.store.segmentDocumentStore.getAllForDay(getDayOfYear(new Date()));
      const documents = await props.store.documentDataStore.getBulk(
        result.map((r) => r.documentId),
      );
      setDocuments(
        documents.sort((a, b) => (a.name!.toLowerCase() < b.name!.toLowerCase() ? -1 : 1)),
      );
    };
    void fetchData();
  }, [props.store.lastUpdated, props.store.isLoading]);
  return (
    <div className={classes.section}>
      {documents.map((document: IDocument) => (
        <DocumentRow
          key={document.id}
          doc={document}
          store={props.store}
          selectedDocumentId={props.selectedDocumentId}
        />
      ))}
    </div>
  );
};

const Documents = (props: { store: IStore; setDocumentId?: (id: string) => void }) => {
  const classes = panelStyles();
  const selectedDocumentId = useLocation().pathname.replace('/documents/', '').replace('/', '');

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
