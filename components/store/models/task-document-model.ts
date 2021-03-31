import { getDayOfYear } from 'date-fns';
import { flatten, orderBy } from 'lodash';
import RollbarErrorTracking from '../../error-tracking/rollbar';
import { IFormattedDriveActivity } from '../../fetch/fetch-drive-activity';
import { getWeek } from '../../shared/date-helpers';
import { dbType } from '../db';
import AttendeeModel from './attendee-model';
import DriveActivityModel from './drive-activity-model';
import TaskModel, { ITask } from './task-model';

export interface ITaskDocument {
  id: string;
  driveActivityId?: string;
  documentId: string;
  taskId?: string;
  taskText?: string;
  date: Date;
  reason: string;
  isPersonAttendee?: Boolean;
  personId: string;
  day: number;
  week: number;
}

const formatTaskDocument = (
  driveActivity: IFormattedDriveActivity,
  task?: ITask,
  isPersonAttendee?: boolean,
): ITaskDocument => ({
  id: driveActivity.id,
  driveActivityId: driveActivity.id,
  documentId: driveActivity.documentId!,
  taskId: task?.id,
  taskText: task?.title,
  date: driveActivity.time,
  reason: driveActivity.action,
  personId: driveActivity.actorPersonId!,
  isPersonAttendee,
  day: getDayOfYear(driveActivity.time),
  week: getWeek(driveActivity.time),
});

export default class TaskDocumentModel {
  private db: dbType;

  constructor(db: dbType) {
    this.db = db;
  }

  async addTaskDocumentsToStore(
    driveActivityStore: DriveActivityModel,
    taskStore: TaskModel,
    attendeeStore: AttendeeModel,
  ) {
    const driveActivity = await driveActivityStore.getAll();
    const tasks = await taskStore.getAll();

    // Add drive activity for meetings
    const driveActivityToAdd = await Promise.all(
      driveActivity.map(async (driveActivityItem) => {
        let isActorAttendee = false;
        const segment = segments.find(
          (s) => s.start < driveActivityItem.time && s.end > driveActivityItem.time,
        );
        if (segment) {
          const summary = segment.summary?.toLocaleLowerCase();
          if (summary?.includes('ooo') || summary?.includes('out of office')) {
            // do nothing
          } else {
            const attendees = await attendeeStore.getAllForSegmentId(segment.id);
            isActorAttendee = !!attendees.find(
              (a) => a.personGoogleId === driveActivityItem.actorPersonId,
            );
          }
        }
        const formattedDocument = formatTaskDocument(driveActivityItem, segment, isActorAttendee);
        return formattedDocument;
      }),
    );

    // Add drive activity in meeting descriptions
    const descriptionsToAdd = await Promise.all(
      segments.map(async (segment) => {
        const attendees = await attendeeStore.getAllForSegmentId(segment.id);
        return segment.documentIdsFromDescription.map((documentId) =>
          attendees.map(
            (attendee) =>
              attendee.personId &&
              formatTaskDocumentFromDescription(segment, documentId, attendee.personId),
          ),
        );
      }),
    );

    const flatDescriptions = flatten(flatten(descriptionsToAdd)) as any;

    const tx = this.db.transaction('segmentDocument', 'readwrite');

    const results = await Promise.allSettled(
      driveActivityToAdd.concat(flatDescriptions).map((item) => item?.id && tx.store.put(item)),
    );
    await tx.done;

    results.forEach((result) => {
      if (result.status === 'rejected') {
        RollbarErrorTracking.logErrorInRollbar(result.reason);
      }
    });
    return;
  }

  async getAllForWeek(week: number) {
    const activity = await this.db.getAllFromIndex('taskDocument', 'by-week', week);
    return orderBy(activity, 'date', 'desc');
  }

  async getAllForDay(day: number) {
    const activity = await this.db.getAllFromIndex('taskDocument', 'by-day', day);
    return orderBy(activity, 'date', 'desc');
  }

  async getAllForSegmentId(segmentId: string) {
    const activity = await this.db.getAllFromIndex('taskDocument', 'by-segment-id', segmentId);
    return orderBy(activity, 'date', 'desc');
  }

  async getAllForMeetingName(title: string) {
    const formattedTitle = formatSegmentTitle(title);
    if (formattedTitle) {
      const activity = await this.db.getAllFromIndex(
        'taskDocument',
        'by-segment-title',
        formattedTitle,
      );
      return orderBy(activity, 'date', 'desc');
    }
  }

  async getAllForDocumentId(documentId: string) {
    const activity = await this.db.getAllFromIndex('taskDocument', 'by-document-id', documentId);
    return orderBy(activity, 'date', 'desc');
  }

  async getAllForPersonId(personId: string) {
    const activity = await this.db.getAllFromIndex('taskDocument', 'by-person-id', personId);
    return orderBy(activity, 'date', 'desc');
  }

  async getAllForDriveActivity(activityId: string) {
    const activity = await this.db.getAllFromIndex(
      'segmentDocument',
      'by-drive-activity-id',
      activityId,
    );
    return orderBy(activity, 'date', 'desc');
  }

  async getById(id: string): Promise<ITaskDocument | undefined> {
    if (id) {
      return this.db.get('taskDocument', id);
    }
    return undefined;
  }

  async getAll() {
    const activity = await this.db.getAll('segmentDocument');
    return orderBy(activity, 'date', 'desc');
  }
}
