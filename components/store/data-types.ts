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
  readonly etag?: string;
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

export interface ISegmentDocument {
  readonly id: string;
  readonly driveActivityId?: string;
  readonly documentId: string;
  readonly segmentId?: string;
  readonly segmentTitle?: string;
  readonly date: Date;
  readonly reason: string;
  readonly isPersonAttendee?: Boolean;
  readonly personId: string;
  readonly day: number;
  readonly week: number;
  readonly category: 'self' | 'attendee' | 'non-attendee' | 'meeting-description';
}

export interface ITaskDocument {
  readonly id: string;
  readonly driveActivityId?: string;
  readonly documentId?: string;
  readonly taskId: string;
  readonly taskTitle?: string;
  readonly date: Date;
  readonly reason: string;
  readonly segmentId?: string;
  readonly day: number;
  readonly week: number;
}

export type ITask = {
  readonly id: string;
  readonly title: string;
  readonly listId: string;
  readonly listTitle?: string;
  readonly completedAt?: Date;
  readonly updatedAt: Date;
  readonly hidden?: boolean;
  readonly deleted?: boolean;
  readonly status?: 'needsAction' | 'completed';
  /**
   * Due date of the task (as a RFC 3339 timestamp). Optional. The due date only records date information; the time portion of the timestamp is discarded when setting the due date. It
   * isn't possible to read or write the time that a task is due via the API.
   */
  readonly due?: Date;
  /** Collection of links. This collection is read-only. */
  readonly links?: Array<{
    /** The description. In HTML speak: Everything between <a> and </a>. */
    readonly description?: string;
    /** The URL. */
    readonly link?: string;
    /** Type of the link, e.g. "email". */
    readonly type?: string;
  }>;
  /** Notes describing the task. Optional. */
  readonly notes?: string;
  /**
   * Parent task identifier. This field is omitted if it is a top-level task. This field is read-only. Use the "move" method to move the task under a different parent or to the top level.
   */
  readonly parent?: string;
  /**
   * String indicating the position of the task among its sibling tasks under the same parent task or at the top level. If this string is greater than another task's corresponding
   * position string according to lexicographical ordering, the task is positioned after the other task under the same parent task (or at the top level). This field is read-only. Use the
   * "move" method to move the task to another position.
   */
  readonly position?: string;
  /** URL pointing to this task. Used to retrieve, update, or delete this task. */
  readonly selfLink?: string;
};
