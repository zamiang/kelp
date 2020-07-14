import { Drawer, Typography } from '@material-ui/core';
import React, { useState } from 'react';
import { IRouteProps } from '../dashboard';
import panelStyles from '../shared/panel-styles';
import DocumentRow from './document-row';
import ExpandedDocument from './expand-document';

const DocumentList = (props: IRouteProps) => {
  const docs = props.docDataStore.getDocs();
  const [selectedDocumentId, setSelectedDocumentId] = useState(
    props.routeId || (docs[0] ? docs[0].id : null),
  );
  const selectedDocument = selectedDocumentId
    ? props.docDataStore.getByLink(selectedDocumentId)
    : null;
  const styles = panelStyles();
  return (
    <React.Fragment>
      <div className={styles.panel}>
        <div className={styles.row}>
          <Typography className={styles.title}>Documents you edited recently</Typography>
          {docs.map((doc) => (
            <DocumentRow
              key={doc.id}
              doc={doc}
              setSelectedDocumentId={setSelectedDocumentId}
              selectedDocumentId={selectedDocumentId}
            />
          ))}
        </div>
        <div className={styles.row}>
          <Typography className={styles.title}>
            Documents with activity from people you are in meetings with [today]
          </Typography>
        </div>
      </div>
      <Drawer
        open={selectedDocumentId ? true : false}
        classes={{
          paper: styles.dockedPanel,
        }}
        anchor="right"
        variant="persistent"
      >
        {selectedDocumentId && selectedDocument && (
          <ExpandedDocument
            document={selectedDocument}
            handlePersonClick={props.handlePersonClick}
            personStore={props.personDataStore}
            docStore={props.docDataStore}
            emailStore={props.emailStore}
            driveActivityStore={props.driveActivityStore}
          />
        )}
      </Drawer>
    </React.Fragment>
  );
};

export default DocumentList;
