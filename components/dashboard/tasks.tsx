import Typography from '@material-ui/core/Typography';
import { formatDistanceToNow, subDays } from 'date-fns';
import { sortBy, uniqBy } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getWeek } from '../shared/date-helpers';
import panelStyles from '../shared/panel-styles';
import rowStyles from '../shared/row-styles';
import { ISegment } from '../store/models/segment-model';
import { ITask } from '../store/models/task-model';
import { IStore } from '../store/use-store';
import TaskRow from '../tasks/task-row';

interface IFeaturedTask {
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
const getFeaturedTasks = async (props: IStore) => {
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

const AllTasks = (props: {
  store: IStore;
  selectedTaskId: string | null;
  setTaskId?: (id: string) => void;
}) => {
  const classes = rowStyles();
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [topTasks, setTopTasks] = useState<IFeaturedTask[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = (await props.store.taskStore.getAll()).filter((task) => !task.parent);
      // probably not correct
      setTasks(result.sort((a, b) => (a.updatedAt < b.updatedAt ? -1 : 1)));
    };
    void fetchData();
  }, [props.store.lastUpdated, props.store.isLoading]);

  useEffect(() => {
    const fetchData = async () => {
      const featuredTasks = await getFeaturedTasks(props.store);
      setTopTasks(featuredTasks);
      if (featuredTasks[0] && featuredTasks[0].taskId && props.setTaskId) {
        props.setTaskId(featuredTasks[0].taskId);
      }
    };
    void fetchData();
  }, [props.store.lastUpdated, props.store.isLoading]);

  return (
    <React.Fragment>
      {topTasks.length > 0 && (
        <div className={classes.rowHighlight}>
          <Typography className={classes.rowText} variant="h6">
            Recent tasks
          </Typography>
          {topTasks.map((task) => (
            <TaskRow
              key={task.task.id}
              task={task.task}
              store={props.store}
              selectedTaskId={props.selectedTaskId}
            />
          ))}
        </div>
      )}
      <div>
        {tasks.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            store={props.store}
            selectedTaskId={props.selectedTaskId}
          />
        ))}
      </div>
    </React.Fragment>
  );
};

const Tasks = (props: { store: IStore; setTaskId?: (id: string) => void }) => {
  const classes = panelStyles();
  const selectedTaskId = useLocation().pathname.replace('/tasks/', '').replace('/', '');

  return (
    <div className={classes.panel}>
      <AllTasks selectedTaskId={selectedTaskId} setTaskId={props.setTaskId} store={props.store} />
    </div>
  );
};

export default Tasks;
