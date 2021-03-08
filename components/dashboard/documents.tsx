import Typography from '@material-ui/core/Typography';
import { getDayOfYear } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import DocumentRow from '../documents/document-row';
import { getWeek } from '../shared/date-helpers';
import panelStyles from '../shared/panel-styles';
import rowStyles from '../shared/row-styles';
import TopBar from '../shared/top-bar';
import { IDocument } from '../store/models/document-model';
import { IStore } from '../store/use-store';

const AllDocuments = (props: IStore & { selectedDocumentId: string | null }) => {
  const classes = rowStyles();
  const [docs, setDocs] = useState<IDocument[]>([]);
  const [topDocuments, setTopDocuments] = useState<IDocument[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await props.documentDataStore.getAll();
      setDocs(result.sort((a, b) => (a.name!.toLowerCase() < b.name!.toLowerCase() ? -1 : 1)));
    };
    void fetchData();
  }, [props.lastUpdated, props.isLoading]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await props.segmentDocumentStore.getAllForWeek(getWeek(new Date()));
      const documents = await props.documentDataStore.getBulk(result.map((r) => r.documentId));
      setTopDocuments(
        documents.sort((a, b) => (a.name!.toLowerCase() < b.name!.toLowerCase() ? -1 : 1)),
      );
    };
    void fetchData();
  }, [props.lastUpdated, props.isLoading]);

  return (
    <React.Fragment>
      {topDocuments.length > 0 && (
        <div className={classes.rowHighlight}>
          <Typography className={classes.rowText} variant="body2">
            Documents you may need
          </Typography>
          {topDocuments.map((doc) => (
            <DocumentRow
              key={doc.id}
              doc={doc}
              store={props}
              selectedDocumentId={props.selectedDocumentId}
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
