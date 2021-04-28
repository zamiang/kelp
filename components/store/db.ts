import { subHours } from 'date-fns';
import { DBSchema, IDBPDatabase, openDB } from 'idb';
import RollbarErrorTracking from '../error-tracking/rollbar';
import {
  IDocument,
  IFormattedAttendee,
  IFormattedDriveActivity,
  IPerson,
  ISegment,
  ISegmentDocument,
  ITask,
  ITaskDocument,
  ITopWebsite,
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
  task: {
    value: ITask;
    key: string;
    indexes: { 'by-parent': string };
  };
  taskDocument: {
    value: ITaskDocument;
    key: string;
    indexes: {
      'by-task-id': string;
      'by-document-id': string;
      'by-drive-activity-id': string;
      'by-task-title': string;
      'by-person-id': string;
      'by-day': number;
      'by-week': number;
    };
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
  topWebsite: {
    value: ITopWebsite;
    key: string;
  };
}

const dbNameHash = {
  production: 'kelp',
  test: 'kelp-test',
  extension: 'kelp-extension',
};

const databaseVerson = 5;

export type dbType = IDBPDatabase<Db>;

export const deleteDatabase = async (environment: 'production' | 'test' | 'extension') =>
  indexedDB.deleteDatabase(dbNameHash[environment]);

const setupDatabase = async (environment: 'production' | 'test' | 'extension') => {
  /**
   * Delete the database if it is old
   * This helps solve contact dupe issues and old calendar events that were removed
   * TODO: handle chrome storage
   */
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

  const db = await openDB<Db>(dbNameHash[environment], databaseVerson, {
    upgrade(db, oldVersion) {
      if (oldVersion === 1 || oldVersion === 2) {
        db.deleteObjectStore('person');
        db.deleteObjectStore('document');
        db.deleteObjectStore('driveActivity');
        db.deleteObjectStore('meeting');
        db.deleteObjectStore('attendee');
        db.deleteObjectStore('tfidf');
        db.deleteObjectStore('segmentDocument');
      }
      if (oldVersion === 3) {
        db.deleteObjectStore('person');
        db.deleteObjectStore('document');
        db.deleteObjectStore('driveActivity');
        db.deleteObjectStore('meeting');
        db.deleteObjectStore('attendee');
        db.deleteObjectStore('tfidf');
        db.deleteObjectStore('segmentDocument');
        db.deleteObjectStore('task');
        db.deleteObjectStore('taskDocument');
      }
      if (oldVersion === 4) {
        db.deleteObjectStore('person');
        db.deleteObjectStore('document');
        db.deleteObjectStore('driveActivity');
        db.deleteObjectStore('meeting');
        db.deleteObjectStore('attendee');
        db.deleteObjectStore('tfidf');
        db.deleteObjectStore('segmentDocument');
        db.deleteObjectStore('task');
        db.deleteObjectStore('taskDocument');
        db.deleteObjectStore('topWebsite');
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

      const taskStore = db.createObjectStore('task', {
        keyPath: 'id',
      });
      taskStore.createIndex('by-parent', 'parent', { unique: false });

      const taskDocumentStore = db.createObjectStore('taskDocument', {
        keyPath: 'id',
      });
      taskDocumentStore.createIndex('by-task-id', 'taskId', { unique: false });
      taskDocumentStore.createIndex('by-document-id', 'documentId', { unique: false });
      taskDocumentStore.createIndex('by-drive-activity-id', 'driveActivityId', {
        unique: false,
      });
      taskDocumentStore.createIndex('by-day', 'day', { unique: false });
      taskDocumentStore.createIndex('by-week', 'week', { unique: false });
      taskDocumentStore.createIndex('by-person-id', 'personId', { unique: false });
      taskDocumentStore.createIndex('by-task-title', 'taskTitle', { unique: false });

      // top website store - has no indexes
      db.createObjectStore('topWebsite', {
        keyPath: 'id',
      });
    },
    blocked() {
      console.log('blocked');
    },
    blocking() {
      console.log('blocking');
    },
    terminated: () => {
      console.log('terminated');
      RollbarErrorTracking.logErrorInRollbar('db terminated');
    },
  });
  return db;
};

export default setupDatabase;
