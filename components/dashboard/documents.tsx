import Typography from '@material-ui/core/Typography';
import { format, getDayOfYear } from 'date-fns';
import { sortBy } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import DocumentRow from '../documents/document-row';
import { getWeek } from '../shared/date-helpers';
import panelStyles from '../shared/panel-styles';
import rowStyles from '../shared/row-styles';
import TopBar from '../shared/top-bar';
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
  console.log(meetingsForDocument, '<<<meetings for document<<<<', documents);
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

const AllDocuments = (props: IStore & { selectedDocumentId: string | null }) => {
  const classes = rowStyles();
  const [docs, setDocs] = useState<IDocument[]>([]);
  const [topDocuments, setTopDocuments] = useState<IFeaturedDocument[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await props.documentDataStore.getAll();
      setDocs(result.sort((a, b) => (a.name!.toLowerCase() < b.name!.toLowerCase() ? -1 : 1)));
    };
    void fetchData();
  }, [props.lastUpdated, props.isLoading]);

  useEffect(() => {
    const fetchData = async () => {
      const featuredDocuments = await getFeaturedDocuments(props);
      setTopDocuments(featuredDocuments);
    };
    void fetchData();
  }, [props.lastUpdated, props.isLoading]);

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
              store={props}
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
            store={props}
            selectedDocumentId={props.selectedDocumentId}
          />
        ))}
      </div>
    </React.Fragment>
  );
};

export const DocumentsForToday = (
  props: IStore & { selectedDocumentId: string | null; isSmall?: boolean },
) => {
  const classes = panelStyles();
  const [docs, setDocs] = useState<IDocument[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      const result = await props.segmentDocumentStore.getAllForDay(getDayOfYear(new Date()));
      const documents = await props.documentDataStore.getBulk(result.map((r) => r.documentId));
      setDocs(documents.sort((a, b) => (a.name!.toLowerCase() < b.name!.toLowerCase() ? -1 : 1)));
    };
    void fetchData();
  }, [props.lastUpdated, props.isLoading]);
  return (
    <div className={classes.section}>
      {docs.map((doc: IDocument) => (
        <DocumentRow
          key={doc.id}
          doc={doc}
          store={props}
          selectedDocumentId={props.selectedDocumentId}
        />
      ))}
    </div>
  );
};

const Documents = (props: { store: IStore; hideHeading?: boolean }) => {
  const classes = panelStyles();
  const selectedDocumentId = useLocation().pathname.replace('/docs/', '').replace('/', '');

  if (props.hideHeading) {
    return <AllDocuments selectedDocumentId={selectedDocumentId} {...props.store} />;
  }
  return (
    <div className={classes.panel}>
      <TopBar title="Documents" />
      <AllDocuments selectedDocumentId={selectedDocumentId} {...props.store} />
    </div>
  );
};

export default Documents;
