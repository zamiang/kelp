import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grid from '@material-ui/core/Grid';
import ListItem from '@material-ui/core/ListItem';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { format } from 'date-fns';
import React from 'react';
import PopperContainer from '../shared/popper';
import useRowStyles from '../shared/row-styles';
import { ISegment } from '../store/time-store';
import { IStore } from '../store/use-store';
import ExpandedMeeting from './expand-meeting';

const useStyles = makeStyles((theme) => ({
  time: {
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
  const classes = useStyles();
  const rowStyles = useRowStyles();

  const [anchorEl, setAnchorEl] = React.useState(null);
  const handleClick = (event: any) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };
  const isOpen = Boolean(anchorEl);
  return (
    <ClickAwayListener onClickAway={() => setAnchorEl(null)}>
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
        <Grid container spacing={1} alignItems="center">
          <PopperContainer anchorEl={anchorEl} isOpen={isOpen}>
            <ExpandedMeeting
              meetingId={props.meeting.id}
              close={() => setAnchorEl(null)}
              {...props.store}
            />
          </PopperContainer>
          <Grid
            item
            className={clsx(
              rowStyles.border,
              classes.paddingLeft,
              props.meeting.selfResponseStatus === 'accepted' && rowStyles.borderSecondaryMain,
              props.meeting.selfResponseStatus === 'tentative' && rowStyles.borderSecondaryLight,
              props.meeting.selfResponseStatus === 'declined' && rowStyles.borderSecondaryLight,
              props.meeting.selfResponseStatus === 'needsAction' && rowStyles.borderSecondaryLight,
            )}
          ></Grid>
          <Grid item zeroMinWidth xs>
            <Typography variant="body2">
              <b>{props.meeting.summary || '(no title)'}</b>
            </Typography>
          </Grid>
          <Grid item className={classes.time}>
            <Typography variant="caption" color="textSecondary">
              {format(props.meeting.start, 'MM dd yyyy')} {format(props.meeting.start, 'p')} –{' '}
              {format(props.meeting.end, 'p')}
            </Typography>
          </Grid>
        </Grid>
      </ListItem>
    </ClickAwayListener>
  );
};

export default MeetingSearchResult;
