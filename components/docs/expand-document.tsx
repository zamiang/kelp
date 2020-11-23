import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { format, getWeek, subWeeks } from 'date-fns';
import pluralize from 'pluralize';
import React from 'react';
import { IFormattedDriveActivity } from '../fetch/fetch-drive-activity';
import AppBar from '../shared/elevate-app-bar';
import useExpandStyles from '../shared/expand-styles';
import MeetingList from '../shared/meeting-list';
import PersonList from '../shared/person-list';
import { IStore } from '../store/use-store';

const getActivityStats = (activity: IFormattedDriveActivity[], week: number) => {
  const filteredActivity = activity.filter((activity) => getWeek(activity.time) === week);
  const commentCount = filteredActivity.filter((activity) => activity.action === 'comment').length;
  const editCount = filteredActivity.filter((activity) => activity.action === 'edit').length;

  const formattedString = [];
  if (commentCount > 0) {
    formattedString.push(`${commentCount} ${pluralize('comment', commentCount)}`);
  }
  if (editCount > 0) {
    formattedString.push(`${editCount} ${pluralize('edit', editCount)}`);
  }

  return formattedString.join(' & ');
};

const ExpandedDocument = (props: IStore & { documentId: string; close: () => void }) => {
  const classes = useExpandStyles();
  const document = props.docDataStore.getByLink(props.documentId);
  if (!document) {
    return null;
  }
  const activity = props.driveActivityStore.getDriveActivityForDocument(document.id) || [];
  const people = props.personDataStore.getPeopleForDriveActivity(activity);
  const driveActivityIds = activity.map((item) => item.id);
  const meetings = props.timeDataStore.getSegmentsForDriveActivity(driveActivityIds);
  const activityStatsThisWeek = getActivityStats(activity, getWeek(new Date()));
  const activityStatsLastWeek = getActivityStats(activity, getWeek(subWeeks(new Date(), 1)));
  return (
    <React.Fragment>
      <AppBar onClose={props.close} externalLink={document.link} />
      <div className={classes.topContainer}>
        <Typography variant="h5" color="textPrimary" gutterBottom className={classes.title}>
          {document.name || '(no title)'}
        </Typography>
        {document.updatedAt && (
          <React.Fragment>Modified: {format(document.updatedAt, 'EEEE, MMMM d p')}</React.Fragment>
        )}
      </div>
      <Divider />
      <Grid container className={classes.triGroup} justify="space-between">
        <Grid item xs className={classes.triGroupItem}>
          <Typography variant="h6" className={classes.smallHeading}>
            Activity This Week
          </Typography>
          {
            <Typography className={classes.highlight}>
              <span className={classes.highlightValue}>{activityStatsThisWeek || 'None'}</span>
              {activityStatsLastWeek && (
                <span className={classes.highlightSub}>from {activityStatsLastWeek}</span>
              )}
            </Typography>
          }
        </Grid>
        <div className={classes.triGroupBorder}></div>
        <Grid item xs className={classes.triGroupItem}>
          <Typography variant="h6" className={classes.smallHeading}>
            Collaborators
          </Typography>
          <Typography className={classes.highlight}>
            <PersonList personStore={props.personDataStore} people={people} />
          </Typography>
        </Grid>
      </Grid>
      <Divider />
      <div className={classes.container}>
        <Grid container spacing={3} className={classes.content}>
          <Grid item>
            {meetings.length > 0 && (
              <React.Fragment>
                <Typography variant="h6" className={classes.smallHeading}>
                  Meetings
                </Typography>
                <MeetingList segments={meetings} personStore={props.personDataStore} />
              </React.Fragment>
            )}
          </Grid>
        </Grid>
      </div>
    </React.Fragment>
  );
};

export default ExpandedDocument;
