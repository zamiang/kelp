import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import { format } from 'date-fns';
import React from 'react';
import AvatarList from '../shared/avatar-list';
import AppBar from '../shared/elevate-app-bar';
import useExpandStyles from '../shared/expand-styles';
import MeetingList from '../shared/meeting-list';
import { IStore } from '../store/use-store';

/*
const getActivityStats = (
  activity: IFormattedDriveActivity[],
  week: number,
  personDataStore: IStore['personDataStore'],
) => {
  const filteredActivity = activity.filter((activity) => getWeek(activity.time) === week);
  const commentCount = filteredActivity.filter((activity) => activity.action === 'comment').length;
  const editCount = filteredActivity.filter((activity) => activity.action === 'edit').length;

  const formattedString = [];
  const formattedTooltipString = uniq(
    filteredActivity
      .map((activity) => {
        const person = activity.actorPersonId
          ? personDataStore.getPersonById(activity.actorPersonId)
          : null;
        return person?.name || person?.emailAddresses;
      })
      .filter(Boolean),
  );
  if (commentCount > 0) {
    formattedString.push(`${commentCount} ${pluralize('comment', commentCount)}`);
  }
  if (editCount > 0) {
    formattedString.push(`${editCount} ${pluralize('edit', editCount)}`);
  }

  return [
    formattedString.join(' & '),
    formattedTooltipString.length > 2
      ? `${formattedTooltipString.slice(0, -1).join(', ')} and ${formattedTooltipString.slice(-1)}`
      : formattedTooltipString.join(' and '),
  ];
};
*/

const ExpandedDocument = (props: IStore & { documentId: string; close: () => void }) => {
  const classes = useExpandStyles();
  const document = props.documentDataStore.getByLink(props.documentId);
  if (!document) {
    return null;
  }
  const activity = props.driveActivityStore.getDriveActivityForDocument(document.id) || [];
  const people = props.personDataStore.getPeopleForDriveActivity(activity);
  const driveActivityIds = activity.map((item) => item.id);
  const currentUserMeetings = props.timeDataStore.getSegmentsWithCurrentUserDriveActivity(
    driveActivityIds,
  );
  const segmentsWithDocumentInDescription = props.timeDataStore.getSegmentsWithDocumentInDescription(
    props.documentId,
  );
  const attendeeMeetings = props.timeDataStore.getSegmentsWithAttendeeDriveActivity(
    driveActivityIds,
  );
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
      <div className={classes.container}>
        <Typography variant="h6" className={classes.triGroupHeading}>
          Collaborators
        </Typography>
        <Typography className={classes.highlight}>
          <AvatarList people={people} shouldDisplayNone={true} />
        </Typography>
        <Typography variant="h6" className={classes.smallHeading}>
          Meetings where this document is listed in the description
        </Typography>
        <MeetingList
          segments={segmentsWithDocumentInDescription}
          personStore={props.personDataStore}
        />
        <Typography variant="h6" className={classes.smallHeading}>
          Meetings where you edited this document
        </Typography>
        <MeetingList segments={currentUserMeetings} personStore={props.personDataStore} />
        <Typography variant="h6" className={classes.smallHeading}>
          Meetings where attendees edited this document
        </Typography>
        <MeetingList segments={attendeeMeetings} personStore={props.personDataStore} />
      </div>
    </React.Fragment>
  );
};

export default ExpandedDocument;
