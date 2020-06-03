// Types heavily modified from: https://github.com/googleapis/google-api-nodejs-client/blob/c8f56774cad704d9b91e3bc854a32502784f50cc/src/apis/driveactivity/v2.ts

/**
 * Information about the action.
 */
interface Action {
  /**
   * The actor responsible for this action (or empty if all actors are responsible).
   */
  actor?: Actor;
  /**
   * The type and detailed information about the action.
   */
  detail?: ActionDetail;
  /**
   * The target this action affects (or empty if affecting all targets). This represents the state of the target immediately after this action occurred.
   */
  target?: Target;
  /**
   * The action occurred over this time range.
   */
  timeRange?: TimeRange;
  /**
   * The action occurred at this specific time.
   */
  timestamp?: string | null;
}
/**
 * Data describing the type and additional information of an action.
 */
interface ActionDetail {
  /**
   * A change about comments was made.
   */
  comment?: Comment;
  /**
   * An object was created.
   */
  create?: Create;
  /**
   * An object was deleted.
   */
  delete?: Delete;
  /**
   * A change happened in data leak prevention status.
   */
  dlpChange?: DataLeakPreventionChange;
  /**
   * An object was edited.
   */
  edit?: {};
  /**
   * An object was moved.
   */
  move?: Move;
  /**
   * The permission on an object was changed.
   */
  permissionChange?: PermissionChange;
  /**
   * An object was referenced in an application outside of Drive/Docs.
   */
  reference?: ApplicationReference;
  /**
   * An object was renamed.
   */
  rename?: Rename;
  /**
   * A deleted object was restored.
   */
  restore?: Restore;
  /**
   * Settings were changed.
   */
  settingsChange?: SettingsChange;
}
/**
 * The actor of a Drive activity.
 */
interface Actor {
  /**
   * An administrator.
   */
  administrator?: {};
  /**
   * An anonymous user.
   */
  anonymous?: {};
  /**
   * An account acting on behalf of another.
   */
  impersonation?: Impersonation;
  /**
   * A non-user actor (i.e. system triggered).
   */
  system?: SystemEvent;
  /**
   * An end user.
   */
  user?: User;
}
/**
 * Activity in applications other than Drive.
 */
interface ApplicationReference {
  /**
   * The reference type corresponding to this event.
   */
  type?: string | null;
}
/**
 * A comment with an assignment.
 */
interface Assignment {
  /**
   * The user to whom the comment was assigned.
   */
  assignedUser?: User;
  /**
   * The sub-type of this event.
   */
  subtype?: string | null;
}
/**
 * A change about comments on an object.
 */
interface Comment {
  /**
   * A change on an assignment.
   */
  assignment?: Assignment;
  /**
   * Users who are mentioned in this comment.
   */
  mentionedUsers?: User[];
  /**
   * A change on a regular posted comment.
   */
  post?: Post;
  /**
   * A change on a suggestion.
   */
  suggestion?: Suggestion;
}

/**
 * An object was created by copying an existing object.
 */
interface Copy {
  /**
   * The the original object.
   */
  originalObject?: TargetReference;
}
/**
 * An object was created.
 */
interface Create {
  /**
   * If present, indicates the object was created by copying an existing Drive object.
   */
  copy?: Copy;
}
/**
 * A change in the object&#39;s data leak prevention status.
 */
interface DataLeakPreventionChange {
  /**
   * The type of Data Leak Prevention (DLP) change.
   */
  type?: string | null;
}
/**
 * An object was deleted.
 */
interface Delete {
  /**
   * The type of delete action taken.
   */
  type?: string | null;
}
/**
 * Information about a domain.
 */
interface Domain {
  /**
   * An opaque string used to identify this domain.
   */
  legacyId?: string | null;
  /**
   * The name of the domain, e.g. &quot;google.com&quot;.
   */
  name?: string | null;
}
/**
 * Information about a shared drive.
 */
interface Drive {
  /**
   * The resource name of the shared drive. The format is &quot;COLLECTION_ID/DRIVE_ID&quot;. Clients should not assume a specific collection ID for this resource name.
   */
  name?: string | null;
  /**
   * The root of this shared drive.
   */
  root?: DriveItem;
  /**
   * The title of the shared drive.
   */
  title?: string | null;
}
/**
 * A single Drive activity comprising one or more Actions by one or more Actors on one or more Targets. Some Action groupings occur spontaneously, such as moving an item into a shared folder triggering a permission change. Other groupings of related Actions, such as multiple Actors editing one item or moving multiple files into a new folder, are controlled by the selection of a ConsolidationStrategy in the QueryDriveActivityRequest.
 */
export interface DriveActivity {
  /**
   * Details on all actions in this activity.
   */
  actions?: Action[];
  /**
   * All actor(s) responsible for the activity.
   */
  actors?: Actor[];
  /**
   * Key information about the primary action for this activity. This is either representative, or the most important, of all actions in the activity, according to the ConsolidationStrategy in the request.
   */
  primaryActionDetail?: ActionDetail;
  /**
   * All Google Drive objects this activity is about (e.g. file, folder, drive). This represents the state of the target immediately after the actions occurred.
   */
  targets?: Target[];
  /**
   * The activity occurred over this time range.
   */
  timeRange?: TimeRange;
  /**
   * The activity occurred at this specific time.
   */
  timestamp?: string | null;
}
/**
 * A Drive item which is a folder.
 */
interface DriveFolder {
  /**
   * The type of Drive folder.
   */
  type?: string | null;
}
/**
 * A Drive item, such as a file or folder.
 */
interface DriveItem {
  /**
   * The Drive item is a file.
   */
  driveFile?: {};
  /**
   * The Drive item is a folder. Includes information about the type of folder.
   */
  driveFolder?: DriveFolder;
  /**
   * The MIME type of the Drive item.  See https://developers.google.com/drive/v3/web/mime-types.
   */
  mimeType?: string | null;
  /**
   * The target Drive item. The format is &quot;items/ITEM_ID&quot;.
   */
  name?: string | null;
  /**
   * Information about the owner of this Drive item.
   */
  owner?: Owner;
  /**
   * The title of the Drive item.
   */
  title?: string | null;
}
/**
 * A lightweight reference to a Drive item, such as a file or folder.
 */
interface DriveItemReference {
  /**
   * The Drive item is a file.
   */
  driveFile?: {};
  /**
   * The Drive item is a folder. Includes information about the type of folder.
   */
  driveFolder?: DriveFolder;
  /**
   * This field is deprecated; please use the `driveFolder` field instead.
   */
  folder?: Folder;
  /**
   * The target Drive item. The format is &quot;items/ITEM_ID&quot;.
   */
  name?: string | null;
  /**
   * The title of the Drive item.
   */
  title?: string | null;
}
/**
 * A lightweight reference to a shared drive.
 */
interface DriveReference {
  /**
   * The resource name of the shared drive. The format is &quot;COLLECTION_ID/DRIVE_ID&quot;. Clients should not assume a specific collection ID for this resource name.
   */
  name?: string | null;
  /**
   * The title of the shared drive.
   */
  title?: string | null;
}

/**
 * A comment on a file.
 */
interface FileComment {
  /**
   * The comment in the discussion thread. This identifier is an opaque string compatible with the Drive API; see https://developers.google.com/drive/v3/reference/comments/get
   */
  legacyCommentId?: string | null;
  /**
   * The discussion thread to which the comment was added. This identifier is an opaque string compatible with the Drive API and references the first comment in a discussion; see https://developers.google.com/drive/v3/reference/comments/get
   */
  legacyDiscussionId?: string | null;
  /**
   * The link to the discussion thread containing this comment, for example, &quot;https://docs.google.com/DOCUMENT_ID/edit?disco=THREAD_ID&quot;.
   */
  linkToDiscussion?: string | null;
  /**
   * The Drive item containing this comment.
   */
  parent?: DriveItem;
}
/**
 * This item is deprecated; please see `DriveFolder` instead.
 */
interface Folder {
  /**
   * This field is deprecated; please see `DriveFolder.type` instead.
   */
  type?: string | null;
}
/**
 * Information about a group.
 */
interface Group {
  /**
   * The email address of the group.
   */
  email?: string | null;
  /**
   * The title of the group.
   */
  title?: string | null;
}
/**
 * Information about an impersonation, where an admin acts on behalf of an end user. Information about the acting admin is not currently available.
 */
interface Impersonation {
  /**
   * The impersonated user.
   */
  impersonatedUser?: User;
}
/**
 * A known user.
 */
interface KnownUser {
  /**
   * True if this is the user making the request.
   */
  isCurrentUser?: boolean | null;
  /**
   * The identifier for this user that can be used with the People API to get more information. The format is &quot;people/ACCOUNT_ID&quot;. See https://developers.google.com/people/.
   */
  personName?: string | null;
}
/**
 * An object was moved.
 */
interface Move {
  /**
   * The added parent object(s).
   */
  addedParents?: TargetReference[];
  /**
   * The removed parent object(s).
   */
  removedParents?: TargetReference[];
}
/**
 * Information about the owner of a Drive item.
 */
interface Owner {
  /**
   * The domain of the Drive item owner.
   */
  domain?: Domain;
  /**
   * The drive that owns the item.
   */
  drive?: DriveReference;
  /**
   * This field is deprecated; please use the `drive` field instead.
   */
  teamDrive?: TeamDriveReference;
  /**
   * The user that owns the Drive item.
   */
  user?: User;
}
/**
 * The permission setting of an object.
 */
interface Permission {
  /**
   * If true, the item can be discovered (e.g. in the user&#39;s &quot;Shared with me&quot; collection) without needing a link to the item.
   */
  allowDiscovery?: boolean | null;
  /**
   * If set, this permission applies to anyone, even logged out users.
   */
  anyone?: {};
  /**
   * The domain to whom this permission applies.
   */
  domain?: Domain;
  /**
   * The group to whom this permission applies.
   */
  group?: Group;
  /**
   * Indicates the &lt;a href=&quot;/drive/web/manage-sharing#roles&quot;&gt;Google Drive permissions role&lt;/a&gt;. The role determines a user&#39;s ability to read, write, and comment on items.
   */
  role?: string | null;
  /**
   * The user to whom this permission applies.
   */
  user?: User;
}
/**
 * A change of the permission setting on an item.
 */
interface PermissionChange {
  /**
   * The set of permissions added by this change.
   */
  addedPermissions?: Permission[];
  /**
   * The set of permissions removed by this change.
   */
  removedPermissions?: Permission[];
}
/**
 * A regular posted comment.
 */
interface Post {
  /**
   * The sub-type of this event.
   */
  subtype?: string | null;
}

/**
 * An object was renamed.
 */
interface Rename {
  /**
   * The new title of the drive object.
   */
  newTitle?: string | null;
  /**
   * The previous title of the drive object.
   */
  oldTitle?: string | null;
}
/**
 * A deleted object was restored.
 */
interface Restore {
  /**
   * The type of restore action taken.
   */
  type?: string | null;
}
/**
 * Information about restriction policy changes to a feature.
 */
interface RestrictionChange {
  /**
   * The feature which had a change in restriction policy.
   */
  feature?: string | null;
  /**
   * The restriction in place after the change.
   */
  newRestriction?: string | null;
}
/**
 * Information about settings changes.
 */
interface SettingsChange {
  /**
   * The set of changes made to restrictions.
   */
  restrictionChanges?: RestrictionChange[];
}
/**
 * A suggestion.
 */
interface Suggestion {
  /**
   * The sub-type of this event.
   */
  subtype?: string | null;
}
/**
 * Event triggered by system operations instead of end users.
 */
interface SystemEvent {
  /**
   * The type of the system event that may triggered activity.
   */
  type?: string | null;
}
/**
 * Information about the target of activity.
 */
interface Target {
  /**
   * The target is a shared drive.
   */
  drive?: Drive;
  /**
   * The target is a Drive item.
   */
  driveItem?: DriveItem;
  /**
   * The target is a comment on a Drive file.
   */
  fileComment?: FileComment;
  /**
   * This field is deprecated; please use the `drive` field instead.
   */
  teamDrive?: TeamDrive;
}
/**
 * A lightweight reference to the target of activity.
 */
interface TargetReference {
  /**
   * The target is a shared drive.
   */
  drive?: DriveReference;
  /**
   * The target is a Drive item.
   */
  driveItem?: DriveItemReference;
  /**
   * This field is deprecated; please use the `drive` field instead.
   */
  teamDrive?: TeamDriveReference;
}
/**
 * This item is deprecated; please see `Drive` instead.
 */
interface TeamDrive {
  /**
   * This field is deprecated; please see `Drive.name` instead.
   */
  name?: string | null;
  /**
   * This field is deprecated; please see `Drive.root` instead.
   */
  root?: DriveItem;
  /**
   * This field is deprecated; please see `Drive.title` instead.
   */
  title?: string | null;
}
/**
 * This item is deprecated; please see `DriveReference` instead.
 */
interface TeamDriveReference {
  /**
   * This field is deprecated; please see `DriveReference.name` instead.
   */
  name?: string | null;
  /**
   * This field is deprecated; please see `DriveReference.title` instead.
   */
  title?: string | null;
}
/**
 * Information about time ranges.
 */
interface TimeRange {
  /**
   * The end of the time range.
   */
  endTime?: string | null;
  /**
   * The start of the time range.
   */
  startTime?: string | null;
}
/**
 * Information about an end user.
 */
interface User {
  /**
   * A user whose account has since been deleted.
   */
  deletedUser?: {};
  /**
   * A known user.
   */
  knownUser?: KnownUser;
  /**
   * A user about whom nothing is currently known.
   */
  unknownUser?: {};

  isCurrentUser?: boolean;
}
