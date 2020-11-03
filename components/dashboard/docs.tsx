import Typography from '@material-ui/core/Typography';
import { useRouter } from 'next/router';
import React from 'react';
import DocumentRow from '../../components/docs/document-row';
import panelStyles from '../../components/shared/panel-styles';
import { IDoc } from '../store/doc-store';
import { IStore } from '../store/use-store';

const Documents = (props: IStore) => {
  const classes = panelStyles();
  const docs = props.docDataStore.getDocs();
  const selectedDocumentId = useRouter().query.slug as string;
  const driveActivityIdsForToday = props.timeDataStore.getDriveActivityIdsForToday();
  const docsForToday = driveActivityIdsForToday
    .map((id) => id && props.driveActivityStore.getById(id))
    .map(
      (driveActivity) =>
        driveActivity && driveActivity.link && props.docDataStore.getByLink(driveActivity.link),
    )
    .filter((doc) => doc && doc.id) as IDoc[];
  return (
    <div className={classes.panel}>
      <div className={classes.section}>
        {docsForToday.length > 0 && (
          <div className={classes.rowNoBorder}>
            <Typography variant="caption">Documents for Today</Typography>
            {docsForToday.map((doc) => (
              <DocumentRow key={doc.id} doc={doc} selectedDocumentId={selectedDocumentId} />
            ))}
          </div>
        )}
      </div>
      <div className={classes.section}>
        {docs.length > 0 && (
          <div className={classes.rowNoBorder}>
            <Typography variant="caption" className={classes.title}>
              Documents with recent activity
            </Typography>
            {docs.map((doc) => (
              <DocumentRow key={doc.id} doc={doc} selectedDocumentId={selectedDocumentId} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Documents;
