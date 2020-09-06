import Typography from '@material-ui/core/Typography';
import React from 'react';
import { useLocation } from 'react-router-dom';
import { IProps } from '../dashboard';
import panelStyles from '../shared/panel-styles';
import DocumentRow from './document-row';

const DocumentList = (props: IProps) => {
  const docs = props.docDataStore.getDocs();
  const selectedDocumentId = useLocation().pathname.replace('/dashboard/docs/', '');
  const styles = panelStyles();
  return (
    <React.Fragment>
      <div className={styles.row}>
        <Typography className={styles.title}>Documents you edited recently</Typography>
        {docs.map((doc) => (
          <DocumentRow key={doc.id} doc={doc} selectedDocumentId={selectedDocumentId} />
        ))}
      </div>
      <div className={styles.row}>
        <Typography className={styles.title}>
          Documents with activity from people you are in meetings with [today]
        </Typography>
      </div>
    </React.Fragment>
  );
};

export default DocumentList;
