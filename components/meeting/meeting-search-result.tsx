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

const useStyles = makeStyles(() => ({
  time: { textAlign: 'right' },
}));

const MeetingRow = (props: { meeting: ISegment; selectedMeetingId: string | null }) => {
  const classes = useStyles();
  const rowStyles = useRowStyles();
  const fieldRef = React.useRef<HTMLInputElement>(null);
  return (
    <ListItem
      ref={fieldRef}
      button={true}
      className={clsx(
        'ignore-react-onclickoutside',
        rowStyles.row,
        props.meeting.selfResponseStatus === 'accepted' && rowStyles.rowDefault,
        props.meeting.selfResponseStatus === 'tentative' && rowStyles.rowHint,
        props.meeting.selfResponseStatus === 'declined' && rowStyles.rowLineThrough,
        props.meeting.selfResponseStatus === 'needsAction' && rowStyles.rowHint,
        props.selectedMeetingId === props.meeting.id && rowStyles.rowPrimaryMain,
      )}
    >
      <Link href={`?tab=meetings&slug=${props.meeting.id}`}>
        <Grid container spacing={1}>
          <Grid
            item
            className={clsx(
              rowStyles.border,
              props.meeting.selfResponseStatus === 'accepted' && rowStyles.borderSecondaryMain,
              props.meeting.selfResponseStatus === 'tentative' && rowStyles.borderSecondaryLight,
              props.meeting.selfResponseStatus === 'declined' && rowStyles.borderSecondaryLight,
              props.meeting.selfResponseStatus === 'needsAction' && rowStyles.borderSecondaryLight,
              props.selectedMeetingId === props.meeting.id && rowStyles.borderInfoMain,
            )}
          ></Grid>
          <Grid item style={{ flex: 1 }}>
            <Typography variant="body1">{props.meeting.summary || '(no title)'}</Typography>
          </Grid>
          <Grid item className={classes.time}>
            <Typography variant="subtitle2">
              {format(props.meeting.start, 'p')} – {format(props.meeting.end, 'p')}
            </Typography>
          </Grid>
        </Grid>
      </Link>
    </ListItem>
  );
};

export default MeetingRow;
