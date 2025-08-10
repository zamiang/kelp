import { DBSchema, IDBPDatabase, openDB } from 'idb';
import ErrorTracking from '../error-tracking/error-tracking';
import {
  IDocument,
  IDomainBlocklist,
  IDomainFilter,
  IFormattedAttendee,
  IPerson,
  ISegment,
  ISegmentDocument,
  ISegmentTag,
  IWebsiteBlocklist,
  IWebsiteImage,
  IWebsiteItem,
  IWebsitePin,
  IWebsiteTag,
  IWebsiteVisit,
} from './data-types';
import { StoreError, handleDatabaseCorruption, withRetry } from './utils/error-handler';

interface Db extends DBSchema {
  document: {
    value: IDocument;
    key: string;
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
  segmentTag: {
    value: ISegmentTag;
    key: string;
    indexes: {
      'by-segment-id': string;
      'by-segment-summary': string;
      'by-tag': string;
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
  websiteItem: {
    value: IWebsiteItem;
    key: string;
    indexes: {
      'by-domain': string;
    };
  };
  websiteVisit: {
    value: IWebsiteVisit;
    key: string;
    indexes: {
      'by-url': string;
      'by-website-item-id': string;
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
    indexes: {
      'by-raw-url': string;
    };
  };
  websiteTag: {
    value: IWebsiteTag;
    key: string;
    indexes: {
      'by-url': string;
      'by-tag': string;
    };
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

const databaseVerson = 16;

const options = {
  upgrade(db: IDBPDatabase<Db>, oldVersion: number) {
    console.log('upgrading from ', oldVersion, 'to', databaseVerson);
    if (oldVersion < 16) {
      try {
        db.deleteObjectStore('website' as any);
      } catch (e) {
        console.log(e);
      }
      try {
        db.deleteObjectStore('tfidf' as any);
      } catch (e) {
        console.log(e);
      }

      if (oldVersion === 15) {
        return;
      }
    }
    if (oldVersion < 15) {
      try {
        db.deleteObjectStore('driveActivity' as any);
      } catch (e) {
        console.log(e);
      }
      if (oldVersion === 14) {
        return;
      }
    }
    if (oldVersion < 14) {
      // website canonical store
      const websiteItemStore = db.createObjectStore('websiteItem', {
        keyPath: 'id',
      });
      websiteItemStore.createIndex('by-domain', 'domain', { unique: false, multiEntry: true });
      // website visit store
      const websiteVisitStore = db.createObjectStore('websiteVisit', {
        keyPath: 'id',
      });
      websiteVisitStore.createIndex('by-segment-id', 'segmentId', {
        unique: false,
        multiEntry: true,
      });
      websiteVisitStore.createIndex('by-url', 'url', {
        unique: false,
        multiEntry: true,
      });
      websiteVisitStore.createIndex('by-segment-title', 'segmentSummary', {
        unique: false,
        multiEntry: true,
      });
      websiteVisitStore.createIndex('by-website-item-id', 'websiteItemId', {
        unique: false,
        multiEntry: true,
      });
      if (oldVersion === 13) {
        return;
      }
    }
    if (oldVersion < 13) {
      // segment tagstore
      const segmentTagStore = db.createObjectStore('segmentTag', {
        keyPath: 'id',
      });
      segmentTagStore.createIndex('by-segment-id', 'segmentId', {
        unique: false,
        multiEntry: true,
      });
      segmentTagStore.createIndex('by-segment-summary', 'segmentSummary', {
        unique: false,
        multiEntry: true,
      });
      segmentTagStore.createIndex('by-tag', 'tag', { unique: false, multiEntry: true });
      if (oldVersion === 12) {
        return;
      }
    }
    if (oldVersion < 12) {
      const tagStore = db.createObjectStore('websiteTag', {
        keyPath: 'id',
      });
      tagStore.createIndex('by-url', 'url', { unique: false, multiEntry: true });
      tagStore.createIndex('by-tag', 'tag', { unique: false, multiEntry: true });
      if (oldVersion === 11) {
        return;
      }
    }
    if (oldVersion < 11) {
      deleteAllStores(db);
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

    // website image
    const websiteImageStore = db.createObjectStore('websiteImage', {
      keyPath: 'id',
    });
    websiteImageStore.createIndex('by-raw-url', 'rawUrl', { unique: false });

    // website pin
    db.createObjectStore('websitePin', { keyPath: 'id' });

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

    // tagstore
    const tagStore = db.createObjectStore('websiteTag', {
      keyPath: 'id',
    });
    tagStore.createIndex('by-url', 'url', { unique: false, multiEntry: true });
    tagStore.createIndex('by-tag', 'tag', { unique: false, multiEntry: true });

    // segment tagstore
    const segmentTagStore = db.createObjectStore('segmentTag', {
      keyPath: 'id',
    });
    segmentTagStore.createIndex('by-segment-id', 'segmentId', { unique: false, multiEntry: true });
    segmentTagStore.createIndex('by-segment-summary', 'segmentSummary', {
      unique: false,
      multiEntry: true,
    });
    segmentTagStore.createIndex('by-tag', 'tag', { unique: false, multiEntry: true });

    // website canonical store
    const websiteItemStore = db.createObjectStore('websiteItem', {
      keyPath: 'id',
    });
    websiteItemStore.createIndex('by-domain', 'domain', { unique: false, multiEntry: true });

    // website visit store
    const websiteVisitStore = db.createObjectStore('websiteVisit', {
      keyPath: 'id',
    });
    websiteVisitStore.createIndex('by-segment-id', 'segmentId', {
      unique: false,
      multiEntry: true,
    });
    websiteVisitStore.createIndex('by-url', 'url', {
      unique: false,
      multiEntry: true,
    });
    websiteVisitStore.createIndex('by-segment-title', 'segmentSummary', {
      unique: false,
      multiEntry: true,
    });
    websiteVisitStore.createIndex('by-website-item-id', 'websiteItemId', {
      unique: false,
      multiEntry: true,
    });
  },
  blocked() {
    console.error('blocked');
  },
  blocking() {
    console.error('blocking');
  },
  terminated: () => {
    console.error('terminated');
    ErrorTracking.logError('db terminated');
  },
};

export type dbType = IDBPDatabase<Db>;

export const deleteDatabase = (environment: 'production' | 'test' | 'extension') =>
  indexedDB.deleteDatabase(dbNameHash[environment]);

/**
 * Enhanced database setup with better error handling and recovery
 */
const setupDatabase = async (
  environment: 'production' | 'test' | 'extension',
): Promise<IDBPDatabase<Db> | null> => {
  const dbName = dbNameHash[environment];

  return withRetry(
    async () => {
      try {
        // Increase timeout to 5 seconds for better reliability
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(
            () =>
              reject(
                new StoreError('Database setup timeout', {
                  code: 'SETUP_TIMEOUT',
                  severity: 'high',
                  context: { environment, dbName, timeout: 5000 },
                  retryable: true,
                }),
              ),
            5000,
          ),
        );

        const db = await Promise.race([
          openDB<Db>(dbName, databaseVerson, {
            ...options,
            blocked() {
              console.warn('Database upgrade blocked - another connection may be open');
              throw new StoreError('Database upgrade blocked', {
                code: 'UPGRADE_BLOCKED',
                severity: 'medium',
                context: { environment, dbName },
                retryable: true,
              });
            },
            blocking() {
              console.warn('Database blocking other connections');
            },
            terminated() {
              console.error('Database connection terminated unexpectedly');
              ErrorTracking.logError('Database connection terminated');
              throw new StoreError('Database connection terminated', {
                code: 'CONNECTION_TERMINATED',
                severity: 'high',
                context: { environment, dbName },
                retryable: true,
              });
            },
          }),
          timeoutPromise,
        ]);

        console.log(`Successfully connected to database: ${dbName}`);
        return db;
      } catch (error) {
        // Handle specific database corruption scenarios
        if (error instanceof Error) {
          const errorMessage = error.message.toLowerCase();

          if (
            errorMessage.includes('corrupt') ||
            errorMessage.includes('damaged') ||
            errorMessage.includes('invalid') ||
            error.name === 'InvalidStateError'
          ) {
            console.warn('Database corruption detected, attempting recovery...');

            try {
              await handleDatabaseCorruption(dbName, databaseVerson, async () => {
                console.log('Database recovery completed, will retry setup');
              });

              // After recovery, retry the setup (this will be handled by withRetry)
              throw new StoreError('Database corrupted, recovery attempted', {
                code: 'DATABASE_CORRUPTED',
                severity: 'high',
                context: { environment, dbName, originalError: error.message },
                retryable: true,
              });
            } catch (recoveryError) {
              throw new StoreError('Database corruption recovery failed', {
                code: 'RECOVERY_FAILED',
                severity: 'critical',
                context: { environment, dbName, originalError: error.message },
                retryable: false,
                cause: recoveryError as Error,
              });
            }
          }
        }

        // Re-throw as StoreError for consistent handling
        throw error instanceof StoreError
          ? error
          : new StoreError('Database setup failed', {
              code: 'SETUP_FAILED',
              severity: 'high',
              context: { environment, dbName },
              retryable: true,
              cause: error as Error,
            });
      }
    },
    {
      maxAttempts: 3,
      baseDelay: 500,
      maxDelay: 2000,
      backoffMultiplier: 2,
    },
    `setupDatabase-${environment}`,
  ).catch((error): null => {
    // Final fallback - log the error and return null
    console.error(`Failed to setup database after all retry attempts: ${dbName}`, error);
    ErrorTracking.logError(error);
    return null;
  });
};

const deleteAllStores = (db: IDBPDatabase<Db>) => {
  try {
    db.deleteObjectStore('person');
  } catch (e) {
    console.log(e);
  }

  try {
    db.deleteObjectStore('document');
  } catch (e) {
    console.log(e);
  }

  try {
    db.deleteObjectStore('driveActivity' as any);
  } catch (e) {
    console.log(e);
  }

  try {
    db.deleteObjectStore('meeting');
  } catch (e) {
    console.log(e);
  }
  try {
    db.deleteObjectStore('attendee');
  } catch (e) {
    console.log(e);
  }

  try {
    db.deleteObjectStore('tfidf' as any);
  } catch (e) {
    console.log(e);
  }

  try {
    db.deleteObjectStore('segmentDocument');
  } catch (e) {
    console.log(e);
  }

  try {
    db.deleteObjectStore('topWebsite' as any);
  } catch (e) {
    console.log(e);
  }

  try {
    db.deleteObjectStore('task' as any);
  } catch (e) {
    console.log(e);
  }

  try {
    db.deleteObjectStore('taskDocument' as any);
  } catch (e) {
    console.log(e);
  }

  try {
    db.deleteObjectStore('website' as any);
  } catch (e) {
    console.log(e);
  }

  try {
    db.deleteObjectStore('websiteImage');
  } catch (e) {
    console.log(e);
  }

  try {
    db.deleteObjectStore('websitePin');
  } catch (e) {
    console.log(e);
  }

  try {
    db.deleteObjectStore('websiteBlocklist');
  } catch (e) {
    console.log(e);
  }

  try {
    db.deleteObjectStore('domainFilter');
  } catch (e) {
    console.log(e);
  }

  try {
    db.deleteObjectStore('domainBlocklist');
  } catch (e) {
    console.log(e);
  }

  try {
    db.deleteObjectStore('websiteTag');
  } catch (e) {
    console.log(e);
  }

  try {
    db.deleteObjectStore('segmentTag');
  } catch (e) {
    console.log(e);
  }

  try {
    db.deleteObjectStore('websiteItem');
  } catch (e) {
    console.log(e);
  }

  try {
    db.deleteObjectStore('websiteVisit');
  } catch (e) {
    console.log(e);
  }
  return;
};

export default setupDatabase;
