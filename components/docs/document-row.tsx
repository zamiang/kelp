import Grid from '@material-ui/core/Grid';
import ListItem from '@material-ui/core/ListItem';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { format } from 'date-fns';
import { uniqBy } from 'lodash';
import Link from 'next/link';
import React from 'react';
import Avatars from '../person/avatars';
import useRowStyles from '../shared/row-styles';
import { IDoc } from '../store/doc-store';
import { IStore } from '../store/use-store';

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

const DocumentRow = (props: {
  doc: IDoc;
  selectedDocumentId: string | null;
  driveActivityStore: IStore['driveActivityStore'];
  personDataStore: IStore['personDataStore'];
}) => {
  const rowStyles = useRowStyles();
  const classes = useStyles();
  const activity = props.driveActivityStore.getDriveActivityForDocument(props.doc.id) || [];
  const people = uniqBy(activity, 'actorPersonId')
    .filter((activity) => !!activity.actorPersonId)
    .map((activity) => props.personDataStore.getPersonById(activity.actorPersonId!))
    .filter((person) => person && person.id)
    .slice(0, 5);
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
          <Grid item zeroMinWidth xs>
            <Typography noWrap variant="body2">
              <b>{props.doc.name}</b>
            </Typography>
          </Grid>
          <Grid item sm={2}>
            <Grid container spacing={1} alignItems="center">
              <Avatars people={people as any} />
            </Grid>
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
