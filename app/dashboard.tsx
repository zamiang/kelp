import Box from "@material-ui/core/Box";
import Container from "@material-ui/core/Container";
import CssBaseline from "@material-ui/core/CssBaseline";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import clsx from "clsx";
import React, { useState } from "react";
import { styles } from "./app";
import Copyright from "./copyright";
import { fetchFromGoogle } from "./fetch";
import LeftDrawer from "./left-drawer";
import TopBar from "./top-bar";

// Note: Lots more info on this object but is unused by the app
const initialGoogleState = {
  accessToken: "",
};

export type googleState = typeof initialGoogleState;

const loadLibraries = () => {
  gapi.client.init({
    discoveryDocs: [
      "https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest",
      "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
      "https://www.googleapis.com/discovery/v1/apis/driveactivity/v2/rest",
      "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
    ],
  });
  return null;
};

gapi.load("client", loadLibraries);

const listDriveActivity = async () =>
  // Todo: Make driveactivity types
  await (gapi.client as any).driveactivity.activity.query({
    pageSize: 10,
  });

const listDriveFiles = async () =>
  await gapi.client.drive.files.list({
    includeItemsFromAllDrives: true,
    includeTeamDriveItems: true,
    supportsAllDrives: true,
    supportsTeamDrives: true,
    orderBy: "modifiedTime desc",
    pageSize: 10,
    fields: "nextPageToken, files(id, name)",
  });

interface IProps {
  classes: styles;
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

  const [driveFiles] = fetchFromGoogle("drive", listDriveFiles(), {});
  const [activity] = fetchFromGoogle("activity", listDriveActivity(), {});

  return (
    <div className={classes.root}>
      <CssBaseline />
      <TopBar
        classes={classes}
        handleDrawerOpen={handleDrawerOpen}
        isOpen={isOpen}
      />
      <LeftDrawer
        classes={classes}
        handleDrawerClose={handleDrawerClose}
        isOpen={isOpen}
      />
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <Container maxWidth="lg" className={classes.container}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8} lg={9}>
              <Paper className={fixedHeightPaper}>
                <pre>ACTIVITY:{JSON.stringify(activity)}</pre>
                <pre>DRIVE FILES:{JSON.stringify(driveFiles)}</pre>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4} lg={3}>
              <Paper className={fixedHeightPaper}>Other stuff</Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper className={classes.paper}>more stuff</Paper>
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
