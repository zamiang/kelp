import Grid from '@material-ui/core/Grid';
import ListItem from '@material-ui/core/ListItem';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { format } from 'date-fns';
import Link from 'next/link';
import React from 'react';
import useRowStyles from '../shared/row-styles';
import { ISegment } from '../store/time-store';

const useStyles = makeStyles((theme) => ({
  time: {},
  paddingLeft: { paddingLeft: theme.spacing(1), marginLeft: 8 },
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

const MeetingRow = (props: { meeting: ISegment; selectedMeetingId: string | null }) => {
  const classes = useStyles();
  const rowStyles = useRowStyles();
  return (
    <Link href={`?tab=meetings&slug=${props.meeting.id}`}>
      <ListItem
        button={true}
        className={clsx(
          'ignore-react-onclickoutside',
          rowStyles.row,
          classes.row,
          props.meeting.selfResponseStatus === 'accepted' && rowStyles.rowDefault,
          props.meeting.selfResponseStatus === 'tentative' && rowStyles.rowHint,
          props.meeting.selfResponseStatus === 'declined' && rowStyles.rowLineThrough,
          props.meeting.selfResponseStatus === 'needsAction' && rowStyles.rowHint,
          props.selectedMeetingId === props.meeting.id && rowStyles.rowPrimaryMain,
        )}
      >
        <Grid container spacing={1} alignItems="center">
          <Grid
            item
            className={clsx(
              rowStyles.border,
              classes.paddingLeft,
              props.meeting.selfResponseStatus === 'accepted' && rowStyles.borderSecondaryMain,
              props.meeting.selfResponseStatus === 'tentative' && rowStyles.borderSecondaryLight,
              props.meeting.selfResponseStatus === 'declined' && rowStyles.borderSecondaryLight,
              props.meeting.selfResponseStatus === 'needsAction' && rowStyles.borderSecondaryLight,
              props.selectedMeetingId === props.meeting.id && rowStyles.borderInfoMain,
            )}
          ></Grid>
          <Grid item zeroMinWidth xs>
            <Typography variant="body2">
              <b>{props.meeting.summary || '(no title)'}</b>
            </Typography>
          </Grid>
          <Grid item className={classes.time}>
            <Typography variant="caption" color="textSecondary">
              {format(props.meeting.start, 'p')} – {format(props.meeting.end, 'p')}
            </Typography>
          </Grid>
        </Grid>
      </ListItem>
    </Link>
  );
};

export default MeetingRow;
