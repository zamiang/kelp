import { addMinutes, getDayOfYear, subMinutes } from 'date-fns';
import { flatten, orderBy } from 'lodash';
import RollbarErrorTracking from '../../error-tracking/rollbar';
import { getWeek } from '../../shared/date-helpers';
import { IFormattedDriveActivity, ISegment } from '../data-types';
import { dbType } from '../db';
import DriveActivityModel from './drive-activity-model';
import SegmentModel from './segment-model';
import TaskModel, { ITask } from './task-model';

export interface ITaskDocument {
  id: string;
  driveActivityId?: string;
  documentId?: string;
  taskId: string;
  taskTitle?: string;
  date: Date;
  reason: string;
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
  day: getDayOfYear(driveActivity.time),
  week: getWeek(driveActivity.time),
});

const formatTaskMeeting = (segment: ISegment, task: ITask): ITaskDocument => ({
  id: `${task.id}-${segment.id}`,
  taskId: task.id,
  taskTitle: task.title,
  date: task.updatedAt,
  segmentId: segment.id,
  reason: `Edited during ${segment.summary}`,
  day: getDayOfYear(segment.start),
  week: getWeek(segment.start),
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
    currentUserId: string | null,
  ) {
    const driveActivity = await driveActivityStore.getAll();
    const tasks = await taskStore.getAll();
    const segments = await timeStore.getAll();

    const taskMeetingsToAdd = segments.map((meeting) => {
      const tasksForMeeting = tasks.filter((t) => {
        if (t.updatedAt > meeting.start && t.updatedAt < meeting.end) {
          return true;
        }
        return false;
      });
      return tasksForMeeting.map((task) => formatTaskMeeting(meeting, task));
    });

    // Add drive activity for tasks
    const driveActivityToAdd = await Promise.all(
      driveActivity.map(async (driveActivityItem) => {
        if (driveActivityItem.actorPersonId === currentUserId) {
          const tasksForDriveActivity = tasks.filter(
            (t) =>
              t.updatedAt < addMinutes(driveActivityItem.time, 10) &&
              t.updatedAt > subMinutes(driveActivityItem.time, 10),
          );
          if (tasksForDriveActivity) {
            return tasksForDriveActivity.map((task) => formatTaskDocument(driveActivityItem, task));
          }
        }
      }),
    );

    const tx = this.db.transaction('taskDocument', 'readwrite');
    const results = await Promise.allSettled(
      flatten(driveActivityToAdd).map((item) => item?.id && tx.store.put(item)),
    );
    const meetingResults = await Promise.allSettled(
      flatten(taskMeetingsToAdd).map((item) => item?.id && tx.store.put(item)),
    );
    await tx.done;

    results.forEach((result) => {
      if (result.status === 'rejected') {
        RollbarErrorTracking.logErrorInRollbar(result.reason);
      }
    });

    meetingResults.forEach((result) => {
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
