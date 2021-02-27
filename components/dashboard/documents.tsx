import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import clsx from 'clsx';
import { getDayOfYear } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
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
      setDocs(result.sort((a, b) => (a.name!.toLowerCase() < b.name!.toLowerCase() ? -1 : 1)));
    };
    void fetchData();
  }, [props.lastUpdated, props.isLoading]);

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
      const result = await props.segmentDocumentStore.getAllForDay(getDayOfYear(new Date()));
      const documents = await props.documentDataStore.getBulk(result.map((r) => r.documentId));
      setDocs(documents.sort((a, b) => (a.name!.toLowerCase() < b.name!.toLowerCase() ? -1 : 1)));
    };
    void fetchData();
  }, [props.lastUpdated, props.isLoading]);
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
      const result = await props.segmentDocumentStore.getAllForWeek(getWeek(new Date()));
      const documents = await props.documentDataStore.getBulk(result.map((r) => r.documentId));
      setDocs(documents.sort((a, b) => (a.name!.toLowerCase() < b.name!.toLowerCase() ? -1 : 1)));
    };
    void fetchData();
  }, [props.lastUpdated, props.isLoading]);
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

const Documents = (props: { store: IStore; hideHeading?: boolean }) => {
  const classes = panelStyles();
  const buttonClasses = useButtonStyles();
  const [currentTab, changeTab] = useState<tab>('all');
  const selectedDocumentId = useLocation().pathname.replace('/docs/', '').replace('/', '');
  const currentTitle = titleHash[currentTab];
  const tabHash = {
    all: <AllDocuments selectedDocumentId={selectedDocumentId} {...props.store} />,
    'this-week': <DocumentsForThisWeek selectedDocumentId={selectedDocumentId} {...props.store} />,
    today: <DocumentsForToday selectedDocumentId={selectedDocumentId} {...props.store} />,
  };
  if (props.hideHeading) {
    return tabHash[currentTab];
  }

  return (
    <div className={classes.panel}>
      <TopBar title={currentTitle}>
        <Grid container justify="flex-end" spacing={2}>
          <Grid item>
            <Button
              variant="contained"
              disableRipple
              className={clsx(
                currentTab === 'today' ? buttonClasses.selected : buttonClasses.unSelected,
              )}
              disableElevation
              onClick={() => changeTab('today')}
            >
              Today
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              disableRipple
              className={clsx(
                currentTab === 'this-week' ? buttonClasses.selected : buttonClasses.unSelected,
              )}
              disableElevation
              onClick={() => changeTab('this-week')}
            >
              This Week
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              disableRipple
              className={clsx(
                currentTab === 'all' ? buttonClasses.selected : buttonClasses.unSelected,
              )}
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
