import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import MuiLink from '@material-ui/core/Link';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import EmailIcon from '@material-ui/icons/Email';
import EventIcon from '@material-ui/icons/Event';
import { formatDistance, formatDuration } from 'date-fns';
import { isEmpty, last } from 'lodash';
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
  const timeInMeetings = formatDuration(meetingTime.thisWeek);
  const timeInMeetingsLastWeek = formatDuration(meetingTime.lastWeek);
  const associates = props.personDataStore.getAssociates(props.personId, segments);
  const hasName = !person.name.includes('people/') && !person.name.includes('@');
  return (
    <React.Fragment>
      <AppBar linkedinName={hasName ? person.name : undefined} onClose={props.close} />
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
          <List dense={true} className={classes.inlineList} disablePadding={true}>
            {person.emailAddress && (
              <MuiLink
                target="_blank"
                className={classes.link}
                rel="noreferrer"
                href={`mailto:${person.emailAddress}`}
              >
                <ListItem button={true}>
                  <ListItemIcon>
                    <EmailIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={person.emailAddress} />
                </ListItem>
              </MuiLink>
            )}
            {lastMeeting && (
              <Link href={`?tab=meetings&slug=${lastMeeting.id}`}>
                <ListItem button={true} className={classes.hideForMobile}>
                  <ListItemIcon>
                    <EventIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={formatDistance(lastMeeting.start, new Date(), { addSuffix: true })}
                  />
                </ListItem>
              </Link>
            )}
          </List>
        </Box>
      </div>
      <Divider />
      <div className={classes.container}>
        <Grid container spacing={3} className={classes.content}>
          {person.isMissingProfile && (
            <Grid item sm={7}>
              <MuiLink className={classes.link} target="_blank" href={ADD_SENDER_LINK}>
                Add this person to your google contacts for more info
              </MuiLink>
            </Grid>
          )}
          <Grid item sm={7}>
            <PersonNotes person={person} refetch={props.refetch} />
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
    </React.Fragment>
  );
};

export default ExpandPerson;
