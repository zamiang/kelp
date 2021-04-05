import { addMinutes, getDayOfYear, subMinutes } from 'date-fns';
import { orderBy } from 'lodash';
import RollbarErrorTracking from '../../error-tracking/rollbar';
import { IFormattedDriveActivity } from '../../fetch/fetch-drive-activity';
import { getWeek } from '../../shared/date-helpers';
import { dbType } from '../db';
import DriveActivityModel from './drive-activity-model';
import SegmentModel from './segment-model';
import TaskModel, { ITask } from './task-model';

export interface ITaskDocument {
  id: string;
  driveActivityId?: string;
  documentId: string;
  taskId: string;
  taskTitle?: string;
  date: Date;
  reason: string;
  personId: string;
  segmentId?: string;
  day: number;
  week: number;
}

const formatTaskDocument = (
  driveActivity: IFormattedDriveActivity,
  task: ITask,
): ITaskDocument => ({
  id: driveActivity.id,
  driveActivityId: driveActivity.id,
  documentId: driveActivity.documentId!,
  taskId: task.id,
  taskTitle: task?.title,
  date: driveActivity.time,
  reason: driveActivity.action,
  personId: driveActivity.actorPersonId!,
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
    timeStore: SegmentModel,
    taskStore: TaskModel,
  ) {
    const driveActivity = await driveActivityStore.getAll();
    const tasks = await taskStore.getAll();
    const segments = await timeStore.getAll();

    // TODO: iterate through segments and match with tasks
    console.log(segments);

    // Add drive activity for tasks
    const driveActivityToAdd = await Promise.all(
      driveActivity.map(async (driveActivityItem) => {
        const task = tasks.find(
          (t) =>
            t.updatedAt < addMinutes(driveActivityItem.time, 10) &&
            t.updatedAt > subMinutes(driveActivityItem.time, 10),
        );
        if (task) {
          const formattedDocument = formatTaskDocument(driveActivityItem, task);
          return formattedDocument;
        }
      }),
    );

    const tx = this.db.transaction('segmentDocument', 'readwrite');

    const results = await Promise.allSettled(
      driveActivityToAdd.map((item) => item?.id && tx.store.put(item)),
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

  async getAllForTaskId(taskId: string) {
    const activity = await this.db.getAllFromIndex('taskDocument', 'by-task-id', taskId);
    return orderBy(activity, 'date', 'desc');
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
