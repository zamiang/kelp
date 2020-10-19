import Typography from '@material-ui/core/Typography';
import { useRouter } from 'next/router';
import React from 'react';
import DocumentRow from '../../components/docs/document-row';
import panelStyles from '../../components/shared/panel-styles';
import { IStore } from '../store/use-store';

const Documents = (props: IStore) => {
  const docs = props.docDataStore.getDocs();
  const selectedDocumentId = useRouter().query.slug as string;
  const driveActivityIdsForToday = props.timeDataStore.getDriveActivityIdsForToday();
  const docsForToday = driveActivityIdsForToday
    .map((id) => id && props.driveActivityStore.getById(id))
    .filter((driveActivity) => driveActivity && driveActivity.link)
    .map((driveActivity) => props.docDataStore.getByLink(driveActivity!.link!)!);
  const styles = panelStyles();
  return (
    <React.Fragment>
      {docsForToday.length > 0 && (
        <div className={styles.row}>
          <Typography className={styles.title}>Documents for Today</Typography>
          {docsForToday.map((doc) => (
            <DocumentRow key={doc.id} doc={doc} selectedDocumentId={selectedDocumentId} />
          ))}
        </div>
      )}
      {docs.length > 0 && (
        <div className={styles.row}>
          <Typography className={styles.title}>Documents you edited recently</Typography>
          {docs.map((doc) => (
            <DocumentRow key={doc.id} doc={doc} selectedDocumentId={selectedDocumentId} />
          ))}
        </div>
      )}
    </React.Fragment>
  );
};

export default Documents;
