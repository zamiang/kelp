import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import EventIcon from '@material-ui/icons/Event';
import { format } from 'date-fns';
import React from 'react';
import { useHistory } from 'react-router-dom';
import useExpandStyles from '../shared/expand-styles';
import PersonDataStore from '../store/models/person-model';
import { ISegment } from '../store/models/segment-model';

const Meeting = (props: { segment: ISegment; personStore: PersonDataStore }) => {
  const expandClasses = useExpandStyles();
  const router = useHistory();
  return (
    <Button
      className={expandClasses.listItem}
      onClick={() => router.push(`/meetings/${props.segment.id}`)}
    >
      <Grid container wrap="nowrap" spacing={1} alignItems="center">
        <Grid item>
          <EventIcon style={{ fontSize: 24, display: 'block' }} />
        </Grid>
        <Grid item xs={11}>
          <Grid container justify="space-between" alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="body2" noWrap>
                {props.segment.summary || '(No title)'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4} className={expandClasses.date}>
              <Typography variant="caption" noWrap color="textSecondary">
                {format(props.segment.start, "MMM do 'at' hh:mm a")}
              </Typography>
            </Grid>
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
          segment && <Meeting key={segment.id} segment={segment} personStore={props.personStore} />,
      )}
    </div>
  );
};

export default MeetingList;
