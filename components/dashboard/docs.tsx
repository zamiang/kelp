import Typography from '@material-ui/core/Typography';
import { useRouter } from 'next/router';
import React from 'react';
import DocumentRow from '../../components/docs/document-row';
import panelStyles from '../../components/shared/panel-styles';
import { IStore } from '../store/use-store';

const Documents = (props: IStore) => {
  const docs = props.docDataStore.getDocs();
  const selectedDocumentId = useRouter().query.slug as string;
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

export default Documents;
