import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { format } from 'date-fns';
import Link from 'next/link';
import React from 'react';
import PersonDataStore from '../store/person-store';
import TimeStore, { ISegment } from '../store/time-store';

const useRowStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
    overflow: 'hidden',
  },
  link: {
    textTransform: 'none',
    padding: 0,
    marginTop: 0,
  },
}));

const Meeting = (props: { segment: ISegment; personStore: PersonDataStore }) => {
  const classes = useRowStyles();
  const email = props.segment.organizer?.email || props.segment.creator?.email;
  const personId = email && props.personStore.getPersonIdForEmailAddress(email);
  const iconLink = personId ? props.personStore.getPersonById(personId)?.imageUrl : null;
  return (
    <Grid container wrap="nowrap" spacing={2}>
      {iconLink && (
        <Grid item>
          <Avatar style={{ height: 32, width: 32 }} src={iconLink || ''} />
        </Grid>
      )}
      <Grid item zeroMinWidth>
        <Link href={`?tab=meetings&slug=${props.segment.id}`}>
          <Button className={classes.link} component="a">
            {props.segment.summary}
          </Button>
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
  segmentIds: string[];
  timeStore: TimeStore;
  personStore: PersonDataStore;
}) => {
  const classes = useRowStyles();
  const segments = props.segmentIds
    .map((id) => props.timeStore.getSegmentById(id))
    .filter((item) => !!item)
    .sort((a, b) => (a!.start < b!.start ? -1 : 1));
  return (
    <div className={classes.root}>
      {segments.map((segment) => (
        <Meeting key={segment!.id} segment={segment!} personStore={props.personStore} />
      ))}
    </div>
  );
};

export default MeetingList;
