import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grid from '@material-ui/core/Grid';
import ListItem from '@material-ui/core/ListItem';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { format } from 'date-fns';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
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
    paddingLeft: 33,
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
    marginLeft: 40,
    width: 'auto',
  },
  summary: {
    flex: 1,
    [theme.breakpoints.down('sm')]: {
      flex: 'none',
    },
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
  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(null);
  React.useEffect(() => {
    if ((isSelected || props.shouldRenderCurrentTime) && referenceElement) {
      referenceElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [referenceElement]);

  const [isOpen, setIsOpen] = React.useState(isSelected);
  const handleClick = () => {
    setIsOpen(true);
    void router.push(`?tab=meetings&slug=${props.meeting.id}`);
    return false;
  };
  return (
    <React.Fragment>
      {props.shouldRenderCurrentTime && (
        <ListItem className={classes.currentTime} id={CURRENT_TIME_ELEMENT_ID}>
          <div className={classes.currentTimeDot}></div>
          <div className={classes.currentTimeBorder}></div>
        </ListItem>
      )}
      <ClickAwayListener onClickAway={() => setIsOpen(false)}>
        <ListItem
          ref={setReferenceElement as any}
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
            <PopperContainer anchorEl={referenceElement} isOpen={isOpen}>
              <ExpandedMeeting
                meetingId={props.meeting.id}
                close={() => setIsOpen(false)}
                {...props.store}
              />
            </PopperContainer>
            <Grid
              item
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
            <Grid item container xs={10} zeroMinWidth>
              <Grid item className={classes.time}>
                <Typography variant="subtitle2">
                  {format(props.meeting.start, 'p')} – {format(props.meeting.end, 'p')}
                </Typography>
              </Grid>
              <Grid item zeroMinWidth className={classes.summary}>
                <Typography variant="body2" noWrap>
                  <b>{props.meeting.summary || '(no title)'}</b>{' '}
                  {props.meeting.description
                    ? props.meeting.description.replace(/<[^>]+>/g, '')
                    : ''}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </ListItem>
      </ClickAwayListener>
    </React.Fragment>
  );
};

export default MeetingRow;
