import { formatDistanceToNow, subDays } from 'date-fns';
import { sortBy, uniqBy } from 'lodash';
import { getWeek } from '../shared/date-helpers';
import { ISegment, ITask } from '../store/data-types';
import { IStore } from '../store/use-store';

export interface IFeaturedTask {
  taskId: string;
  task: ITask;
  meetings: ISegment[];
  nextMeetingStartAt?: Date;
  text?: string;
}

/**
 * Gets documents in the featured section by looking through meetings for the coming week
 * Finds meeetings documents associated with those meetings
 * It sorts in decending order so upcoming meetings are next
 */
const maxResult = 5;
const daysToLookBack = 7;
export const getFeaturedTasks = async (props: IStore) => {
  const currentDate = new Date();
  const week = getWeek(currentDate);
  const result = await props.taskDocumentStore.getAllForWeek(week);

  // For tasks edited by the current users that may not be associated with a meeting
  const tasks = await props.taskStore.getAll();
  const filterTime = subDays(currentDate, daysToLookBack);
  const currentUserDocuments = await Promise.all(
    tasks
      .filter((item) => item.updatedAt > filterTime && !item.parent)
      .map(
        async (task) =>
          ({
            taskId: task.id,
            task,
            meetings: [] as any,
            nextMeetingStartsAt: undefined,
            text: `You edited this task ${formatDistanceToNow(task.updatedAt)} ago`,
          } as IFeaturedTask),
      ),
  );
  // Hash of taskId to meeting array
  const meetingsForTask: { [id: string]: ISegment[] } = {};

  await Promise.all(
    result.map(async (r) => {
      if (!r.segmentId) {
        return;
      }
      const meeting = await props.timeDataStore.getById(r.segmentId);
      const taskId = r.taskId;
      if (meeting) {
        if (taskId && meetingsForTask[taskId]) {
          meetingsForTask[taskId].push(meeting);
        } else if (taskId) {
          meetingsForTask[taskId] = [meeting];
        }
      }
    }),
  );
  const d = tasks
    .map((task) => {
      const meetings = sortBy(meetingsForTask[task.id], 'start');
      const nextMeetingStartAt = meetings[0] ? meetings[0].start : undefined;
      const text =
        meetings[0] && nextMeetingStartAt
          ? `${meetings[0].summary} ${formatDistanceToNow(nextMeetingStartAt)} ago`
          : undefined;
      return {
        taskId: task.id,
        task,
        meetings,
        nextMeetingStartAt,
        text,
      } as IFeaturedTask;
    })
    .filter((m) => m.nextMeetingStartAt);

  return uniqBy(sortBy(d, 'nextMeetingStartAt').concat(currentUserDocuments), 'taskId').slice(
    0,
    maxResult,
  );
};
