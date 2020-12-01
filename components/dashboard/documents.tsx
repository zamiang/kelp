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
  const docs = props.documentDataStore.getDocs();
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
  props: IStore & { selectedDocumentId: string | null; noLeftMargin?: boolean },
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
          noLeftMargin={props.noLeftMargin}
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
  today: 'Documents for today',
  'this-week': 'Documents for this week',
  all: 'All Documents',
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
        <Grid container spacing={2}>
          <Grid item>
            <Button
              variant="contained"
              className={currentTab === 'today' ? buttonClasses.selected : buttonClasses.unSelected}
              disableElevation
              disabled={currentTab === 'today'}
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
              disabled={currentTab === 'this-week'}
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
              disabled={currentTab === 'all'}
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
