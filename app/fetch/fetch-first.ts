import { addDays, differenceInCalendarDays, subDays } from 'date-fns';
import { uniq } from 'lodash';
import { useState } from 'react';
import { useAsync } from 'react-async-hook';
import { DriveActivity, Target } from '../types/activity';

const NUMBER_OF_DAYS_BACK = 7;
const startDate = subDays(new Date(), NUMBER_OF_DAYS_BACK);

const getTargetInfo = (target: Target) => {
  if (target.drive) {
    // Not handling these
    console.warn('unable to get target info for', target);
    return null;
  } else if (target.driveItem) {
    return {
      title: target.driveItem.title,
      link: target.driveItem.name
        ? `https://docs.google.com/document/d/${target.driveItem.name.replace('items/', '')}`
        : null,
    };
  } else if (target.fileComment) {
    const parent = target.fileComment.parent;
    return {
      title: parent && parent.title,
      link:
        parent && parent.name
          ? `https://docs.google.com/document/d/${parent.name.replace('items/', '')}`
          : null,
    };
  } else {
    console.warn('unable to get target info for', target);
    return null;
  }
};

export interface IFormattedDriveActivity {
  id: string;
  time: Date;
  action: string;
  actorPersonId?: string | null;
  title?: string | null;
  link?: string | null;
}

const listDriveActivity = async () => {
  // Todo: Make driveactivity types
  const activityResponse = await (gapi.client as any).driveactivity.activity.query({
    pageSize: 100,
    filter: `detail.action_detail_case:(CREATE EDIT COMMENT) AND time >= "${startDate.toISOString()}"`,
  });
  const activity: DriveActivity[] =
    activityResponse && activityResponse.result && activityResponse.result.activities
      ? activityResponse.result.activities.filter(
          (activity: DriveActivity) =>
            activity.actors && activity.actors[0] && activity.actors[0].user,
        )
      : [];

  const formattedDriveActivity: IFormattedDriveActivity[] = activity.map((activity) => {
    const action = activity.primaryActionDetail
      ? Object.keys(activity.primaryActionDetail)[0]
      : 'unknown';
    const targetInfo = activity.targets ? getTargetInfo(activity.targets[0]) : null;
    const actor = activity.actors && activity.actors[0];
    const actorPersonId =
      actor && actor.user && actor.user.knownUser && actor.user.knownUser.personName;
    return {
      id: targetInfo && targetInfo.title ? targetInfo.title : 'no id',
      time: activity.timestamp ? new Date(activity.timestamp) : new Date(),
      action,
      actorPersonId,
      title: targetInfo && targetInfo.title,
      link: targetInfo && targetInfo.link,
    };
  });

  // these are returned as 'people ids'
  const peopleIds = formattedDriveActivity
    .filter((activity) => activity.actorPersonId)
    .map((activity) => activity.actorPersonId!);

  return { uniqueActorIds: uniq(peopleIds), activity: formattedDriveActivity };
};

export interface person {
  id: string;
  name: string;
  emailAddress: string;
  imageUrl?: string | null;
}

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
      emailAddress:
        person.person &&
        person.person.emailAddresses &&
        person.person.emailAddresses[0] &&
        person.person.emailAddresses[0].value
          ? person.person.emailAddresses[0].value
          : 'unknown',
      imageUrl:
        person.person &&
        person.person.photos &&
        person.person.photos[0] &&
        person.person.photos[0].url
          ? person.person.photos[0].url
          : null,
    }));
  if (formattedPeople) {
    addPeopleToStore(formattedPeople);
  }

  return { people: formattedPeople };
};

const listDriveFiles = async () => {
  // Does not allow filtering by modified time OR deleted
  const driveResponse = await gapi.client.drive.files.list({
    includeItemsFromAllDrives: true,
    includeTeamDriveItems: true,
    supportsAllDrives: true,
    supportsTeamDrives: true,
    orderBy: 'modifiedTime desc',
    pageSize: 30,
    fields:
      'nextPageToken, files(id, name, webViewLink, owners, shared, starred, trashed, modifiedTime)',
  });

  return driveResponse && driveResponse.result && driveResponse.result.files
    ? driveResponse.result.files.filter(
        (file) =>
          !file.trashed &&
          file.modifiedTime &&
          differenceInCalendarDays(new Date(), new Date(file.modifiedTime)) < NUMBER_OF_DAYS_BACK,
      )
    : [];
};

/**
 * The attendee's response status. Possible values are:
 * - "needsAction" - The attendee has not responded to the invitation.
 * - "declined" - The attendee has declined the invitation.
 * - "tentative" - The attendee has tentatively accepted the invitation.
 * - "accepted" - The attendee has accepted the invitation.
 */
type responseStatus = 'needsAction' | 'declined' | 'tentative' | 'accepted';

// todo move these
export type attendee = {
  email?: string;
  responseStatus?: string;
  self?: boolean;
};

export interface ICalendarEvent {
  id: string;
  link?: string;
  summary?: string;
  start: Date;
  end: Date;
  description?: string;
  selfResponseStatus: responseStatus | 'needsAction';
  attendees?: attendee[];
}

export const getSelfResponseStatus = (attendees: attendee[]) => {
  for (const person of attendees) {
    if (person.self) {
      return person.responseStatus as responseStatus;
    }
  }
  return 'needsAction';
};

const listCalendarEvents = async (addEmailAddressesToStore: (emails: string[]) => any) => {
  const calendarResponse = await gapi.client.calendar.events.list({
    calendarId: 'primary',
    maxAttendees: 10,
    maxResults: 80,
    singleEvents: true,
    orderBy: 'updated', // starttime does not work :shrug:
    timeMin: startDate.toISOString(),
    timeMax: addDays(new Date(), 1).toISOString(),
  });

  const filteredCalendarEvents =
    calendarResponse && calendarResponse.result && calendarResponse.result.items
      ? calendarResponse.result.items
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
    calendarEvents: filteredCalendarEvents
      .filter(
        (event) =>
          event.id && event.start && event.start.dateTime && event.end && event.end.dateTime,
      )
      .map((event) => ({
        id: event.id!,
        link: event.htmlLink,
        summary: event.summary,
        start: new Date(event.start!.dateTime!),
        end: new Date(event.end!.dateTime!),
        // TODO: Handle lack of enum type in the google calendar library
        selfResponseStatus: getSelfResponseStatus(event.attendees || []),
        attendees: event.attendees,
        description: event.description,
      })),
    // calendar events return little attendee information beyond email addresses (contradicting docs)
    uniqueAttendeeEmails,
  };
};

export interface IProps {
  accessToken: string;
}

const initialPersonList: person[] = [];
const initialEmailList: string[] = [];

/**
 * Fetches data that can be fetched in parallel and creates the person store object
 */
const FetchFirst = (accessToken: string) => {
  const [personList, setPersonList] = useState(initialPersonList);
  const [emailList, setEmailList] = useState(initialEmailList);
  const addPeopleToStore = (people: person[]) => {
    // TODO: Add and diff here
    setPersonList(people);
  };
  const addEmailAddressesToStore = (emailAddresses: string[]) => {
    setEmailList(emailAddresses);
  };

  const driveResponse = useAsync(listDriveFiles, [accessToken]);
  const activityResponse = useAsync(listDriveActivity, [accessToken]);
  const calendarResponse = useAsync(() => listCalendarEvents(addEmailAddressesToStore), [
    accessToken,
  ]);
  const peopleIds =
    activityResponse.result && activityResponse.result.uniqueActorIds
      ? activityResponse.result.uniqueActorIds
      : [];
  // this has a sideffect of updating the store
  const peopleResponse = useAsync(() => batchFetchPeople(peopleIds, addPeopleToStore), [
    peopleIds.length,
  ]);

  return {
    isLoading:
      driveResponse.loading &&
      activityResponse.loading &&
      calendarResponse.loading &&
      peopleResponse.loading,
    personList,
    emailList,
    calendarEvents: calendarResponse.result ? calendarResponse.result.calendarEvents : [],
    driveFiles: driveResponse.result,
    driveActivity: activityResponse.result ? activityResponse.result.activity : [],
    lastUpdated: new Date(),
  };
};

export default FetchFirst;
