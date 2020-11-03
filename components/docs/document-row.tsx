import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import ListItem from '@material-ui/core/ListItem';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { format } from 'date-fns';
import Link from 'next/link';
import React from 'react';
import useRowStyles from '../shared/row-styles';
import { IDoc } from '../store/doc-store';

const useStyles = makeStyles((theme) => ({
  imageContainer: {
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
  image: {
    display: 'block',
    width: '100%',
  },
  time: { minWidth: 160, maxWidth: 180 },
  row: {
    margin: 0,
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    borderTop: `1px solid ${theme.palette.divider}`,
    borderRadius: 0,
    '&.MuiListItem-button:hover': {
      borderColor: theme.palette.divider,
    },
  },
}));

const DocumentRow = (props: { doc: IDoc; selectedDocumentId: string | null }) => {
  const rowStyles = useRowStyles();
  const classes = useStyles();
  return (
    <Link href={`?tab=docs&slug=${props.doc.id}`}>
      <ListItem
        button={true}
        className={clsx(
          'ignore-react-onclickoutside',
          rowStyles.row,
          rowStyles.rowDefault,
          classes.row,
          props.selectedDocumentId === props.doc.id && rowStyles.pinkBackground,
        )}
      >
        <Grid container spacing={1} alignItems="center">
          <Grid item className={classes.imageContainer}>
            <img src={props.doc.iconLink} className={classes.image} />
          </Grid>
          <Grid item className={classes.text} zeroMinWidth xs>
            <Typography noWrap variant="body2">
              <b>{props.doc.name}</b>
            </Typography>
          </Grid>
          <Grid item className={classes.time}>
            <Typography variant="caption" color="textSecondary">
              {format(new Date(props.doc.updatedAt!), "MMM do, yyyy 'at' hh:mm a")}
            </Typography>
          </Grid>
        </Grid>
      </ListItem>
    </Link>
  );
};

export default DocumentRow;
