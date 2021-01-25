import { intervalToDuration, subDays, subWeeks } from 'date-fns';
import { flatten, sortBy, uniqBy } from 'lodash';
import config from '../../constants/config';
import { IFormattedDriveActivity } from '../fetch/fetch-drive-activity';
import { getWeek } from '../shared/date-helpers';
import { IFormattedAttendee } from './models/attendee-model';
import { IDocument } from './models/document-model';
import { IPerson } from './models/person-model';
import { ISegment } from './models/segment-model';
import { IStore } from './use-store';

export const getMeetingTime = (segments: (ISegment | undefined)[]) => {
  const currentWeek = getWeek(new Date());
  const previousWeek = getWeek(subWeeks(new Date(), 1));
  const timeInMeetingsInMs = segments
    .map((segment) =>
      segment && getWeek(segment.start) === currentWeek
        ? segment.end.valueOf() - segment.start.valueOf()
        : 0,
    )
    .reduce((a, b) => a + b, 0);
  const timeInMeetingsPriorWeekInMs = segments
    .map((segment) =>
      segment && getWeek(segment.start) === previousWeek
        ? segment.end.valueOf() - segment.start.valueOf()
        : 0,
    )
    .reduce((a, b) => a + b, 0);
  const duration = intervalToDuration({
    start: new Date(0),
    end: new Date(timeInMeetingsInMs),
  });

  const durationPriorWeek = intervalToDuration({
    start: new Date(0),
    end: new Date(timeInMeetingsPriorWeekInMs),
  });

  return {
    thisWeek: duration,
    thisWeekMs: timeInMeetingsInMs,
    lastWeek: durationPriorWeek,
    lastWeekMs: timeInMeetingsPriorWeekInMs,
  };
};

export const getDriveActivityWhileMeetingWith = (
  people: IPerson[],
  timeDataStore: IStore['timeDataStore'],
  driveActivityStore: IStore['driveActivityStore'],
) => {
  const activityIds = flatten(
    people.map((person) => {
      const segmentIds = person.segmentIds;
      const driveActivityIds = segmentIds.map(
        (id) => timeDataStore.getSegmentById(id)!.currentUserDriveActivityIds,
      );
      return flatten(driveActivityIds);
    }),
  );
  return activityIds.map((id) => driveActivityStore.getById(id)!);
};

export const getAssociates = async (
  personId: string,
  segments: (ISegment | undefined)[],
  attendeeDataStore: IStore['attendeeDataStore'],
) => {
  const attendeeLookup = {} as any;
  const associates = {} as any;
  await Promise.all(
    segments.map(async (segment) => {
      if (
        segment &&
        segment.attendees.length < config.MAX_MEETING_ATTENDEE_TO_COUNT_AN_INTERACTION
      ) {
        const attendees = await attendeeDataStore.getAllForSegmentId(segment.id);
        attendees.map((attendee) => {
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
    }),
  );

  const attendees = Object.entries(associates).sort((a: any, b: any) => b[1] - a[1]);
  return attendees.map((a) => attendeeLookup[a[0]]);
};

export const getPeopleMeetingWithOnDay = async (
  timeDataStore: IStore['timeDataStore'],
  date: Date,
  shouldExcludeSelf: boolean,
) => {
  const meetings = timeDataStore.getSegmentsForDay(date);
  return sortBy(
    uniqBy(flatten(meetings.map((segment) => segment.formattedAttendees)), 'personId')
      .map((attendee) => this.getPersonById(attendee.personId))
      .filter((person) => (shouldExcludeSelf ? !person?.isCurrentUser : true)),
    'name',
  );
};

export const getPeopleMeetingWithThisWeek = async (
  timeDataStore: IStore['timeDataStore'],
  shouldExcludeSelf: boolean,
) => {
  const meetingsThisWeek = timeDataStore.getSegmentsForWeek(getWeek(new Date()));
  return sortBy(
    uniqBy(flatten(meetingsThisWeek.map((segment) => segment.formattedAttendees)), 'personId')
      .map((attendee) => this.getPersonById(attendee.personId))
      .filter((person) => (shouldExcludeSelf ? !person?.isCurrentUser : true)),
    'name',
  );
};

export const getPeopleForDriveActivity = async (
  activity: IFormattedDriveActivity[],
  personDataStore: IStore['personDataStore'],
) => {
  const people = await Promise.all(
    uniqBy(activity, 'actorPersonId')
      .filter((activity) => !!activity.actorPersonId)
      .map(async (activity) => personDataStore.getPersonById(activity.actorPersonId!)),
  );

  return people.filter((person) => person && person.id) as IPerson[];
};

export const getDocsRecentlyEditedByCurrentUser = (
  driveActivityStore: IStore['driveActivityStore'],
  personDataStore: IStore['personDataStore'],
) => {
  const driveActivity = driveActivityStore.getAll();
  const minTime = subDays(new Date(), 7);
  return (uniqBy(
    driveActivity
      .filter((activity) => {
        const person =
          activity.actorPersonId && personDataStore.getPersonById(activity.actorPersonId);
        if (person && person.isCurrentUser) {
          return activity.time > minTime;
        }
        return false;
      })
      .map(
        (driveActivity) =>
          driveActivity && driveActivity.link && this.getByLink(driveActivity.link),
      )
      .filter((doc) => doc && doc.id),
    'id',
  ) as IDocument[]).sort((a, b) => (a.name! < b.name! ? -1 : 1));
};

export const getDocumentsForDay = (
  timeDataStore: IStore['timeDataStore'],
  driveActivityStore: IStore['driveActivityStore'],
  day: Date,
) => {
  const driveActivityIdsForDay = timeDataStore.getDriveActivityIdsForDate(day);
  const documentsFromActivity: any[] = driveActivityIdsForDay
    .map((id) => id && driveActivityStore.getById(id))
    .map(
      (driveActivity) => driveActivity && driveActivity.link && this.getByLink(driveActivity.link),
    )
    .filter((doc) => doc && doc.id);

  const documentIdsForDay = timeDataStore.getListedDocumentIdsForDay(day);
  const listedDocuments = documentIdsForDay.map((id) => this.getByLink(id)).filter(Boolean);
  const concattedDocuments = uniqBy(listedDocuments.concat(documentsFromActivity), 'id');
  return concattedDocuments.sort((a: any, b: any) =>
    a?.name.toLowerCase().localeCompare(b?.name.toLowerCase()),
  );
};

export const getDocumentsForThisWeek = (
  timeDataStore: IStore['timeDataStore'],
  driveActivityStore: IStore['driveActivityStore'],
) => {
  const driveActivityIdsForThisWeek = timeDataStore.getDriveActivityIdsForWeek(getWeek(new Date()));
  return (uniqBy(
    driveActivityIdsForThisWeek
      .map((id) => id && driveActivityStore.getById(id))
      .map(
        (driveActivity) =>
          driveActivity && driveActivity.link && this.getByLink(driveActivity.link),
      )
      .filter((doc) => doc && doc.id),
    'id',
  ) as IDocument[]).sort((a: any, b: any) =>
    a?.name.toLowerCase().localeCompare(b?.name.toLowerCase()),
  );
};

export const getFormattedGuestStats = async (attendees: IFormattedAttendee[]) => {
  const guestStatsHash = {
    needsAction: 'awaiting response',
    declined: 'no',
    tentative: 'maybe',
    accepted: 'yes',
    notAttending: 'no',
  } as any;
  if (attendees.length < 2) {
    return null;
  }
  const guestStats = {
    accepted: 0,
    tentative: 0,
    needsAction: 0,
    declined: 0,
    notAttending: 0,
  } as any;
  attendees.map((attendee) => attendee.responseStatus && guestStats[attendee.responseStatus]++);

  return Object.keys(guestStats)
    .map((key) => {
      if (guestStats[key]) {
        // eslint-disable-next-line
        return `${guestStats[key as any]} ${guestStatsHash[key]}`;
      }
      return false;
    })
    .filter((text) => !!text)
    .join(', ');
};
