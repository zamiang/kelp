import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import { getDay } from 'date-fns';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import DocumentRow from '../documents/document-row';
import useButtonStyles from '../shared/button-styles';
import { getWeek } from '../shared/date-helpers';
import panelStyles from '../shared/panel-styles';
import TopBar from '../shared/top-bar';
import { IDocument } from '../store/models/document-model';
import { IStore } from '../store/use-store';

const AllDocuments = (props: IStore & { selectedDocumentId: string | null }) => {
  const [docs, setDocs] = useState<IDocument[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      const result = await props.documentDataStore.getAll();
      setDocs(result.sort((a, b) => (a.name! < b.name! ? -1 : 1)));
    };
    void fetchData();
  }, []);

  const classes = panelStyles();
  return (
    <div className={classes.rowNoBorder}>
      {docs.map((doc) => (
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

export const DocumentsForToday = (
  props: IStore & { selectedDocumentId: string | null; isSmall?: boolean },
) => {
  const classes = panelStyles();
  const [docs, setDocs] = useState<IDocument[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      const result = await props.segmentDocumentStore.getForDay(getDay(new Date()));
      const documents = await props.documentDataStore.getBulk(result.map((r) => r.documentId));
      setDocs(documents.sort((a, b) => (a.name! < b.name! ? -1 : 1)));
    };
    void fetchData();
  }, []);
  return (
    <div className={classes.rowNoBorder}>
      {docs.map((doc: IDocument) => (
        <DocumentRow
          key={doc.id}
          doc={doc}
          store={props}
          selectedDocumentId={props.selectedDocumentId}
          isSmall={props.isSmall}
        />
      ))}
    </div>
  );
};

const DocumentsForThisWeek = (props: IStore & { selectedDocumentId: string | null }) => {
  const classes = panelStyles();
  const [docs, setDocs] = useState<IDocument[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      const result = await props.segmentDocumentStore.getForWeek(getWeek(new Date()));
      const documents = await props.documentDataStore.getBulk(result.map((r) => r.documentId));
      setDocs(documents.sort((a, b) => (a.name! < b.name! ? -1 : 1)));
    };
    void fetchData();
  }, []);
  return (
    <div className={classes.rowNoBorder}>
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

type tab = 'today' | 'this-week' | 'all';

const titleHash = {
  today: 'Documents',
  'this-week': 'Documents',
  all: 'Documents',
};

const Documents = (props: IStore) => {
  const classes = panelStyles();
  const buttonClasses = useButtonStyles();
  const [currentTab, changeTab] = useState<tab>('all');
  const selectedDocumentId = useRouter().query.slug as string;
  const currentTitle = titleHash[currentTab];
  const tabHash = {
    all: <AllDocuments selectedDocumentId={selectedDocumentId} {...props} />,
    'this-week': <DocumentsForThisWeek selectedDocumentId={selectedDocumentId} {...props} />,
    today: <DocumentsForToday selectedDocumentId={selectedDocumentId} {...props} />,
  };
  return (
    <div className={classes.panel}>
      <TopBar title={currentTitle}>
        <Grid container spacing={2} justify="flex-end">
          <Grid item>
            <Button
              variant="contained"
              className={currentTab === 'today' ? buttonClasses.selected : buttonClasses.unSelected}
              disableElevation
              onClick={() => changeTab('today')}
            >
              Today
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              className={
                currentTab === 'this-week' ? buttonClasses.selected : buttonClasses.unSelected
              }
              disableElevation
              onClick={() => changeTab('this-week')}
            >
              This Week
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              className={currentTab === 'all' ? buttonClasses.selected : buttonClasses.unSelected}
              disableElevation
              onClick={() => changeTab('all')}
            >
              All
            </Button>
          </Grid>
        </Grid>
      </TopBar>
      {tabHash[currentTab]}
    </div>
  );
};

export default Documents;
