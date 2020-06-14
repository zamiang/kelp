import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import ListItemText from '@material-ui/core/ListItemText';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import { format } from 'date-fns';
import React from 'react';
import { IRouteProps } from '../dashboard';
import panelStyles from '../shared/panel-styles';
import { IDoc } from '../store/doc-store';

const Doc = (props: { doc: IDoc }) => (
  <TableRow hover>
    <TableCell style={{ width: 40, paddingRight: 16 }}>
      <InsertDriveFileIcon />
    </TableCell>
    <TableCell>
      <Link color="textPrimary" target="_blank" href={props.doc.link || ''}>
        <ListItemText primary={props.doc.name} />
      </Link>
    </TableCell>
    <TableCell align="right">
      <Typography variant="caption" color="textSecondary">
        Last updated on {format(new Date(props.doc.updatedAt!), "MMMM do, yyyy 'at' hh:mm a")}
      </Typography>
    </TableCell>
  </TableRow>
);

const DocumentList = (props: IRouteProps) => {
  const docs = props.docDataStore.getDocs();
  const styles = panelStyles();
  return (
    <Grid item xs={12} className={styles.panel}>
      <Typography variant="h2" color="textPrimary" gutterBottom>
        Documents
      </Typography>
      <Table size="small">
        <TableBody>
          {docs.map((doc) => (
            <Doc key={doc.id} doc={doc} />
          ))}
        </TableBody>
      </Table>
    </Grid>
  );
};

export default DocumentList;
