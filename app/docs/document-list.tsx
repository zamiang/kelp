import { Drawer, Grid, ListItem, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import clsx from 'clsx';
import { format } from 'date-fns';
import React, { useState } from 'react';
import { IRouteProps } from '../dashboard';
import panelStyles from '../shared/panel-styles';
import { IDoc } from '../store/doc-store';
import ExpandedDocument from './expand-document';

// </Grid>style={{ width: 40, paddingRight: 16 }}>
const useStyles = makeStyles((theme) => ({
  document: {
    background: 'transparent',
    borderLeft: `2px solid ${theme.palette.secondary.main}`,
    transition: 'background 0.3s, border-color 0.3s, opacity 0.3s',
    opacity: 1,
    marginBottom: theme.spacing(1),
    paddingTop: theme.spacing(1),
    paddingBottom: 0,
    '& > *': {
      borderBottom: 'unset',
    },
    '&.MuiListItem-button:hover': {
      opacity: 0.8,
      borderColor: theme.palette.secondary.main,
    },
  },
  documentSelected: {
    borderColor: theme.palette.info.main,
    background: 'rgba(0, 0, 0, 0.04)', // unsure where this comes from
    '&.MuiListItem-button:hover': {
      borderColor: theme.palette.info.main,
    },
  },
}));

const Doc = (props: {
  doc: IDoc;
  setSelectedDocumentId: (id: string) => void;
  selectedDocumentId: string | null;
}) => {
  const classes = useStyles();
  return (
    <ListItem
      button={true}
      onClick={() => props.setSelectedDocumentId(props.doc.id)}
      className={clsx(
        classes.document,
        props.selectedDocumentId === props.doc.id && classes.documentSelected,
      )}
    >
      <Grid container spacing={2} alignItems="center" wrap="nowrap">
        <Grid item>
          <InsertDriveFileIcon />
        </Grid>
        <Grid item xs={10}>
          <Typography noWrap variant="body1">
            {props.doc.name}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Last updated on {format(new Date(props.doc.updatedAt!), "MMMM do, yyyy 'at' hh:mm a")}
          </Typography>
        </Grid>
      </Grid>
    </ListItem>
  );
};

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
        {docs.map((doc) => (
          <Doc
            key={doc.id}
            doc={doc}
            setSelectedDocumentId={setSelectedDocumentId}
            selectedDocumentId={selectedDocumentId}
          />
        ))}
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
