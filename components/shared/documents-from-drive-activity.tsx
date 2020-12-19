import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { formatDistanceToNow } from 'date-fns';
import { uniqBy } from 'lodash';
import { useRouter } from 'next/router';
import React from 'react';
import { IFormattedDriveActivity } from '../fetch/fetch-drive-activity';
import useExpandStyles from '../shared/expand-styles';
import DocumentDataStore, { IDocument } from '../store/document-store';
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
  },
}));

const Activity = (props: { document: IDocument }) => {
  const classes = useRowStyles();
  const expandClasses = useExpandStyles();
  const router = useRouter();
  return (
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
  );
};

const DriveActivityList = (props: {
  driveActivity: IFormattedDriveActivity[];
  personStore: PersonDataStore;
  docStore: DocumentDataStore;
}) => {
  const classes = useExpandStyles();
  const actions = uniqBy(props.driveActivity, 'link');
  if (actions.length < 1) {
    return <Typography variant="caption">None</Typography>;
  }
  const docs = actions
    .map((action) => props.docStore.getByLink(action.link))
    .filter((doc) => doc && doc.updatedAt)
    .sort((a, b) => (a!.updatedAt! > b!.updatedAt! ? -1 : 1));
  return (
    <div className={classes.list}>
      {docs.map((doc) => (
        <Activity key={doc!.id} document={doc!} />
      ))}
    </div>
  );
};

export default DriveActivityList;
