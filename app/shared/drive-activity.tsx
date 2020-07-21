import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { formatDistanceToNow } from 'date-fns';
import { uniqBy } from 'lodash';
import React from 'react';
import { IFormattedDriveActivity } from '../fetch/fetch-drive-activity';
import DocDataStore from '../store/doc-store';
import DriveActivityDataStore from '../store/drive-activity-store';
import PersonDataStore from '../store/person-store';

const useRowStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
    overflow: 'hidden',
  },
  icon: {
    height: 24,
    width: 24,
    display: 'block',
  },
}));

type classesType = ReturnType<typeof useRowStyles>;

const Activity = (props: {
  activity: IFormattedDriveActivity;
  personStore: PersonDataStore;
  docStore: DocDataStore;
  classes: classesType;
}) => {
  const doc = props.docStore.getByLink(props.activity.link!);
  if (!doc) return null;
  return (
    <Grid container wrap="nowrap" spacing={2}>
      <Grid item>
        <img src={doc.iconLink} />
      </Grid>
      <Grid item zeroMinWidth>
        <Link color="textPrimary" target="_blank" href={doc.link || ''} noWrap>
          {doc.name}
        </Link>
        <br />
        <Typography variant="caption" color="textSecondary">
          {formatDistanceToNow(new Date(doc.updatedAt!))} ago
        </Typography>
      </Grid>
    </Grid>
  );
};

const DriveActivityList = (props: {
  driveActivityIds: string[];
  driveActivityStore: DriveActivityDataStore;
  personStore: PersonDataStore;
  docStore: DocDataStore;
}) => {
  const classes = useRowStyles();
  const driveActivity = props.driveActivityIds.map((id) => props.driveActivityStore.getById(id));
  const actions = uniqBy(
    driveActivity.filter((action) => action && action.link),
    'link',
  );
  if (actions.length < 1) {
    return null;
  }
  const docs = actions
    .filter((action) => action && action.link)
    .map((action) => props.docStore.getByLink(action!.link!))
    .sort((a, b) => (a!.updatedAt > b!.updatedAt ? -1 : 1));
  return (
    <div className={classes.root}>
      <div>
        {docs.map((doc) => (
          <Activity key={doc.id} document={doc} personStore={props.personStore} classes={classes} />
        ))}
      </div>
    </div>
  );
};

export default DriveActivityList;
