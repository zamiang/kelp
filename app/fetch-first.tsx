import { addDays, differenceInCalendarDays, subDays } from 'date-fns';
import { uniq } from 'lodash';
import React, { useState } from 'react';
import { useAsync } from 'react-async-hook';
import { DriveActivity } from './activity';
import { styles } from './app';
import FetchSecond from './fetch-second';

const listDriveActivity = async () => {
  // Todo: Make driveactivity types
  const activityResponse = await (gapi.client as any).driveactivity.activity.query({
    pageSize: 100,
    filter: `detail.action_detail_case:(CREATE EDIT COMMENT) AND time >= "${subDays(
      new Date(),
      30,
    ).toISOString()}"`,
  });
  const activity: DriveActivity[] =
    activityResponse && activityResponse.result && activityResponse.result.activities
      ? activityResponse.result.activities.filter(
          (activity: DriveActivity) =>
            activity.actors && activity.actors[0] && activity.actors[0].user,
        )
      : [];

  // these are returned as 'people ids'
  const peopleIds: string[] = [];
  (activity || []).map((activity) => {
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

  return { uniqueActorIds: uniq(peopleIds), activity };
};

export type person = {
  id: string;
  name: string;
  email: string;
};

const batchFetchPeople = async (
  peopleIds: string[],
  addPeopleToStore: (people: person[]) => void,
) => {
  if (peopleIds.length < 1) {
    return { people: [] };
  }
  const people = await gapi.client.people.people.getBatchGet({
    personFields: 'names,nicknames,emailAddresses,photos',
    resourceNames: peopleIds,
  });

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
  if (formattedPeople) {
    addPeopleToStore(formattedPeople);
  }

  return { people: formattedPeople };
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

export interface ICalendarEvent {
  id: string;
  link?: string;
  summary?: string;
  start?: string;
  end?: string;
  attendees?: {
    email?: string;
    responseStatus?: string;
    self?: boolean;
  }[];
}

const listCalendarEvents = async (addEmailAddressesToStore: (emails: string[]) => any) => {
  const calendarResponse = await gapi.client.calendar.events.list({
    calendarId: 'primary',
    maxAttendees: 10,
    maxResults: 10,
    orderBy: 'updated', // starttime does not work :shrug:
    timeMin: subDays(new Date(), 30).toISOString(),
    timeMax: addDays(new Date(), 1).toISOString(),
  });

  const filteredCalendarEvents =
    calendarResponse && calendarResponse.result && calendarResponse.result.items
      ? calendarResponse.result.items.filter(
          (event) => event.attendees && event.attendees.length > 0,
        )
      : [];

  const emailAddresses: string[] = [];
  filteredCalendarEvents.map((event) =>
    (event.attendees || []).map((attendee) => {
      attendee.email && emailAddresses.push(attendee.email);
    }),
  );

  const uniqueAttendeeEmails = uniq(emailAddresses);
  addEmailAddressesToStore(uniqueAttendeeEmails);

  return {
    calendarEvents: filteredCalendarEvents.map((event) => ({
      id: event.id || 'wtf',
      link: event.htmlLink,
      summary: event.summary,
      start: event.start && event.start.dateTime,
      end: event.end && event.end.dateTime,
      attendees: event.attendees,
    })),
    // calendar events return little attendee information beyond email addresses (contradicting docs)
    uniqueAttendeeEmails,
  };
};

export interface IProps {
  classes: styles;
  accessToken: string;
}

const initialPersonList: person[] = [];
const initialEmailList: string[] = [];

/**
 * Fetches data that can be fetched in parallel and creates the person store object
 */
const FetchFirst = (props: IProps) => {
  const [personList, setPersonList] = useState(initialPersonList);
  const [emailList, setEmailList] = useState(initialEmailList);
  const addPeopleToStore = (people: person[]) => {
    // TODO: Add and diff here
    setPersonList(people);
  };
  const addEmailAddressesToStore = (emailAddresses: string[]) => {
    setEmailList(emailAddresses);
  };

  const driveResponse = useAsync(listDriveFiles, [props.accessToken]);
  const activityResponse = useAsync(listDriveActivity, [props.accessToken]);
  const calendarResponse = useAsync(() => listCalendarEvents(addEmailAddressesToStore), [
    props.accessToken,
  ]);
  const peopleIds =
    activityResponse.result && activityResponse.result.uniqueActorIds
      ? activityResponse.result.uniqueActorIds
      : [];
  // this has a sideffect of updating the store
  useAsync(() => batchFetchPeople(peopleIds, addPeopleToStore), [peopleIds.length]);

  return (
    <React.Fragment>
      <FetchSecond
        personList={personList}
        emailList={emailList}
        calendarEvents={calendarResponse.result ? calendarResponse.result.calendarEvents : []}
        driveFiles={driveResponse.result}
        driveActivity={activityResponse.result ? activityResponse.result.activity : []}
        {...props}
      />
    </React.Fragment>
  );
};

export default FetchFirst;
