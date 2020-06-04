import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import clsx from 'clsx';
import { addDays, differenceInCalendarDays, subDays } from 'date-fns';
import { uniq } from 'lodash';
import React, { useState } from 'react';
import { useAsync } from 'react-async-hook';
import { DriveActivity } from './activity';
import { styles } from './app';
import Copyright from './copyright';
import Docs from './docs';
import LeftDrawer from './left-drawer';
import TopBar from './top-bar';

// Note: Lots more info on this object but is unused by the app
const initialGoogleState = {
  accessToken: '',
};

export type googleState = typeof initialGoogleState;

const loadLibraries = () => {
  gapi.client.init({
    discoveryDocs: [
      'https://www.googleapis.com/discovery/v1/apis/people/v1/rest',
      'https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest',
      'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
      'https://www.googleapis.com/discovery/v1/apis/driveactivity/v2/rest',
      'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
    ],
  });
  return null;
};

gapi.load('client', loadLibraries);

const listDriveActivity = async () => {
  // Todo: Make driveactivity types
  const activityResponse = await (gapi.client as any).driveactivity.activity.query({
    pageSize: 100,
    filter: `detail.action_detail_case:(CREATE EDIT COMMENT) AND time >= "${subDays(
      new Date(),
      30,
    ).toISOString()}"`,
  });
  const activity =
    activityResponse && activityResponse.result && activityResponse.result.activities
      ? activityResponse.result.activities.filter(
          (activity: DriveActivity) =>
            activity.actors &&
            activity.actors[0] &&
            activity.actors[0].user &&
            !activity.actors[0].user.isCurrentUser,
        )
      : [];

  // these are returned as 'people ids'
  const peopleIds: string[] = [];
  (activity || []).map((activity: DriveActivity) => {
    if (activity && activity.actors) {
      activity.actors.map((actor) => {
        if (
          actor.user &&
          actor.user.knownUser &&
          actor.user.knownUser.personName &&
          !actor.user.isCurrentUser
        ) {
          peopleIds.push(actor.user.knownUser.personName);
        }
      });
    }
  });

  const people =
    peopleIds.length > 0
      ? await gapi.client.people.people.getBatchGet({
          personFields: 'names,nicknames,emailAddresses,photos',
          resourceNames: uniq(peopleIds),
        })
      : { result: null };

  const formattedPeople =
    people.result &&
    people.result.responses &&
    people.result.responses.map((person) => ({
      id: person.requestedResourceName || 'unknown',
      name:
        person.person && person.person.names && person.person.names[0].displayName
          ? person.person.names[0].displayName
          : 'unknown',

      email:
        person.person &&
        person.person.emailAddresses &&
        person.person.emailAddresses[0] &&
        person.person.emailAddresses[0].value
          ? person.person.emailAddresses[0].value
          : 'unknown',
    }));

  return { people: formattedPeople, activity };
};

// TODO: Figure out how to list people on a file
const listDriveFiles = async () => {
  // Does not allow filtering by modified time OR deleted
  const driveResponse = await gapi.client.drive.files.list({
    includeItemsFromAllDrives: true,
    includeTeamDriveItems: true,
    supportsAllDrives: true,
    supportsTeamDrives: true,
    orderBy: 'modifiedTime desc',
    pageSize: 10,
    fields:
      'nextPageToken, files(id, name, webViewLink, owners, shared, starred, trashed, modifiedTime)',
  });

  return driveResponse && driveResponse.result && driveResponse.result.files
    ? driveResponse.result.files.filter(
        (file) =>
          !file.trashed &&
          file.modifiedTime &&
          differenceInCalendarDays(new Date(), new Date(file.modifiedTime)) < 30,
      )
    : [];
};

const listCalendarEvents = async () => {
  const calendarResponse = await gapi.client.calendar.events.list({
    calendarId: 'primary',
    maxAttendees: 10,
    maxResults: 10,
    orderBy: 'updated', // starttime does not work :shrug:
    timeMin: subDays(new Date(), 30).toISOString(),
    timeMax: addDays(new Date(), 1).toISOString(),
  });

  return calendarResponse && calendarResponse.result && calendarResponse.result.items
    ? calendarResponse.result.items.filter((event) => event.attendees)
    : [];
};

type person = {
  id: string;
  name: string;
  email: string;
};

// TODO: Figure out why gapi.client.gmail isn't imported
const listEmails = async (people: person[]) => {
  const formattedEmails = people.map((person) => `from:${person.email}`);
  return await (gapi.client as any).gmail.users.messages.list({
    userId: 'me',
    q: `newer_than:30d ${formattedEmails.join(' OR ')}`,
  });
};

interface IProps {
  classes: styles;
  accessToken: string;
}

const Dashboard = (props: IProps) => {
  const classes = props.classes;
  const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);
  const [isOpen, setOpen] = useState(true);
  const handleDrawerOpen = () => {
    setOpen(true);
  };
  const handleDrawerClose = () => {
    setOpen(false);
  };

  const driveResponse = useAsync(listDriveFiles, [props.accessToken]);
  const activityResponse = useAsync(listDriveActivity, [props.accessToken]);
  const calendarResponse = useAsync(listCalendarEvents, [props.accessToken]);
  const people =
    activityResponse.result && activityResponse.result.people ? activityResponse.result.people : [];
  const gmailResponse = useAsync(() => listEmails(people), [people.length]);

  return (
    <React.Fragment>
      <TopBar classes={classes} handleDrawerOpen={handleDrawerOpen} isOpen={isOpen} />
      <LeftDrawer
        classes={classes}
        handleDrawerClose={handleDrawerClose}
        isOpen={isOpen}
        people={activityResponse.result && activityResponse.result.people}
      />
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <Container maxWidth="lg" className={classes.container}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8} lg={9}>
              <Paper className={fixedHeightPaper}>foo</Paper>
            </Grid>
            <Grid item xs={12} md={4} lg={3}>
              <Paper className={fixedHeightPaper}>Other stuff</Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper className={classes.paper}>
                {driveResponse.loading && <div>Loading</div>}
                <Docs docs={driveResponse} />
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper className={classes.paper}>
                {activityResponse.loading && <div>Loading</div>}
                {JSON.stringify(activityResponse)}
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper className={classes.paper}>
                {gmailResponse.loading && <div>Loading</div>}
                {JSON.stringify(gmailResponse)}
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper className={classes.paper}>
                {calendarResponse.loading && <div>Loading</div>}
                {JSON.stringify(calendarResponse)}
              </Paper>
            </Grid>
          </Grid>
          <Box pt={4}>
            <Copyright />
          </Box>
        </Container>
      </main>
    </React.Fragment>
  );
};

export default Dashboard;
