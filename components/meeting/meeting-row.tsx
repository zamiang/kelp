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

const CURRENT_TIME_ELEMENT_ID = 'meeting-at-current-time';

const useStyles = makeStyles((theme) => ({
  time: { minWidth: 150, maxWidth: 180 },
  currentTime: {
    marginTop: -6,
  },
  currentTimeDot: {
    borderRadius: '50%',
    height: 12,
    width: 12,
    background: theme.palette.primary.dark,
  },
  currentTimeBorder: {
    marginTop: 0,
    width: '100%',
    borderTop: `2px solid ${theme.palette.primary.dark}`,
  },
  noOverflow: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  row: {
    paddingLeft: 0,
    marginLeft: theme.spacing(3),
  },
}));

const MeetingRow = (props: {
  meeting: ISegment;
  currentTime: Date;
  selectedMeetingId: string | null;
  shouldRenderCurrentTime: boolean;
}) => {
  const classes = useStyles();
  const rowStyles = useRowStyles();
  const fieldRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    const isCurrentMeeting = props.meeting.id === props.selectedMeetingId;
    if ((isCurrentMeeting || props.shouldRenderCurrentTime) && fieldRef.current) {
      fieldRef.current.scrollIntoView();
    }
  }, []);
  return (
    <React.Fragment>
      {props.shouldRenderCurrentTime && (
        <ListItem className={classes.currentTime} id={CURRENT_TIME_ELEMENT_ID}>
          <div className={classes.currentTimeDot}></div>
          <div className={classes.currentTimeBorder}></div>
        </ListItem>
      )}
      <ListItem
        ref={fieldRef}
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
        <Link href={`?tab=meetings&slug=${props.meeting.id}`}>
          <Grid container spacing={1} alignItems="center">
            <Grid
              item
              zeroMinWidth={true}
              className={clsx(
                rowStyles.border,
                props.meeting.selfResponseStatus === 'accepted' && rowStyles.borderSecondaryMain,
                props.meeting.selfResponseStatus === 'tentative' && rowStyles.borderSecondaryLight,
                props.meeting.selfResponseStatus === 'declined' && rowStyles.borderSecondaryLight,
                props.meeting.selfResponseStatus === 'needsAction' &&
                  rowStyles.borderSecondaryLight,
                props.selectedMeetingId === props.meeting.id && rowStyles.borderInfoMain,
              )}
            ></Grid>
            <Grid item className={classes.time}>
              <Typography variant="subtitle2">
                {format(props.meeting.start, 'p')} – {format(props.meeting.end, 'p')}
              </Typography>
            </Grid>
            <Grid item zeroMinWidth xs>
              <Typography variant="body2" noWrap>
                <b>{props.meeting.summary || '(no title)'}</b> {props.meeting.description || ''}
              </Typography>
            </Grid>
          </Grid>
        </Link>
      </ListItem>
    </React.Fragment>
  );
};

export default MeetingRow;
