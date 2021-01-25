import { DBSchema, IDBPDatabase, openDB } from 'idb';
import { IFormattedDriveActivity } from '../fetch/fetch-drive-activity';
import { IFormattedAttendee } from './models/attendee-model';
import { IDocument } from './models/document-model';
import { IPerson } from './models/person-model';
import { ISegment } from './models/segment-model';

interface Db extends DBSchema {
  document: {
    value: IDocument;
    key: string;
    indexes: { 'by-link': string };
  };
  driveActivity: {
    value: IFormattedDriveActivity;
    key: string;
    indexes: {
      'by-link': string;
      'by-actor-person-id': string;
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
  meeting: {
    value: ISegment;
    key: string;
    indexes: { 'by-start': string };
  };
  attendee: {
    value: IFormattedAttendee;
    key: string;
    indexes: {
      'by-email': string;
      'by-segment-id': string;
      'by-person-id': string;
    };
  };
}

async function database() {
  const db = await openDB<Db>('kelp', 1, {
    upgrade(db) {
      const personStore = db.createObjectStore('person', {
        keyPath: 'id',
      });
      personStore.createIndex('by-google-id', 'googleId', { unique: true });
      personStore.createIndex('by-email', 'emailAddresses');
      personStore.createIndex('is-self', 'isCurrentUser');

      const documentStore = db.createObjectStore('document', {
        keyPath: 'id',
      });
      documentStore.createIndex('by-link', 'link', { unique: true });

      const driveActivity = db.createObjectStore('driveActivity', {
        keyPath: 'id',
      });
      driveActivity.createIndex('by-link', 'link', { unique: false });
      driveActivity.createIndex('by-actor-person-id', 'actorPersonId', { unique: false });
      driveActivity.createIndex('by-document-id', 'documentId', { unique: false });

      const meetingStore = db.createObjectStore('meeting', {
        keyPath: 'id',
      });
      meetingStore.createIndex('by-start', 'start', { unique: false });

      const attendeeStore = db.createObjectStore('attendee', {
        keyPath: 'id',
      });
      attendeeStore.createIndex('by-email', 'emailAddress', { unique: false });
      attendeeStore.createIndex('by-segment-id', 'segmentId', { unique: false });
      attendeeStore.createIndex('by-person-id', 'segmentId', { unique: false });
    },
  });

  return db;
}

export type dbType = IDBPDatabase<Db>;

export default database();
