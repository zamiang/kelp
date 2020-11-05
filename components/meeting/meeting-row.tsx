import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grid from '@material-ui/core/Grid';
import ListItem from '@material-ui/core/ListItem';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { format } from 'date-fns';
import { useRouter } from 'next/router';
import React, { useRef } from 'react';
import PopperContainer from '../shared/popper';
import useRowStyles from '../shared/row-styles';
import { ISegment } from '../store/time-store';
import { IStore } from '../store/use-store';
import ExpandedMeeting from './expand-meeting';

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
  store: IStore;
}) => {
  const isSelected = props.selectedMeetingId === props.meeting.id;
  const classes = useStyles();
  const router = useRouter();
  const rowStyles = useRowStyles();
  const anchorRef = useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    if ((isSelected || props.shouldRenderCurrentTime) && anchorRef.current) {
      anchorRef.current.scrollIntoView();
    }
  }, []);

  const [anchorEl, setAnchorEl] = React.useState(isSelected ? anchorRef : null);
  const handleClick = (event: any) => {
    if (!anchorEl) {
      setAnchorEl(anchorEl ? null : event?.currentTarget);
      return router.push(`?tab=meetings&slug=${props.meeting.id}`);
    }
  };
  const isOpen = Boolean(anchorRef.current) && Boolean(anchorEl);
  return (
    <React.Fragment>
      {props.shouldRenderCurrentTime && (
        <ListItem className={classes.currentTime} id={CURRENT_TIME_ELEMENT_ID}>
          <div className={classes.currentTimeDot}></div>
          <div className={classes.currentTimeBorder}></div>
        </ListItem>
      )}
      <ClickAwayListener onClickAway={() => setAnchorEl(null)}>
        <ListItem
          ref={anchorRef}
          button={true}
          onClick={handleClick}
          className={clsx(
            'ignore-react-onclickoutside',
            rowStyles.row,
            classes.row,
            props.meeting.selfResponseStatus === 'accepted' && rowStyles.rowDefault,
            props.meeting.selfResponseStatus === 'tentative' && rowStyles.rowHint,
            props.meeting.selfResponseStatus === 'declined' && rowStyles.rowLineThrough,
            props.meeting.selfResponseStatus === 'needsAction' && rowStyles.rowHint,
            isSelected && rowStyles.rowPrimaryMain,
          )}
        >
          <Grid container spacing={1} alignItems="center">
            <PopperContainer anchorEl={anchorEl} isOpen={isOpen}>
              <ExpandedMeeting meetingId={props.meeting.id} {...props.store} />
            </PopperContainer>
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
        </ListItem>
      </ClickAwayListener>
    </React.Fragment>
  );
};

export default MeetingRow;
