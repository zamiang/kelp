import config from '../../constants/config';

const formatTask = (task: gapi.client.tasks.Task) => {
  console.log(task);
  return task;
};

const fetchTaskLists = async (authToken: string) => {
  const searchParams = new URLSearchParams({ maxResults: '100' });

  const tasksResponse = await fetch(
    `https://people.googleapis.com/v1//tasks/v1/users/@me/lists?${searchParams.toString()}`,
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

export const fetchTasks = async (authToken: string) => {
  const taskLists = await fetchTaskLists(authToken);
  const searchParams = new URLSearchParams({
    maxResults: '100',
    showHidden: 'false',
    showDeleted: 'false',
    updatedMin: config.startDate.toString(),
  });

  const tasksResponse = await fetch(
    `https://people.googleapis.com/v1//tasks/v1/users/@me/lists?${searchParams.toString()}`,
    {
      headers: {
        authorization: `Bearer ${authToken}`,
      },
    },
  );

  const result = (await tasksResponse.json()) as gapi.client.tasks.Tasks;

  const formattedTasks = (result.items || [])
    .filter(Boolean)
    .map((response) => formatTask(response));

  return formattedTasks;
};
