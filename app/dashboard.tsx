import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import CssBaseline from '@material-ui/core/CssBaseline';
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

const listDriveActivity = async () =>
  // Todo: Make driveactivity types
  await (gapi.client as any).driveactivity.activity.query({
    pageSize: 10,
  });

// TODO: Figure out how to list people on a file
const listDriveFiles = async () =>
  // Does not allow filtering by modified time OR deleted
  await gapi.client.drive.files.list({
    includeItemsFromAllDrives: true,
    includeTeamDriveItems: true,
    supportsAllDrives: true,
    supportsTeamDrives: true,
    orderBy: 'modifiedTime desc',
    pageSize: 10,
    fields: 'nextPageToken, files(id, name, webViewLink, shared, starred, trashed, modifiedTime)',
  });

const listCalendarEvents = async () =>
  await gapi.client.calendar.events.list({
    calendarId: 'primary',
    maxAttendees: 10,
    maxResults: 10,
    orderBy: 'updated', // starttime does not work :shrug:
    timeMin: subDays(new Date(), 30).toISOString(),
    timeMax: addDays(new Date(), 1).toISOString(),
  });

const lookupPeople = async (people: string[]) =>
  await gapi.client.people.people.getBatchGet({
    fields: 'name, nicknames, emailAddresses, photos',
    resourceNames: uniq(people),
  });

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

  const filteredDriveActivity =
    activityResponse && activityResponse.result && activityResponse.result.result.activities
      ? activityResponse.result.result.activities.filter(
          (activity: DriveActivity) =>
            activity.actors &&
            activity.actors[0] &&
            activity.actors[0].user &&
            !activity.actors[0].user.isCurrentUser,
        )
      : [];
  const filteredDriveFiles =
    driveResponse && driveResponse.result && driveResponse.result.result.files
      ? driveResponse.result.result.files.filter(
          (file) =>
            !file.trashed &&
            file.modifiedTime &&
            differenceInCalendarDays(new Date(), new Date(file.modifiedTime)) < 30,
        )
      : [];
  const filteredCalendarEvents =
    calendarResponse && calendarResponse.result && calendarResponse.result.result.items
      ? calendarResponse.result.result.items.filter((event) => event.attendees)
      : [];

  const people: string[] = [];
  filteredDriveActivity.map((activity: DriveActivity) => {
    if (activity && activity.actors) {
      activity.actors.map((actor) => {
        if (
          actor.user &&
          actor.user.knownUser &&
          actor.user.knownUser.personName &&
          !actor.user.isCurrentUser
        ) {
          people.push(actor.user.knownUser.personName);
        }
      });
    }
  });
  const peopleResponse = useAsync(() => lookupPeople(people), [props.accessToken]);

  return (
    <div className={classes.root}>
      <CssBaseline />
      <TopBar classes={classes} handleDrawerOpen={handleDrawerOpen} isOpen={isOpen} />
      <LeftDrawer classes={classes} handleDrawerClose={handleDrawerClose} isOpen={isOpen} />
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
                <Docs docs={filteredDriveFiles} />
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper className={classes.paper}>
                {driveResponse.loading && <div>Loading</div>}
                {JSON.stringify(filteredDriveActivity)}
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper className={classes.paper}>
                {peopleResponse.loading && <div>Loading</div>}
                {JSON.stringify(peopleResponse)}
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper className={classes.paper}>
                {calendarResponse.loading && <div>Loading</div>}
                {JSON.stringify(filteredCalendarEvents)}
              </Paper>
            </Grid>
          </Grid>
          <Box pt={4}>
            <Copyright />
          </Box>
        </Container>
      </main>
    </div>
  );
};

export default Dashboard;
