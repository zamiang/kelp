import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { format } from 'date-fns';
import Link from 'next/link';
import React from 'react';
import PersonDataStore from '../store/person-store';
import { ISegment } from '../store/time-store';

const useRowStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    overflow: 'hidden',
  },
  link: {
    padding: 0,
    marginTop: 0,
    fontWeight: theme.typography.fontWeightBold,
    cursor: 'pointer',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
}));

const Meeting = (props: { segment: ISegment; personStore: PersonDataStore }) => {
  const classes = useRowStyles();
  return (
    <Grid container wrap="nowrap" spacing={2}>
      <Grid item zeroMinWidth>
        <Link href={`?tab=meetings&slug=${props.segment.id}`}>
          <span className={classes.link}>{props.segment.summary}</span>
        </Link>
        <br />
        <Typography variant="caption" color="textSecondary">
          <Typography variant="subtitle2">
            {format(props.segment.start, 'cccc, MMMM dd')} from {format(props.segment.start, 'p')}{' '}
            to {format(props.segment.end, 'p')}
          </Typography>
        </Typography>
      </Grid>
    </Grid>
  );
};

/**
 * Intended to be used with the 'expand' views for each entity type
 */
const MeetingList = (props: {
  segments: (ISegment | undefined)[];
  personStore: PersonDataStore;
}) => {
  const classes = useRowStyles();
  const sortedSegments = props.segments
    .filter((item) => !!item)
    .sort((a, b) => (a.start < b.start ? -1 : 1));
  return (
    <div className={classes.root}>
      {sortedSegments.map(
        (segment) =>
          segment && <Meeting key={segment.id} segment={segment} personStore={props.personStore} />,
      )}
    </div>
  );
};

export default MeetingList;
