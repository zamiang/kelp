import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import VideocamIcon from '@material-ui/icons/Videocam';
import clsx from 'clsx';
import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { ISegment } from '../store/models/segment-model';
import { IStore } from '../store/use-store';
import MeetingRowBelow from './meeting-row-below';

const useStyles = makeStyles((theme) => ({
  time: { minWidth: 150, maxWidth: 180 },
  row: {
    paddingLeft: 0,
    width: 'auto',
    [theme.breakpoints.down('sm')]: {
      marginLeft: -4,
      paddingLeft: theme.spacing(2),
      borderRadius: 0,
    },
  },
  summary: {
    flex: 1,
    [theme.breakpoints.down('sm')]: {
      flex: 'none',
    },
  },
  noLeftMargin: {
    marginLeft: 0,
  },
  smallContainer: {
    flexDirection: 'column-reverse',
    overflow: 'hidden',
  },
  container: {
    display: 'block',
    width: '100%',
    textAlign: 'left',
    '&:hover': {
      background: 'transparent',
    },
  },
  rotateIcon: {
    transform: 'rotate(90deg)',
  },
  icon: {
    transition: 'transform 0.3s',
  },
  iconContainer: {
    marginLeft: -20,
    marginRight: -2,
  },
}));

const MeetingRow = (props: {
  meeting: ISegment;
  selectedMeetingId: string | null;
  shouldRenderCurrentTime: boolean;
  store: IStore;
  isSmall?: boolean;
}) => {
  const isSelected = props.selectedMeetingId === props.meeting.id;
  const classes = useStyles();
  const router = useHistory();
  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (isSelected && referenceElement) {
      referenceElement.scrollIntoView({ behavior: 'auto', block: 'center' });
    } else if (referenceElement && !props.selectedMeetingId && props.shouldRenderCurrentTime) {
      referenceElement.scrollIntoView({ behavior: 'auto', block: 'center' });
    }
  }, [!!referenceElement]);

  const handleClick = () => {
    void router.push(`/meetings/${props.meeting.id}`);
    return false;
  };
  return (
    <Button onClick={handleClick} ref={setReferenceElement as any} className={classes.container}>
      <Grid container spacing={1} alignItems="center">
        <Grid item>
          <IconButton onClick={() => null} className={classes.iconContainer}>
            <KeyboardArrowRightIcon
              className={clsx(classes.icon, isSelected && classes.rotateIcon)}
            />
          </IconButton>
        </Grid>
        <Grid item xs zeroMinWidth className={clsx(props.isSmall && classes.smallContainer)}>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <Typography variant="body2">
                {format(props.meeting.start, 'p')} – {format(props.meeting.end, 'p')}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography noWrap>
                <span style={{ fontWeight: 500 }}>{props.meeting.summary || '(no title)'}</span>{' '}
                {!props.isSmall && props.meeting.description
                  ? props.meeting.description.replace(/<[^>]+>/g, '')
                  : ''}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
        {props.meeting.videoLink && (
          <Grid item>
            <IconButton target="_blank" href={props.meeting.videoLink}>
              <VideocamIcon color="primary" />
            </IconButton>
          </Grid>
        )}
      </Grid>
      {isSelected && <MeetingRowBelow meeting={props.meeting} store={props.store} />}
    </Button>
  );
};

export default MeetingRow;
