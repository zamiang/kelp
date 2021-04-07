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

/**

* The attendee's response status. Possible values are:
 * - "needsAction" - The attendee has not responded to the invitation.
 * - "declined" - The attendee has declined the invitation.
 * - "tentative" - The attendee has tentatively accepted the invitation.
 * - "accepted" - The attendee has accepted the invitation.
 */
export type responseStatus = 'needsAction' | 'declined' | 'tentative' | 'accepted' | 'notAttending';

export type segmentState = 'current' | 'upcoming' | 'past';

export type attendee = {
  readonly email?: string;
  readonly responseStatus?: string;
  readonly self?: boolean;
};

export interface ISegment {
  readonly id: string;
  readonly link?: string;
  readonly summary?: string;
  readonly start: Date;
  readonly end: Date;
  readonly location?: string;
  readonly description?: string;
  readonly hangoutLink?: string;
  readonly selfResponseStatus: responseStatus;
  readonly creator?: {
    readonly email?: string;
    // NOTE: these are null ~100% of the time
    readonly displayName?: string;
    readonly id?: string;
    readonly self?: boolean;
  };
  readonly reminders?: {
    overrides?: gapi.client.calendar.EventReminder[] | undefined;
    useDefault?: boolean | undefined;
  };
  readonly organizer?: {
    readonly email?: string;
    readonly displayName?: string;
    readonly id?: string;
    readonly self?: boolean;
  };
  readonly attendees: attendee[];
  readonly attachments: gapi.client.calendar.EventAttachment[];
  readonly state: segmentState;
  readonly documentIdsFromDescription: string[];
  readonly videoLink?: string;
  readonly meetingNotesLink?: string;
}
