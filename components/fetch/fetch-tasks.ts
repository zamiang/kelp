import { flatten } from 'lodash';
import config from '../../constants/config';

const formatTask = (task: gapi.client.tasks.Task) => task;

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
      return response.items;
    }),
  );

  const formattedTasks = (flatten(tasksFromLists) || [])
    .filter(Boolean)
    .map((response) => formatTask(response!));

  return formattedTasks;
};
