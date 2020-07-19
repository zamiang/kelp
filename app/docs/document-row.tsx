import Grid from '@material-ui/core/Grid';
import ListItem from '@material-ui/core/ListItem';
import Typography from '@material-ui/core/Typography';
import SlideShowIcon from '@material-ui/icons/InsertChart';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import SheetsIcon from '@material-ui/icons/ViewList';
import clsx from 'clsx';
import { format } from 'date-fns';
import React from 'react';
import useRowStyles from '../shared/row-styles';
import { IDoc } from '../store/doc-store';

const iconHash = {
  UNKNOWN: <InsertDriveFileIcon />,
  GOOGLE_SHEET: <SheetsIcon />,
  GOOGLE_SLIDES: <SlideShowIcon />,
  GOOGLE_DOC: <InsertDriveFileIcon />,
};

const DocumentRow = (props: {
  doc: IDoc;
  setSelectedDocumentId: (id: string) => void;
  selectedDocumentId: string | null;
}) => {
  const rowStyles = useRowStyles();
  return (
    <ListItem
      button={true}
      onClick={() => props.setSelectedDocumentId(props.doc.id)}
      className={clsx(
        rowStyles.row,
        rowStyles.rowDefault,
        props.selectedDocumentId === props.doc.id && rowStyles.rowPrimaryMain,
      )}
    >
      <Grid container spacing={1}>
        <Grid
          item
          className={clsx(
            rowStyles.border,
            rowStyles.borderSecondaryMain,
            props.selectedDocumentId === props.doc.id && rowStyles.borderInfoMain,
          )}
        ></Grid>
        <Grid item>{iconHash[props.doc.documentType]}</Grid>
        <Grid item style={{ flex: 1 }}>
          <Typography variant="body1">{props.doc.name}</Typography>
          <Typography variant="caption" color="textSecondary">
            Last updated on {format(new Date(props.doc.updatedAt!), "MMMM do, yyyy 'at' hh:mm a")}
          </Typography>
        </Grid>
      </Grid>
    </ListItem>
  );
};

export default DocumentRow;
