import Grid from '@material-ui/core/Grid';
import ListItem from '@material-ui/core/ListItem';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import EventIcon from '@material-ui/icons/Event';
import clsx from 'clsx';
import { format } from 'date-fns';
import React from 'react';
import { useHistory } from 'react-router-dom';
import useRowStyles from '../shared/row-styles';
import { ISegment } from '../store/models/segment-model';
import { IStore } from '../store/use-store';

const useStyles = makeStyles((theme) => ({
  time: {
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
  image: {
    display: 'block',
    minHeight: 22,
  },
  imageContainer: {
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
  paddingLeft: { paddingLeft: theme.spacing(1), marginLeft: 8 },
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

const MeetingSearchResult = (props: { meeting: ISegment; store: IStore }) => {
  const router = useHistory();
  const classes = useStyles();
  const rowStyles = useRowStyles();
  const handleClick = () => {
    void router.push(`/search/meetings/${props.meeting.id}${window.location.search}`);
  };
  return (
    <ListItem
      onClick={handleClick}
      className={clsx(
        'ignore-react-onclickoutside',
        rowStyles.row,
        classes.row,
        props.meeting.selfResponseStatus === 'accepted' && rowStyles.rowDefault,
        props.meeting.selfResponseStatus === 'tentative' && rowStyles.rowHint,
        props.meeting.selfResponseStatus === 'declined' && rowStyles.rowLineThrough,
        props.meeting.selfResponseStatus === 'needsAction' && rowStyles.rowHint,
      )}
    >
      <Grid container spacing={1} alignItems="center" justify="flex-start">
        <Grid item className={classes.imageContainer}>
          <EventIcon className={classes.image} />
        </Grid>
        <Grid item xs={11}>
          <Grid container alignItems="center" justify="space-between">
            <Grid item zeroMinWidth>
              <Typography variant="body2">
                <b>{props.meeting.summary || '(no title)'}</b>
              </Typography>
            </Grid>
            <Grid item className={classes.time}>
              <Typography variant="caption" color="textSecondary">
                {format(props.meeting.start, 'MMM do, yyyy')} {format(props.meeting.start, 'p')} –{' '}
                {format(props.meeting.end, 'p')}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </ListItem>
  );
};

export default MeetingSearchResult;
