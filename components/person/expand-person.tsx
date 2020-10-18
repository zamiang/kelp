import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import MuiLink from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import { formatDuration } from 'date-fns';
import { isEmpty } from 'lodash';
import React from 'react';
import AttendeeList from '../shared/attendee-list';
import DriveActivity from '../shared/drive-activity';
import EmailsList from '../shared/emails-list';
import useExpandStyles from '../shared/expand-styles';
import MeetingList from '../shared/meeting-list';
import { IStore } from '../store/use-store';

const ADD_SENDER_LINK =
  'https://www.lifewire.com/add-a-sender-to-your-gmail-address-book-fast-1171918';

const ExpandPerson = (props: IStore & { personId: string }) => {
  const classes = useExpandStyles();
  const person = props.personDataStore.getPersonById(props.personId);
  if (!person) {
    return null;
  }
  const segments = (person.segmentIds || []).map((segmentId) =>
    props.timeDataStore.getSegmentById(segmentId),
  );
  const meetingTime = props.personDataStore.getMeetingTime(segments);
  const timeInMeetings = formatDuration(meetingTime.thisWeek);
  const timeInMeetingsLastWeek = formatDuration(meetingTime.lastWeek);
  const associates = props.personDataStore.getAssociates(props.personId, segments);
  return (
    <div className={classes.container}>
      <Box flexDirection="row" alignItems="flex-start" display="flex">
        <Avatar className={classes.avatar} src={person.imageUrl || ''}>
          {(person.name || person.id)[0]}
        </Avatar>
        <Typography className={classes.title} variant="h3" color="textPrimary" gutterBottom noWrap>
          {props.personDataStore.getPersonDisplayName(person)}
        </Typography>
      </Box>
      <Grid container spacing={3} className={classes.content}>
        {person.isMissingProfile && (
          <Grid item sm={7}>
            <MuiLink className={classes.link} target="_blank" href={ADD_SENDER_LINK}>
              Add this person to your google contacts for more info
            </MuiLink>
          </Grid>
        )}
        <Grid item sm={7}>
          {!isEmpty(person.driveActivity) && (
            <React.Fragment>
              <Typography variant="h6" className={classes.smallHeading}>
                Active Documents
              </Typography>
              <DriveActivity
                driveActivity={Object.values(person.driveActivity)}
                personStore={props.personDataStore}
                docStore={props.docDataStore}
              />
            </React.Fragment>
          )}
          {person.segmentIds.length > 0 && (
            <React.Fragment>
              <Typography variant="h6" className={classes.smallHeading}>
                Meetings
              </Typography>
              <MeetingList segments={segments} personStore={props.personDataStore} />
            </React.Fragment>
          )}
          {person.emailIds.length > 0 && (
            <React.Fragment>
              <Typography variant="h6" className={classes.smallHeading}>
                Emails
              </Typography>
              <EmailsList
                emailIds={person.emailIds}
                emailStore={props.emailDataStore}
                personStore={props.personDataStore}
              />
            </React.Fragment>
          )}
        </Grid>
        <Grid item sm={5}>
          {meetingTime.lastWeekMs > 0 && (
            <React.Fragment>
              <Typography variant="h6" className={classes.smallHeading}>
                Time in meetings
              </Typography>
              <div>
                <i>This week:</i> {timeInMeetings}
              </div>
              {meetingTime.lastWeekMs > 0 && (
                <div>
                  <i>Last week:</i> {timeInMeetingsLastWeek}
                </div>
              )}
            </React.Fragment>
          )}
          {associates.length > 0 && (
            <React.Fragment>
              <Typography variant="h6" className={classes.smallHeading}>
                Associates
              </Typography>
              <AttendeeList personStore={props.personDataStore} attendees={associates} />
            </React.Fragment>
          )}
        </Grid>
      </Grid>
    </div>
  );
};

export default ExpandPerson;
