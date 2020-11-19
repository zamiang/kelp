import { intervalToDuration, subDays } from 'date-fns';
import { first, flatten, sortBy, uniq, uniqBy } from 'lodash';
import config from '../../constants/config';
import { ICalendarEvent } from '../fetch/fetch-calendar-events';
import { IFormattedDriveActivity } from '../fetch/fetch-drive-activity';
import { formattedEmail } from '../fetch/fetch-emails';
import { person as GooglePerson } from '../fetch/fetch-people';
import { getWeek } from '../shared/date-helpers';
import { ISegment } from './time-store';
import { IStore } from './use-store';

export interface IPerson {
  id: string;
  name: string;
  emailAddress?: string;
  imageUrl?: string | null;
  emailIds: string[];
  notes?: string;
  googleId: string | null;
  isCurrentUser: boolean;
  isMissingProfile: boolean;
  driveActivity: { [id: string]: IFormattedDriveActivity };
  segmentIds: string[];
}

interface IPersonById {
  [id: string]: IPerson;
}

interface IEmailAddressToPersonIdHash {
  [emailAddress: string]: string;
}

// TODO: handle one person w/ multiple email addresses
export const formatPerson = (person: GooglePerson) => ({
  id: person.id.replace('people/', ''),
  name: person.name,
  googleId: person.id,
  emailAddress: person.emailAddress?.toLocaleLowerCase(),
  imageUrl: person.imageUrl,
  isCurrentUser: false,
  isMissingProfile: person.isMissingProfile,
  notes: person.notes,
  emailIds: [],
  driveActivity: {},
  segmentIds: [],
});

const createNewPersonFromEmail = (email: string) => ({
  id: email,
  name: email,
  googleId: null,
  emailAddress: email,
  imageUrl: null,
  isCurrentUser: false,
  isMissingProfile: false,
  emailIds: [],
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

  // TODO: Cache this?
  getMeetingTime(segments: (ISegment | undefined)[]) {
    const currentWeek = getWeek(new Date());
    const previousWeek = getWeek(subDays(new Date(), 7));
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

  // TODO: Cache this?
  getDriveActivityWhileMeetingWith(
    people: IPerson[],
    timeDataStore: IStore['timeDataStore'],
    driveActivityStore: IStore['driveActivityStore'],
    currentUserId?: string,
  ) {
    const activityIds = flatten(
      people.map((person) => {
        const segmentIds = person.segmentIds;
        const driveActivityIds = segmentIds.map(
          (id) => timeDataStore.getSegmentById(id)!.driveActivityIds,
        );
        return flatten(driveActivityIds);
      }),
    );
    return activityIds
      .map((id) => driveActivityStore.getById(id)!)
      .filter((activity) => activity.actorPersonId === currentUserId);
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
    if (
      person.emailAddress &&
      this.emailAddressToPersonIdHash[person.emailAddress.toLocaleLowerCase()]
    ) {
      // Already in the store
      return;
    }
    this.personById[person.id.replace('people/', '')] = { ...person };
    if (person.emailAddress) {
      this.emailAddressToPersonIdHash[person.emailAddress.toLocaleLowerCase()] = person.id;
    }
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

  addEmailsToStore(emails: formattedEmail[]) {
    (emails || []).forEach((email) => {
      if (email.from) {
        const formattedEmailAddress = email.from.toLocaleLowerCase();
        const contact = this.contacts.contactsByEmail[formattedEmailAddress];
        if (contact) {
          this.addPersonToStore(formatPerson(contact));
        }
        const personId = this.emailAddressToPersonIdHash[formattedEmailAddress];
        if (personId) {
          this.personById[personId] && this.personById[personId].emailIds.push(email.id);
        }
      }
      if (email.to) {
        email.to.map((emailTo) => {
          if (emailTo) {
            const formattedEmailAddress = emailTo.toLocaleLowerCase();
            const contact = this.contacts.contactsByEmail[formattedEmailAddress];
            if (contact) {
              this.addPersonToStore(formatPerson(contact));
            }
            const personId = emailTo && this.emailAddressToPersonIdHash[emailTo];
            if (personId) {
              this.personById[personId] && this.personById[personId].emailIds.push(email.id);
            }
          }
        });
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
    this.getPeople().map((person) => (person.segmentIds = uniq(person.segmentIds)));
  }

  getPeopleMeetingWithOnDay(timeDataStore: IStore['timeDataStore'], date: Date) {
    const meetings = timeDataStore.getSegmentsForDay(date);
    return sortBy(
      uniqBy(
        flatten(meetings.map((segment) => segment.formattedAttendees)),
        'personId',
      ).map((attendee) => this.getPersonById(attendee.personId)),
      'name',
    );
  }

  getPeopleMeetingWithThisWeek(timeDataStore: IStore['timeDataStore']) {
    const meetingsThisWeek = timeDataStore.getSegmentsForWeek(getWeek(new Date()));
    return sortBy(
      uniqBy(
        flatten(meetingsThisWeek.map((segment) => segment.formattedAttendees)),
        'personId',
      ).map((attendee) => this.getPersonById(attendee.personId)),
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

  getPeople() {
    return Object.values(this.personById);
  }

  getSelf(): IPerson | undefined {
    return first(this.getPeople().filter((person) => person.isCurrentUser));
  }

  getPersonById(id: string): IPerson | undefined {
    return this.personById[id.replace('people/', '')];
  }

  getPersonDisplayName(person: IPerson) {
    return person.name;
  }

  getLength() {
    return Object.keys(this.personById).length;
  }
}
