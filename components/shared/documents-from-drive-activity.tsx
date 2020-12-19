import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { format, formatDistanceToNow } from 'date-fns';
import { uniqBy } from 'lodash';
import { useRouter } from 'next/router';
import React from 'react';
import { IFormattedDriveActivity } from '../fetch/fetch-drive-activity';
import useExpandStyles from '../shared/expand-styles';
import { IDocument } from '../store/document-store';
import { IStore } from '../store/use-store';

const useRowStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
    overflow: 'hidden',
  },
  icon: {
    height: 16,
    width: 16,
    display: 'block',
  },
}));

const Activity = (props: {
  document: IDocument;
  action: IFormattedDriveActivity;
  personStore: IStore['personDataStore'];
}) => {
  const classes = useRowStyles();
  const expandClasses = useExpandStyles();
  const router = useRouter();
  const actor = props.action.actorPersonId
    ? props.personStore.getPersonById(props.action.actorPersonId)
    : null;
  const tooltipText = `Last edited by ${actor?.name || actor?.emailAddresses} on ${format(
    new Date(props.document.updatedAt!),
    "MMM do 'at' hh:mm a",
  )}`;
  return (
    <Tooltip title={tooltipText} aria-label={tooltipText}>
      <Button
        className={expandClasses.listItem}
        onClick={() => router.push(`?tab=docs&slug=${props.document.id}`)}
      >
        <Grid container wrap="nowrap" spacing={2} alignItems="center">
          <Grid item>
            <img src={props.document.iconLink} className={classes.icon} />
          </Grid>
          <Grid item xs={8}>
            <Typography variant="body2" noWrap>
              {props.document.name}
            </Typography>
          </Grid>
          <Grid item xs={3} style={{ textAlign: 'right' }}>
            <Typography variant="caption" color="textSecondary" noWrap>
              {formatDistanceToNow(new Date(props.document.updatedAt!))} ago
            </Typography>
          </Grid>
        </Grid>
      </Button>
    </Tooltip>
  );
};

const DriveActivityList = (props: {
  driveActivity: IFormattedDriveActivity[];
  personStore: IStore['personDataStore'];
  docStore: IStore['documentDataStore'];
}) => {
  const classes = useExpandStyles();
  const actions = uniqBy(
    props.driveActivity.sort((a, b) => (a.time > b.time ? -1 : 1)),
    'link',
  );
  if (actions.length < 1) {
    return <Typography variant="caption">None</Typography>;
  }
  const items = actions.map((action) => ({
    action,
    document: props.docStore.getByLink(action.link)!,
  }));
  return (
    <div className={classes.list}>
      {items.map((item) => (
        <Activity
          key={item.document.id}
          personStore={props.personStore}
          document={item.document}
          action={item.action}
        />
      ))}
    </div>
  );
};

export default DriveActivityList;
