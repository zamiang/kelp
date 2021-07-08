import { DBSchema, IDBPDatabase, openDB } from 'idb';
import ErrorTracking from '../error-tracking/error-tracking';
import {
  IDocument,
  IDomainBlocklist,
  IDomainFilter,
  IFormattedAttendee,
  IFormattedDriveActivity,
  IPerson,
  ISegment,
  ISegmentDocument,
  IWebsite,
  IWebsiteBlocklist,
  IWebsiteImage,
  IWebsitePin,
} from './data-types';
import { ITfidfRow } from './models/tfidf-model';

interface Db extends DBSchema {
  document: {
    value: IDocument;
    key: string;
  };
  driveActivity: {
    value: IFormattedDriveActivity;
    key: string;
    indexes: {
      'by-document-id': string;
      'is-self': string;
    };
  };
  person: {
    value: IPerson;
    key: string;
    indexes: {
      'by-person-id': string;
      'by-google-id': string;
      'by-email': string;
      'is-self': string;
    };
  };
  tfidf: {
    value: ITfidfRow;
    key: string;
    indexes: { 'by-type': string };
  };
  meeting: {
    value: ISegment;
    key: string;
    indexes: { 'by-start': string };
  };
  segmentDocument: {
    value: ISegmentDocument;
    key: string;
    indexes: {
      'by-segment-id': string;
      'by-document-id': string;
      'by-drive-activity-id': string;
      'by-segment-title': string;
      'by-person-id': string;
      'by-day': number;
      'by-week': number;
    };
  };
  attendee: {
    value: IFormattedAttendee;
    key: string;
    indexes: {
      'by-email': string;
      'by-segment-id': string;
      'by-day': number;
      'by-week': number;
    };
  };
  website: {
    value: IWebsite;
    key: string;
    indexes: {
      'by-domain': string;
      'by-segment-id': string;
      'by-segment-title': string;
    };
  };
  websitePin: {
    value: IWebsitePin;
    key: string;
  };
  websiteImage: {
    value: IWebsiteImage;
    key: string;
  };
  websiteBlocklist: {
    value: IWebsiteBlocklist;
    key: string;
  };
  domainBlocklist: {
    value: IDomainBlocklist;
    key: string;
  };
  domainFilter: {
    value: IDomainFilter;
    key: string;
  };
}

const dbNameHash = {
  production: 'kelp',
  test: 'kelp-test',
  extension: 'kelp-extension',
};

const databaseVerson = 8;

const options = {
  upgrade(db: IDBPDatabase<Db>, oldVersion: number) {
    if (oldVersion === 1 || oldVersion === 2) {
      db.deleteObjectStore('person');
      db.deleteObjectStore('document');
      db.deleteObjectStore('driveActivity');
      db.deleteObjectStore('meeting');
      db.deleteObjectStore('attendee');
      db.deleteObjectStore('tfidf');
      db.deleteObjectStore('segmentDocument');
    } else if (oldVersion === 3) {
      db.deleteObjectStore('person');
      db.deleteObjectStore('document');
      db.deleteObjectStore('driveActivity');
      db.deleteObjectStore('meeting');
      db.deleteObjectStore('attendee');
      db.deleteObjectStore('tfidf');
      db.deleteObjectStore('segmentDocument');
    } else if (oldVersion === 4 || oldVersion === 5) {
      db.deleteObjectStore('person');
      db.deleteObjectStore('document');
      db.deleteObjectStore('driveActivity');
      db.deleteObjectStore('meeting');
      db.deleteObjectStore('attendee');
      db.deleteObjectStore('tfidf');
      db.deleteObjectStore('segmentDocument');
      db.deleteObjectStore('topWebsite' as any);
      db.deleteObjectStore('task' as any);
      db.deleteObjectStore('taskDocument' as any);
    } else if (oldVersion === 6) {
      db.deleteObjectStore('website');
      const store = db.createObjectStore('website', {
        keyPath: 'id',
      });
      store.createIndex('by-domain', 'domain', { unique: false });
      store.createIndex('by-segment-id', 'meetingId', { unique: false });
      store.createIndex('by-segment-title', 'meetingName', { unique: false });
      return;
    } else if (oldVersion === 7) {
      db.createObjectStore('websitePin', { keyPath: 'id' });
      return;
    }

    const personStore = db.createObjectStore('person', {
      keyPath: 'id',
    });
    personStore.createIndex('by-email', 'emailAddresses', { unique: false, multiEntry: true });
    personStore.createIndex('by-google-id', 'googleIds', { unique: false, multiEntry: true });
    personStore.createIndex('is-self', 'isCurrentUser', { unique: false });

    db.createObjectStore('document', {
      keyPath: 'id',
    });

    const driveActivity = db.createObjectStore('driveActivity', {
      keyPath: 'id',
    });
    driveActivity.createIndex('by-document-id', 'documentId', { unique: false });
    driveActivity.createIndex('is-self', 'isCurrentUser', { unique: false });

    const meetingStore = db.createObjectStore('meeting', {
      keyPath: 'id',
    });
    meetingStore.createIndex('by-start', 'start', { unique: false });

    const attendeeStore = db.createObjectStore('attendee', {
      keyPath: 'id',
    });
    attendeeStore.createIndex('by-segment-id', 'segmentId', { unique: false });
    attendeeStore.createIndex('by-day', 'day', { unique: false });
    attendeeStore.createIndex('by-week', 'week', { unique: false });
    attendeeStore.createIndex('by-email', 'emailAddress', { unique: false });

    const tfidfStore = db.createObjectStore('tfidf', {
      keyPath: 'id',
    });
    tfidfStore.createIndex('by-type', 'type', { unique: false });

    const segmentDocumentStore = db.createObjectStore('segmentDocument', {
      keyPath: 'id',
    });
    segmentDocumentStore.createIndex('by-segment-id', 'segmentId', { unique: false });
    segmentDocumentStore.createIndex('by-document-id', 'documentId', { unique: false });
    segmentDocumentStore.createIndex('by-drive-activity-id', 'driveActivityId', {
      unique: false,
    });
    segmentDocumentStore.createIndex('by-day', 'day', { unique: false });
    segmentDocumentStore.createIndex('by-week', 'week', { unique: false });
    segmentDocumentStore.createIndex('by-person-id', 'personId', { unique: false });
    segmentDocumentStore.createIndex('by-segment-title', 'segmentTitle', { unique: false });

    // top website store - has no indexes
    const websiteStore = db.createObjectStore('website', {
      keyPath: 'id',
    });
    websiteStore.createIndex('by-domain', 'domain', { unique: false });
    websiteStore.createIndex('by-segment-id', 'meetingId', { unique: false });
    websiteStore.createIndex('by-segment-title', 'meetingName', { unique: false });

    // website image
    db.createObjectStore('websiteImage', {
      keyPath: 'id',
    });
    // website blocklist
    db.createObjectStore('websiteBlocklist', {
      keyPath: 'id',
    });
    // domain blocklist
    db.createObjectStore('domainBlocklist', {
      keyPath: 'id',
    });
    // domain filter
    db.createObjectStore('domainFilter', {
      keyPath: 'id',
    });

    // website pin
    db.createObjectStore('websitePin', { keyPath: 'id' });
  },
  blocked() {
    console.error('blocked');
  },
  blocking() {
    console.error('blocking');
  },
  terminated: () => {
    console.error('terminated');
    ErrorTracking.logErrorInRollbar('db terminated');
  },
};

const timeout = (ms: number) => new Promise((resolve) => setTimeout(() => resolve('error'), ms));

export type dbType = IDBPDatabase<Db>;

export const deleteDatabase = async (environment: 'production' | 'test' | 'extension') =>
  indexedDB.deleteDatabase(dbNameHash[environment]);

const setupDatabase = async (environment: 'production' | 'test' | 'extension') => {
  /**
   * Delete the database if it is old
   * This helps solve contact dupe issues and old calendar events that were removed
   * TODO: handle chrome storage

  if (typeof localStorage === 'object') {
    const lastUpdated = localStorage.getItem('kelpLastUpdated');
    const lastUpdatedDate = lastUpdated ? new Date(lastUpdated) : undefined;
    if (!lastUpdatedDate || lastUpdatedDate < subHours(new Date(), 12)) {
      console.log('deleting the database and starting from scratch');
      indexedDB.deleteDatabase(dbNameHash[environment]);
    } else if (environment === 'test') {
      indexedDB.deleteDatabase(dbNameHash[environment]);
    }
    localStorage.setItem('kelpLastUpdated', new Date().toISOString());
  }
   */

  try {
    const db = await Promise.race([
      openDB<Db>(dbNameHash[environment], databaseVerson, options),
      timeout(1000),
    ]);
    if (db === 'error') {
      return null;
    }
    return db as IDBPDatabase<Db>;
  } catch (e) {
    return null;
  }
};

export default setupDatabase;
