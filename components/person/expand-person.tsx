import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import MuiLink from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import { formatDistance, formatDuration } from 'date-fns';
import { last } from 'lodash';
import Link from 'next/link';
import React from 'react';
import AttendeeList from '../shared/attendee-list';
import DriveActivity from '../shared/documents-from-drive-activity';
import AppBar from '../shared/elevate-app-bar';
import useExpandStyles from '../shared/expand-styles';
import MeetingList from '../shared/meeting-list';
import { IStore } from '../store/use-store';
import PersonNotes from './person-notes';

const ADD_SENDER_LINK =
  'https://www.lifewire.com/add-a-sender-to-your-gmail-address-book-fast-1171918';

const ExpandPerson = (props: IStore & { personId: string; close: () => void }) => {
  const classes = useExpandStyles();
  const person = props.personDataStore.getPersonById(props.personId);
  if (!person) {
    return null;
  }
  const segments = (person.segmentIds || []).map((segmentId) =>
    props.timeDataStore.getSegmentById(segmentId),
  );
  const lastMeeting = last(segments);
  const meetingTime = props.personDataStore.getMeetingTime(segments);
  const timeInMeetings = formatDuration(meetingTime.thisWeek)
    .replace(' hours', 'h')
    .replace(' minutes', 'm');
  const timeInMeetingsLastWeek = formatDuration(meetingTime.lastWeek)
    .replace(' hours', 'h')
    .replace(' minutes', 'm');
  const associates = props.personDataStore.getAssociates(props.personId, segments);
  const hasName = !person.name.includes('people/') && !person.name.includes('@');
  const hasMeetingTime = meetingTime.lastWeekMs > 0;
  return (
    <React.Fragment>
      <AppBar
        linkedinName={hasName ? person.name : undefined}
        onClose={props.close}
        emailAddress={person.emailAddresses[0]}
      />
      <div className={classes.topContainer}>
        <Box flexDirection="column" alignItems="center" display="flex">
          <Avatar className={classes.avatar} src={person.imageUrl || ''}>
            {(person.name || person.id)[0]}
          </Avatar>
          <Typography
            className={classes.title}
            variant="h5"
            color="textPrimary"
            gutterBottom
            noWrap
          >
            {props.personDataStore.getPersonDisplayName(person)}
          </Typography>
          <PersonNotes person={person} refetch={props.refetch} />
        </Box>
      </div>
      <Divider />
      <Grid container className={classes.triGroup} justify="space-between">
        <Grid item xs className={classes.triGroupItem}>
          <Typography variant="h6" className={classes.triGroupHeading}>
            Last meeting
          </Typography>
          {lastMeeting && (
            <Link href={`?tab=meetings&slug=${lastMeeting.id}`}>
              <Typography className={classes.highlight}>
                <div className={classes.highlightValue} style={{ fontSize: '1.3094rem' }}>
                  {formatDistance(lastMeeting.start, new Date(), { addSuffix: true })}
                </div>
              </Typography>
            </Link>
          )}
          {!lastMeeting && (
            <Typography className={classes.highlight}>
              <span className={classes.highlightValue}>None</span>
            </Typography>
          )}
        </Grid>
        <div className={classes.triGroupBorder}></div>
        <Grid item xs className={classes.triGroupItem}>
          <Typography variant="h6" className={classes.triGroupHeading}>
            Meetings this week
          </Typography>
          <Typography className={classes.highlight}>
            <span className={classes.highlightValue}>{timeInMeetings || 'None'} </span>
            {hasMeetingTime && (
              <span className={classes.highlightSub}>from {timeInMeetingsLastWeek || 'None'}</span>
            )}
          </Typography>
        </Grid>
      </Grid>
      <Divider />
      <div className={classes.container}>
        {person.isMissingProfile && (
          <MuiLink className={classes.link} target="_blank" href={ADD_SENDER_LINK}>
            Add this person to your google contacts for more info
          </MuiLink>
        )}
        <React.Fragment>
          <Typography variant="h6" className={classes.smallHeading}>
            Documents they have edited
          </Typography>
          <DriveActivity
            driveActivity={Object.values(person.driveActivity)}
            personStore={props.personDataStore}
            docStore={props.documentDataStore}
          />
        </React.Fragment>
        <React.Fragment>
          <Typography variant="h6" className={classes.smallHeading}>
            Associates
          </Typography>
          <AttendeeList personStore={props.personDataStore} attendees={associates} />
        </React.Fragment>
        <React.Fragment>
          <Typography variant="h6" className={classes.smallHeading}>
            Meetings you both attended
          </Typography>
          <MeetingList segments={segments} personStore={props.personDataStore} />
        </React.Fragment>
      </div>
    </React.Fragment>
  );
};

export default ExpandPerson;
