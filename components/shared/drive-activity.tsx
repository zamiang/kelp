import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { formatDistanceToNow } from 'date-fns';
import { uniqBy } from 'lodash';
import Link from 'next/link';
import React from 'react';
import { IFormattedDriveActivity } from '../fetch/fetch-drive-activity';
import DocDataStore, { IDoc } from '../store/doc-store';
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
  link: {
    textTransform: 'none',
    padding: 0,
    marginTop: 0,
  },
}));

const Activity = (props: { document: IDoc }) => {
  const classes = useRowStyles();
  return (
    <Grid container wrap="nowrap" spacing={2}>
      <Grid item>
        <img src={props.document.iconLink} className={classes.icon} />
      </Grid>
      <Grid item zeroMinWidth>
        <Link href={`?tab=docs&slug=${props.document.id}`}>
          <Button className={classes.link} component="a">
            {props.document.name}
          </Button>
        </Link>
        <br />
        <Typography variant="caption" color="textSecondary">
          {formatDistanceToNow(new Date(props.document.updatedAt!))} ago
        </Typography>
      </Grid>
    </Grid>
  );
};

const DriveActivityList = (props: {
  driveActivity: IFormattedDriveActivity[];
  personStore: PersonDataStore;
  docStore: DocDataStore;
}) => {
  const classes = useRowStyles();
  const actions = uniqBy(
    props.driveActivity.filter((action) => action && action.link),
    'link',
  );
  if (actions.length < 1) {
    return null;
  }
  const docs = actions
    .filter((action) => action && action.link)
    .map((action) => props.docStore.getByLink(action.link!))
    .filter((doc) => doc && doc.updatedAt)
    .sort((a, b) => (a!.updatedAt! > b!.updatedAt! ? -1 : 1));
  return (
    <div className={classes.root}>
      {docs.map((doc) => (
        <Activity key={doc!.id} document={doc!} />
      ))}
    </div>
  );
};

export default DriveActivityList;
