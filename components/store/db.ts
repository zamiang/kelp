import { DBSchema, IDBPDatabase, openDB } from 'idb';
import RollbarErrorTracking from '../error-tracking/rollbar';
import { IFormattedDriveActivity } from '../fetch/fetch-drive-activity';
import { IFormattedAttendee } from './models/attendee-model';
import { IDocument } from './models/document-model';
import { IPerson } from './models/person-model';
import { ISegmentDocument } from './models/segment-document-model';
import { ISegment } from './models/segment-model';
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
    };
  };
  person: {
    value: IPerson;
    key: string;
    indexes: {
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
      'by-person-id': string;
      'by-segment-id': string;
      'by-day': number;
      'by-week': number;
    };
  };
}

const dbNameHash = {
  production: 'kelp',
  test: 'kelp-test',
  extension: 'kelp-extension',
};

const databaseVerson = 1;

export type dbType = IDBPDatabase<Db>;

const setupDatabase = async (environment: 'production' | 'test' | 'extension') => {
  if (environment === 'test') {
    indexedDB.deleteDatabase(dbNameHash[environment]);
  }

  const db = await openDB<Db>(dbNameHash[environment], databaseVerson, {
    upgrade(db) {
      const personStore = db.createObjectStore('person', {
        keyPath: 'id',
      });
      personStore.createIndex('by-google-id', 'googleId', { unique: true });
      personStore.createIndex('by-email', 'emailAddresses', { unique: false, multiEntry: true });
      personStore.createIndex('is-self', 'isCurrentUser', { unique: false });

      db.createObjectStore('document', {
        keyPath: 'id',
      });

      const driveActivity = db.createObjectStore('driveActivity', {
        keyPath: 'id',
      });
      driveActivity.createIndex('by-document-id', 'documentId', { unique: false });

      const meetingStore = db.createObjectStore('meeting', {
        keyPath: 'id',
      });
      meetingStore.createIndex('by-start', 'start', { unique: false });

      const attendeeStore = db.createObjectStore('attendee', {
        keyPath: 'id',
      });
      attendeeStore.createIndex('by-segment-id', 'segmentId', { unique: false });
      attendeeStore.createIndex('by-person-id', 'personId', { unique: false });
      attendeeStore.createIndex('by-day', 'day', { unique: false });
      attendeeStore.createIndex('by-week', 'week', { unique: false });

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
    },
    terminated: () => {
      RollbarErrorTracking.logErrorInRollbar('db terminated');
    },
  });
  return db;
};

export default setupDatabase;
