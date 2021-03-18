import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import clsx from 'clsx';
import { format } from 'date-fns';
import React from 'react';
import { useHistory } from 'react-router-dom';
import CalendarIcon from '../../public/icons/calendar.svg';
import useRowStyles from '../shared/row-styles';
import PersonDataStore from '../store/models/person-model';
import { ISegment } from '../store/models/segment-model';

export const Meeting = (props: {
  meeting: ISegment;
  personStore: PersonDataStore;
  info?: string;
}) => {
  const rowStyles = useRowStyles();
  const router = useHistory();
  const opacity = props.meeting.start > new Date() ? 0.5 : 0.3;
  return (
    <Button
      onClick={() => router.push(`/meetings/${props.meeting.id}`)}
      className={clsx(rowStyles.row)}
    >
      <Grid container wrap="nowrap" spacing={2} alignItems="center">
        <Grid item className={rowStyles.rowLeft}>
          <CalendarIcon
            width="24"
            height="24"
            style={{ display: 'block', margin: '0 auto', opacity }}
          />
        </Grid>
        <Grid item zeroMinWidth xs>
          <Grid container justify="space-between" alignItems="center">
            <Grid item xs={12}>
              <Typography noWrap>{props.meeting.summary || '(No title)'}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" noWrap>
                {format(props.meeting.start, 'EEEE, MMMM d')} ⋅ {format(props.meeting.start, 'p')} –{' '}
                {format(props.meeting.end, 'p')}
              </Typography>
            </Grid>
            {props.info && (
              <Grid item xs={12}>
                <Typography variant="body2" noWrap>
                  {props.info}
                </Typography>
              </Grid>
            )}
          </Grid>
        </Grid>
      </Grid>
    </Button>
  );
};

/**
 * Intended to be used with the 'expand' views for each entity type
 */
const MeetingList = (props: {
  segments: (ISegment | undefined)[];
  personStore: PersonDataStore;
}) => {
  if (props.segments.length < 1) {
    return <Typography variant="caption">None</Typography>;
  }

  const sortedSegments = props.segments
    .filter((item) => !!item)
    .sort((a, b) => (a!.start < b!.start ? -1 : 1));
  return (
    <div>
      {sortedSegments.map(
        (segment) =>
          segment && <Meeting key={segment.id} meeting={segment} personStore={props.personStore} />,
      )}
    </div>
  );
};

export default MeetingList;
