import Avatar from '@material-ui/core/Avatar';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { formatDistanceToNow } from 'date-fns';
import { uniqBy } from 'lodash';
import React from 'react';
import { IFormattedDriveActivity } from '../fetch/fetch-drive-activity';
import PersonDataStore from '../store/person-store';

const useRowStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
    overflow: 'hidden',
  },
  icon: {
    height: 16,
    width: 16,
    display: 'block',
    marginTop: 4,
  },
  link: {
    textTransform: 'none',
    padding: 0,
    marginTop: 0,
  },
}));

const Activity = (props: {
  driveActivity: IFormattedDriveActivity;
  personStore: PersonDataStore;
}) => {
  const classes = useRowStyles();
  const person =
    props.driveActivity.actorPersonId &&
    props.personStore.getPersonById(props.driveActivity.actorPersonId);
  return (
    <Grid container wrap="nowrap" spacing={2}>
      <Grid item>
        {person && person.imageUrl && (
          <Avatar src={person?.imageUrl} style={{ height: 24, width: 24 }} className={classes.icon}>
            {(person.name || person.id)[0]}
          </Avatar>
        )}
      </Grid>
      <Grid item>
        <Typography variant="subtitle2" noWrap>
          {person && (person.name || person.id)}
        </Typography>
        <Typography variant="subtitle2" noWrap>
          <i>{props.driveActivity.action}</i>
        </Typography>
        <Typography variant="caption" color="textSecondary">
          {formatDistanceToNow(new Date(props.driveActivity.time))} ago
        </Typography>
      </Grid>
    </Grid>
  );
};

const DriveActivity = (props: {
  driveActivity: IFormattedDriveActivity[];
  personStore: PersonDataStore;
}) => {
  const classes = useRowStyles();
  // BADD
  const activity = uniqBy(props.driveActivity, 'id')
    .filter((action) => action && action.link)
    .sort((a, b) => (a.time > b.time ? -1 : 1));
  return (
    <div className={classes.root}>
      {activity.map((item) => (
        <Activity key={item.id} driveActivity={item} personStore={props.personStore} />
      ))}
    </div>
  );
};

export default DriveActivity;
