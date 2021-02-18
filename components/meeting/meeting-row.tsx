import Grid from '@material-ui/core/Grid';
import ListItem from '@material-ui/core/ListItem';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import useRowStyles from '../shared/row-styles';
import { ISegment } from '../store/models/segment-model';
import { IStore } from '../store/use-store';

const useStyles = makeStyles((theme) => ({
  time: { minWidth: 150, maxWidth: 180 },
  row: {
    paddingLeft: 0,
    marginLeft: 4,
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
  dot: {},
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
  const rowStyles = useRowStyles();
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
    <ListItem
      button={true}
      selected={isSelected}
      onClick={handleClick}
      ref={setReferenceElement as any}
      className={clsx(
        'ignore-react-onclickoutside',
        rowStyles.row,
        rowStyles.rowBorderRadius,
        classes.row,
        props.meeting.selfResponseStatus === 'accepted' && rowStyles.rowDefault,
        props.meeting.selfResponseStatus === 'tentative' && rowStyles.rowHint,
        props.meeting.selfResponseStatus === 'declined' && rowStyles.rowLineThrough,
        props.meeting.selfResponseStatus === 'needsAction' && rowStyles.rowHint,
        isSelected && rowStyles.rowPrimaryMain,
        props.isSmall && classes.noLeftMargin,
      )}
    >
      <Grid container spacing={2} alignItems="center">
        <Grid item className={classes.dot}>
          <div
            className={clsx(
              rowStyles.border,
              props.meeting.selfResponseStatus === 'accepted' && rowStyles.borderSecondaryMain,
              props.meeting.selfResponseStatus === 'tentative' && rowStyles.borderSecondaryLight,
              props.meeting.selfResponseStatus === 'declined' && rowStyles.borderSecondaryLight,
              props.meeting.selfResponseStatus === 'needsAction' && rowStyles.borderSecondaryLight,
              props.selectedMeetingId === props.meeting.id && rowStyles.borderInfoMain,
            )}
          />
        </Grid>
        <Grid item xs zeroMinWidth className={clsx(props.isSmall && classes.smallContainer)}>
          <Grid container>
            <Grid item xs={12}>
              <Typography variant="h6">
                {format(props.meeting.start, 'p')} – {format(props.meeting.end, 'p')}
              </Typography>
              <Typography variant="body2" noWrap>
                <span style={{ fontWeight: 500 }}>{props.meeting.summary || '(no title)'}</span>{' '}
                {!props.isSmall && props.meeting.description
                  ? props.meeting.description.replace(/<[^>]+>/g, '')
                  : ''}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </ListItem>
  );
};

export default MeetingRow;
