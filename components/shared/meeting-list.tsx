import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import EventIcon from '@material-ui/icons/Event';
import { format } from 'date-fns';
import { useRouter } from 'next/router';
import React from 'react';
import useExpandStyles from '../shared/expand-styles';
import PersonDataStore from '../store/person-store';
import { ISegment } from '../store/time-store';

const Meeting = (props: { segment: ISegment; personStore: PersonDataStore }) => {
  const expandClasses = useExpandStyles();
  const router = useRouter();
  return (
    <Button
      className={expandClasses.listItem}
      onClick={() => router.push(`?tab=meetings&slug=${props.segment.id}`)}
    >
      <Grid container wrap="nowrap" spacing={2} alignItems="center">
        <Grid item>
          <EventIcon style={{ fontSize: 16, display: 'block' }} />
        </Grid>
        <Grid item xs={7}>
          <Typography variant="body2" noWrap>
            {props.segment.summary || '(No title)'}
          </Typography>
        </Grid>
        <Grid item xs={4} style={{ textAlign: 'right' }}>
          <Typography variant="caption" noWrap color="textSecondary">
            {format(props.segment.start, "MMM do 'at' hh:mm a")}
          </Typography>
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
  const classes = useExpandStyles();
  if (props.segments.length < 1) {
    return <Typography variant="caption">None</Typography>;
  }

  const sortedSegments = props.segments
    .filter((item) => !!item)
    .sort((a, b) => (a!.start < b!.start ? -1 : 1));
  return (
    <div className={classes.list}>
      {sortedSegments.map(
        (segment) =>
          segment && <Meeting key={segment.id} segment={segment} personStore={props.personStore} />,
      )}
    </div>
  );
};

export default MeetingList;
