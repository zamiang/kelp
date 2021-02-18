import Grid from '@material-ui/core/Grid';
import ListItem from '@material-ui/core/ListItem';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { format } from 'date-fns';
import React from 'react';
import { useHistory } from 'react-router-dom';
import useRowStyles from '../shared/row-styles';
import { IDocument } from '../store/models/document-model';
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
    minHeight: 22,
    minWidth: 22,
  },
  time: { minWidth: 160, maxWidth: 180, textAlign: 'right' },
  row: {
    margin: 0,
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.divider}`,
    borderRadius: 0,
    '&.MuiListItem-button:hover': {
      borderColor: theme.palette.divider,
    },
  },
}));

const DocumentSearchResult = (props: { doc: IDocument; store: IStore }) => {
  const router = useHistory();
  const rowStyles = useRowStyles();
  const classes = useStyles();
  const handleClick = () => {
    void router.push(`/search/docs/${props.doc.id}${window.location.search}`);
  };
  return (
    <ListItem
      onClick={handleClick}
      className={clsx(
        'ignore-react-onclickoutside',
        rowStyles.row,
        rowStyles.rowDefault,
        classes.row,
      )}
    >
      <Grid container spacing={1} alignItems="center" justify="flex-start">
        <Grid item className={classes.imageContainer}>
          <img src={props.doc.iconLink} className={classes.image} />
        </Grid>
        <Grid item xs={11}>
          <Grid container alignItems="center" justify="space-between">
            <Grid item zeroMinWidth>
              <Typography noWrap variant="body2">
                <span style={{ fontWeight: 500 }}>{props.doc.name}</span>
              </Typography>
            </Grid>
            <Grid item className={classes.time}>
              <Typography variant="caption" color="textSecondary">
                {format(new Date(props.doc.updatedAt!), "MMM do, yyyy 'at' hh:mm a")}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </ListItem>
  );
};

export default DocumentSearchResult;
