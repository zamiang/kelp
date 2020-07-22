import Grid from '@material-ui/core/Grid';
import ListItem from '@material-ui/core/ListItem';
import Typography from '@material-ui/core/Typography';
import clsx from 'clsx';
import { format } from 'date-fns';
import React from 'react';
import { Link } from 'react-router-dom';
import useRowStyles from '../shared/row-styles';
import { IDoc } from '../store/doc-store';

const DocumentRow = (props: { doc: IDoc; selectedDocumentId: string | null }) => {
  const rowStyles = useRowStyles();
  return (
    <ListItem
      button={true}
      component={Link}
      to={`/dashboard/docs/${props.doc.id}`}
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
        <Grid item>
          <img src={props.doc.iconLink} />
        </Grid>
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
