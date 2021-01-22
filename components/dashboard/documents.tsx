import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import DocumentRow from '../documents/document-row';
import useButtonStyles from '../shared/button-styles';
import panelStyles from '../shared/panel-styles';
import TopBar from '../shared/top-bar';
import { IStore } from '../store/use-store';

const AllDocuments = (props: IStore & { selectedDocumentId: string | null }) => {
  const docs = props.documentDataStore.getDocs().sort((a, b) => (a.name! < b.name! ? -1 : 1));
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
  const docsForToday = props.documentDataStore.getDocumentsForDay(
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
          isSmall={props.isSmall}
        />
      ))}
    </div>
  );
};

const DocumentsForThisWeek = (props: IStore & { selectedDocumentId: string | null }) => {
  const classes = panelStyles();
  const docsForThisWeek = props.documentDataStore.getDocumentsForThisWeek(
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
  console.log('currenttab', currentTab, currentTab === 'today');
  return (
    <div className={classes.panel}>
      <TopBar title={currentTitle}>
        <Grid container spacing={2}>
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
