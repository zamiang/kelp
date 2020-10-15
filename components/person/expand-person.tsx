import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import MuiLink from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { formatDuration, intervalToDuration } from 'date-fns';
import React from 'react';
import AttendeeList from '../shared/attendee-list';
import DriveActivity from '../shared/drive-activity';
import EmailsList from '../shared/emails-list';
import MeetingList from '../shared/meeting-list';
import { IPerson } from '../store/person-store';
import { IStore } from '../store/use-store';

const ADD_SENDER_LINK =
  'https://www.lifewire.com/add-a-sender-to-your-gmail-address-book-fast-1171918';

const useStyles = makeStyles((theme) => ({
  title: {
    paddingTop: 5,
    paddingLeft: theme.spacing(2),
  },
  container: {
    padding: theme.spacing(5),
    margin: 0,
    width: 'auto',
  },
  avatar: {
    height: 77,
    width: 77,
  },
  smallHeading: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(1),
    fontSize: theme.typography.body2.fontSize,
    textTransform: 'uppercase',
  },
  link: {
    color: theme.palette.primary.dark,
    display: 'block',
    marginTop: theme.spacing(2),
  },
}));

const getAssociates = (
  personId: string,
  person: IPerson,
  timeDataStore: IStore['timeDataStore'],
) => {
  const attendeeLookup = {};
  const associates = {} as any;
  person.segmentIds.map((segmentId) => {
    const segment = timeDataStore.getSegmentById(segmentId);
    if (segment) {
      segment?.formattedAttendees.map((attendee) => {
        if (
          attendee.personId &&
          attendee.personId !== personId &&
          !attendee.self &&
          attendee.responseStatus === 'accepted'
        ) {
          if (associates[attendee.personId]) {
            associates[attendee.personId]++;
          } else {
            attendeeLookup[attendee.personId] = attendee;
            associates[attendee.personId] = 1;
          }
        }
      });
    }
  });

  const attendees = Object.entries(associates).sort((a, b) => b[1] - a[1]);
  return attendees.map((a) => attendeeLookup[a[0]]);
};

const ExpandPerson = (props: IStore & { personId: string }) => {
  const classes = useStyles();
  const person = props.personDataStore.getPersonById(props.personId);
  if (!person) {
    return null;
  }
  const timeInMeetingsInMs = person.segmentIds
    ? person.segmentIds
        .map((segmentId) => {
          const segment = props.timeDataStore.getSegmentById(segmentId);
          return segment ? segment.end.valueOf() - segment.start.valueOf() : 0;
        })
        .reduce((a, b) => a + b, 0)
    : 0;
  const duration = intervalToDuration({
    start: new Date(0),
    end: new Date(timeInMeetingsInMs),
  });
  const timeInMeetings = formatDuration(duration);
  const associates = getAssociates(props.personId, person, props.timeDataStore);
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
      <Grid container spacing={3}>
        {person.isMissingProfile && (
          <Grid item xs={7}>
            <MuiLink className={classes.link} target="_blank" href={ADD_SENDER_LINK}>
              Add this person to your google contacts for more info
            </MuiLink>
          </Grid>
        )}
        <Grid item xs={7}>
          {person.driveActivityIds.length > 0 && (
            <React.Fragment>
              <Typography variant="h6" className={classes.smallHeading}>
                Active Documents
              </Typography>
              <DriveActivity
                driveActivityIds={person.driveActivityIds}
                driveActivityStore={props.driveActivityStore}
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
              <MeetingList
                segmentIds={person.segmentIds}
                timeStore={props.timeDataStore}
                personStore={props.personDataStore}
              />
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
        <Grid item xs={5}>
          <Typography variant="h6" className={classes.smallHeading}>
            Time in meetings this week
          </Typography>
          <div>{timeInMeetings}</div>
          <Typography variant="h6" className={classes.smallHeading}>
            Common associates
          </Typography>
          <AttendeeList personStore={props.personDataStore} attendees={associates} />
        </Grid>
      </Grid>
    </div>
  );
};

export default ExpandPerson;
