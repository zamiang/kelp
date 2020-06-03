import * as gapiTypes from "gapi";
import React from "react";
import { googleState, styles } from "./app";
import { fetchFromGoogle } from "./fetch";

declare const gapi: gapiTypes;

/*
 * check signed in: gapi.auth2.getAuthInstance().isSignedIn.get()
 */

const loadLibraries = () =>
  gapi.client.init({
    discoveryDocs: [
      "https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest",
      "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
      "https://www.googleapis.com/discovery/v1/apis/driveactivity/v2/rest",
      "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
    ],
  });

gapi.load("client", loadLibraries);

interface IProps {
  classes: styles;
  googleLoginState: googleState;
}

const listDriveActivity = async () =>
  await gapi.client.driveactivity.activity.query({
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

const Vis = (props: IProps) => {
  const classes = props.classes;
  const [driveFiles] = fetchFromGoogle("drive", listDriveFiles(), {});
  const [activity] = fetchFromGoogle("activity", listDriveActivity(), {});

  return (
    <div className={classes.wrapper}>
      omg
      <pre>ACTIVITY:{JSON.stringify(activity)}</pre>
      <pre>DRIVE FILES:{JSON.stringify(driveFiles)}</pre>
    </div>
  );
};

export default Vis;
