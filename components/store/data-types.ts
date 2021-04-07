export type TaskList = gapi.client.tasks.TaskList;

type DocumentType =
  | 'UNKNOWN'
  | 'application/vnd.google-apps.presentation'
  | 'application/vnd.google-apps.spreadsheet'
  | 'application/vnd.google-apps.document';

export interface IDocument {
  readonly id: string;
  readonly name?: string;
  readonly viewedByMe?: boolean;
  readonly link?: string;
  readonly updatedAt?: Date;
  readonly viewedByMeAt?: Date;
  readonly mimeType: DocumentType;
  readonly isShared: boolean;
  readonly isStarred: boolean;
  readonly iconLink?: string;
}

export interface IFormattedAttendee {
  readonly id: string;
  readonly personId?: string;
  readonly personGoogleId?: string;
  readonly emailAddress?: string;
  readonly responseStatus?: string;
  readonly self?: boolean;
  readonly segmentId: string;
  readonly week: number;
  readonly day: number;
  readonly date: Date;
}

export interface IFormattedDriveActivity {
  readonly id: string;
  readonly time: Date;
  readonly action: string;
  readonly actorPersonId?: string | null;
  readonly title?: string | null;
  readonly documentId?: string;
  readonly link: string;
}

export interface IPerson {
  readonly id: string;
  readonly name: string;
  readonly emailAddresses: string[];
  readonly imageUrl?: string;
  readonly notes?: string;
  readonly googleId?: string;
  readonly isCurrentUser: number; // needs to be a number to be a valid index
  readonly isInContacts: boolean;
}

export type SegmentState = 'current' | 'upcoming' | 'past';

export interface ISegment extends ICalendarEvent {
  readonly state: SegmentState;
  readonly documentIdsFromDescription: string[];
  readonly videoLink?: string;
  readonly meetingNotesLink?: string;
}
