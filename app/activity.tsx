import * as gapiTypes from "gapi";
import React from "react";
import { fetchFromGoogle } from "./fetch";

declare const gapi: gapiTypes;

const listDriveActivity = async () =>
  await gapi.client.driveactivity.activity.query({
    pageSize: 10,
  });

const Activity = () => {
  const [activity] = fetchFromGoogle("activity", listDriveActivity(), {});

  return <pre>ACTIVITY FILES:{JSON.stringify(activity)}</pre>;
};

export default Activity;
