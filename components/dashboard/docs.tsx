import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import DocumentRow from '../docs/document-row';
import panelStyles from '../shared/panel-styles';
import TopBar from '../shared/top-bar';
import { IStore } from '../store/use-store';

const AllDocuments = (props: IStore & { selectedDocumentId: string | null }) => {
  const docs = props.docDataStore.getDocs();
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

const DocumentsForToday = (props: IStore & { selectedDocumentId: string | null }) => {
  const classes = panelStyles();
  const docsForToday = props.docDataStore.getDocumentsForDay(
    props.timeDataStore,
    props.driveActivityStore,
    new Date(),
  );
  return (
    <div className={classes.rowNoBorder}>
      {docsForToday.map((doc) => (
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

const DocumentsForThisWeek = (props: IStore & { selectedDocumentId: string | null }) => {
  const classes = panelStyles();
  const docsForThisWeek = props.docDataStore.getDocumentsForThisWeek(
    props.timeDataStore,
    props.driveActivityStore,
  );
  return (
    <div className={classes.rowNoBorder}>
      {docsForThisWeek.map((doc) => (
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
  today: 'Documents for today',
  'this-week': 'Documents for this week',
  all: 'All Documents',
};

const Documents = (props: IStore) => {
  const classes = panelStyles();
  const [currentTab, changeTab] = useState<tab>('this-week');
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
        <Grid container spacing={2}>
          <Grid item>
            <Button
              variant="contained"
              className={currentTab === 'today' ? classes.selected : classes.unSelected}
              disableElevation
              onClick={() => changeTab('today')}
            >
              Today
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              className={currentTab === 'this-week' ? classes.selected : classes.unSelected}
              disableElevation
              onClick={() => changeTab('this-week')}
            >
              This Week
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              className={currentTab === 'all' ? classes.selected : classes.unSelected}
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
