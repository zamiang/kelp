import { withAuthenticationRequired } from '@auth0/auth0-react';
import Typography from '@material-ui/core/Typography';
import { useRouter } from 'next/router';
import React from 'react';
import Container from '../../components/dashboard/container';
import DocumentRow from '../../components/docs/document-row';
import panelStyles from '../../components/shared/panel-styles';
import useStore from '../../components/store/use-store';

const Documents = () => {
  const store = useStore();
  const docs = store.docDataStore.getDocs();
  const selectedDocumentId = useRouter().pathname.replace('/dashboard/docs/', '');
  const styles = panelStyles();
  return (
    <Container {...store}>
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
    </Container>
  );
};

export default withAuthenticationRequired(Documents);
