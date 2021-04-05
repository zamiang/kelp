import { flatten } from 'lodash';
import config from '../../constants/config';
import { ITask } from '../store/models/task-model';

const formatTask = (task: gapi.client.tasks.Task, list: gapi.client.tasks.TaskList): ITask => ({
  id: task.id!,
  title: task.title!,
  listId: list.id!,
  listTitle: list.title,
  completedAt: task.completed ? new Date(task.completed) : undefined,
  updatedAt: new Date(task.updated!),
  deleted: task.deleted,
  status: task.status as any,
  due: task.due ? new Date(task.due) : undefined,
  links: task.links,
  notes: task.notes,
  parent: task.parent,
  position: task.position,
  selfLink: task.selfLink,
});

const fetchTaskLists = async (authToken: string) => {
  const searchParams = new URLSearchParams({ maxResults: '100' });
  const tasksResponse = await fetch(
    `https://tasks.googleapis.com/tasks/v1/users/@me/lists?${searchParams.toString()}`,
    {
      headers: {
        authorization: `Bearer ${authToken}`,
      },
    },
  );
  const result = (await tasksResponse.json()) as gapi.client.tasks.TaskLists;
  const formattedTaskLists = (result.items || []).filter(Boolean);
  return formattedTaskLists;
};

export const fetchTasks = async (authToken: string, limit: any) => {
  const taskLists = await fetchTaskLists(authToken);
  const searchParams = new URLSearchParams({
    maxResults: '100',
    showHidden: 'false',
    showDeleted: 'false',
    showCompleted: 'true',
    updatedMin: config.startDate.toISOString(),
  });
  const tasksFromLists = await Promise.all(
    taskLists.map(async (list) => {
      const tasksResponse = await limit(async () =>
        fetch(
          `https://tasks.googleapis.com/tasks/v1/lists/${list.id}/tasks?${searchParams.toString()}`,
          {
            headers: {
              authorization: `Bearer ${authToken}`,
            },
          },
        ),
      );
      const response = (await tasksResponse.json()) as gapi.client.tasks.Tasks;
      return (response.items || []).map((t) => formatTask(t, list));
    }),
  );

  const formattedTasks = (flatten(tasksFromLists) || []).filter(Boolean);

  return formattedTasks;
};
