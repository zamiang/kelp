import { intervalToDuration, subWeeks } from 'date-fns';
import config from '../../constants/config';
import { IFormattedAttendee, ISegment } from '../store/data-types';
import { IStore } from '../store/use-store';
import { getWeek } from './date-helpers';

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
  const attendeeStats = {} as any;
  attendees.forEach((a) => (attendeeStats[a[0]] = a[1]));
  return {
    attendees: attendees.map((a) => attendeeLookup[a[0]]),
    attendeeStats,
  };
};

export const getFormattedGuestStats = (attendees: IFormattedAttendee[]) => {
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

export const getPeopleSortedByCount = async (
  peopleIds: string[],
  personDataStore: IStore['personDataStore'],
) => {
  const peopleStats = peopleIds.reduce((acc: any, curr: any) => {
    acc[curr] ??= { [curr]: 0 };
    acc[curr][curr]++;
    return acc;
  }, {});
  const people = await personDataStore.getBulkByPersonId(peopleIds);
  const sortedPeople = people.sort((a, b) => peopleStats[b.id][b.id] - peopleStats[a.id][a.id]);
  return {
    sortedPeople,
    peopleStats,
  };
};
