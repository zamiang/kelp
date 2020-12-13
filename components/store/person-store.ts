import { intervalToDuration, subWeeks } from 'date-fns';
import { first, flatten, sortBy, uniq, uniqBy } from 'lodash';
import config from '../../constants/config';
import { ICalendarEvent } from '../fetch/fetch-calendar-events';
import { IFormattedDriveActivity } from '../fetch/fetch-drive-activity';
import { person as GooglePerson } from '../fetch/fetch-people';
import { getWeek } from '../shared/date-helpers';
import { ISegment } from './time-store';
import { IStore } from './use-store';

export interface IPerson {
  id: string;
  name: string;
  emailAddresses: string[];
  imageUrl?: string | null;
  notes?: string;
  googleId: string | null;
  isCurrentUser: boolean;
  isInContacsts: boolean;
  driveActivity: { [id: string]: IFormattedDriveActivity };
  segmentIds: string[];
}

interface IPersonById {
  [id: string]: IPerson;
}

interface IEmailAddressToPersonIdHash {
  [emailAddress: string]: string;
}

export const formatPerson = (person: GooglePerson) => ({
  id: person.id.replace('people/', ''),
  name: person.name,
  googleId: person.id,
  emailAddresses: person.emailAddresses,
  imageUrl: person.imageUrl,
  isCurrentUser: false,
  isInContacsts: person.isInContacsts,
  notes: person.notes,
  driveActivity: {},
  segmentIds: [],
});

const createNewPersonFromEmail = (email: string) => ({
  id: email,
  name: email,
  googleId: null,
  emailAddresses: [email],
  imageUrl: null,
  isCurrentUser: false,
  isInContacsts: false,
  driveActivity: {},
  segmentIds: [],
});

interface IContacts {
  contactsByEmail: { [id: string]: GooglePerson };
  contactsByPeopleId: { [id: string]: GooglePerson };
}

export default class PersonDataStore {
  private personById: IPersonById;
  private emailAddressToPersonIdHash: IEmailAddressToPersonIdHash;
  private contacts: IContacts;

  constructor(personList: IPerson[], emailAddresses: string[], contacts: IContacts) {
    // console.warn('setting up person store');
    this.personById = {};
    this.emailAddressToPersonIdHash = {};
    this.contacts = contacts;

    this.addPeopleToStore(personList);
    this.addEmailAddressessToStore(emailAddresses);
  }

  getMeetingTime(segments: (ISegment | undefined)[]) {
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
  }

  getDriveActivityWhileMeetingWith(
    people: IPerson[],
    timeDataStore: IStore['timeDataStore'],
    driveActivityStore: IStore['driveActivityStore'],
  ) {
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
  }

  getAssociates(personId: string, segments: (ISegment | undefined)[]) {
    const attendeeLookup = {} as any;
    const associates = {} as any;
    segments.map((segment) => {
      if (
        segment &&
        segment.formattedAttendees.length < config.MAX_MEETING_ATTENDEE_TO_COUNT_AN_INTERACTION
      ) {
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

    const attendees = Object.entries(associates).sort((a: any, b: any) => b[1] - a[1]);
    return attendees.map((a) => attendeeLookup[a[0]]);
  }

  getPersonIdForEmailAddress(emailAddress: string) {
    return this.emailAddressToPersonIdHash[emailAddress];
  }

  addPersonToStore(person: IPerson) {
    let isInStore = false;
    person.emailAddresses.map((email) => {
      if (this.emailAddressToPersonIdHash[email]) {
        isInStore = true;
      }
    });
    if (isInStore) {
      return;
    }

    this.personById[person.id.replace('people/', '')] = { ...person };

    person.emailAddresses.map((email) => {
      this.emailAddressToPersonIdHash[email] = person.id;
    });
  }

  addPeopleToStore(people: IPerson[]) {
    people.forEach((person) => {
      this.addPersonToStore(person);
    });
  }

  addEmailAddressessToStore(emailAddresses: string[]) {
    emailAddresses.forEach((emailAddress) => {
      const formattedEmailAddress = emailAddress.toLocaleLowerCase();
      const person = this.emailAddressToPersonIdHash[formattedEmailAddress];
      if (!person) {
        const contact = this.contacts.contactsByEmail[formattedEmailAddress];
        if (contact) {
          this.addPersonToStore(formatPerson(contact));
        } else {
          this.addPersonToStore(createNewPersonFromEmail(formattedEmailAddress));
        }
      }
    });
  }

  addDriveActivityToStore(driveActivity: IFormattedDriveActivity[]) {
    (driveActivity || []).map((driveActivity) => {
      if (driveActivity.actorPersonId) {
        const personId = driveActivity.actorPersonId
          ? driveActivity.actorPersonId.replace('people/', '')
          : null;
        const person = personId && this.personById[personId];
        if (person) {
          person.driveActivity[driveActivity.id] = driveActivity;
        }
      }
    });
  }

  addCurrentUserFlag(events: ICalendarEvent[]) {
    (events[0]?.attendees || []).forEach((attendee) => {
      if (attendee && attendee.self && attendee.email) {
        const personId = this.emailAddressToPersonIdHash[attendee.email];
        if (personId) {
          this.personById[personId].isCurrentUser = true;
        }
      }
    });
  }

  addGoogleCalendarEventsIdsToStore(events: ICalendarEvent[]) {
    events.forEach((event) => {
      if (event.creator?.email) {
        const personId = this.emailAddressToPersonIdHash[event.creator.email];
        if (personId) {
          this.personById[personId].segmentIds.push(event.id);
        }
      }
      if (event.organizer?.email) {
        const personId = this.emailAddressToPersonIdHash[event.organizer.email];
        if (personId) {
          this.personById[personId].segmentIds.push(event.id);
        }
      }

      (event.attendees || []).forEach((attendee) => {
        if (attendee && attendee.email) {
          const personId = this.emailAddressToPersonIdHash[attendee.email];
          if (personId) {
            this.personById[personId].segmentIds.push(event.id);
          }
        }
      });
    });
    // There will be many dupes
    this.cleanupDuplicateSegmentIds();
  }

  cleanupDuplicateSegmentIds() {
    this.getPeople(false).map((person) => (person.segmentIds = uniq(person.segmentIds)));
  }

  getPeopleMeetingWithOnDay(
    timeDataStore: IStore['timeDataStore'],
    date: Date,
    shouldExcludeSelf: boolean,
  ) {
    const meetings = timeDataStore.getSegmentsForDay(date);
    return sortBy(
      uniqBy(flatten(meetings.map((segment) => segment.formattedAttendees)), 'personId')
        .map((attendee) => this.getPersonById(attendee.personId))
        .filter((person) => (shouldExcludeSelf ? !person?.isCurrentUser : true)),
      'name',
    );
  }

  getPeopleMeetingWithThisWeek(timeDataStore: IStore['timeDataStore'], shouldExcludeSelf: boolean) {
    const meetingsThisWeek = timeDataStore.getSegmentsForWeek(getWeek(new Date()));
    return sortBy(
      uniqBy(flatten(meetingsThisWeek.map((segment) => segment.formattedAttendees)), 'personId')
        .map((attendee) => this.getPersonById(attendee.personId))
        .filter((person) => (shouldExcludeSelf ? !person?.isCurrentUser : true)),
      'name',
    );
  }

  getPeopleForDriveActivity(activity: IFormattedDriveActivity[]) {
    return uniqBy(activity, 'actorPersonId')
      .filter((activity) => !!activity.actorPersonId)
      .map((activity) => this.getPersonById(activity.actorPersonId!))
      .filter((person) => person && person.id) as IPerson[];
  }

  getEmailAddresses() {
    return Object.keys(this.personById);
  }

  getPeople(shouldExcludeSelf: boolean) {
    return Object.values(this.personById).filter((person) =>
      shouldExcludeSelf ? !person?.isCurrentUser : true,
    );
  }

  getSelf(): IPerson | undefined {
    return first(this.getPeople(false).filter((person) => person.isCurrentUser));
  }

  getPersonById(id: string): IPerson | undefined {
    if (id) {
      return this.personById[id.replace('people/', '')];
    }
    return undefined;
  }

  getPersonDisplayName(person: IPerson) {
    return person.name;
  }

  getLength() {
    return Object.keys(this.personById).length;
  }
}
