import { Grid, Link, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFileOutlined';
import { formatDistanceToNow } from 'date-fns';
import { uniqBy } from 'lodash';
import React from 'react';
import { IFormattedDriveActivity } from '../fetch/fetch-first';
import DocDataStore from '../store/doc-store';
import DriveActivityDataStore from '../store/drive-activity-store';
import PersonDataStore from '../store/person-store';

const useRowStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    overflow: 'hidden',
  },
  icon: {
    height: 32,
    width: 32,
    background: theme.palette.secondary.main,
    color: 'white',
    borderRadius: '50%',
    padding: 5,
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
  return (
    <Grid container wrap="nowrap" spacing={3} alignItems="center">
      <Grid item>
        <InsertDriveFileIcon className={props.classes.icon} />
      </Grid>
      <Grid item xs={7} zeroMinWidth>
        <Link color="textPrimary" target="_blank" href={doc.link || ''} noWrap>
          {doc.name}
        </Link>
      </Grid>
      <Grid item xs={4} style={{ textAlign: 'right' }}>
        <Typography variant="caption" color="textSecondary" align="right">
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
    driveActivity.filter((action) => action.link),
    'link',
  );
  if (actions.length < 1) {
    return null;
  }
  return (
    <div className={classes.root}>
      <div>
        {actions.map((action) => (
          <Activity
            key={action.id}
            activity={action}
            personStore={props.personStore}
            docStore={props.docStore}
            classes={classes}
          />
        ))}
      </div>
    </div>
  );
};

export default DriveActivityList;
