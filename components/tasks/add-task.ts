import { formatTask } from '../fetch/fetch-tasks';
import { IStore } from '../store/use-store';

const fields = 'id,title,completed,updated,deleted,status,due,links,notes,parent,position,selfLink';

export const addTask = async (
  title: string,
  taskListTitle: string,
  taskListId: string,
  authToken: string,
  store: IStore,
) => {
  const body = {
    fields,
    title,
  };

  const taskResponse = await fetch(
    `https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(body),
    },
  );
  const formattedTask = formatTask(await taskResponse.json(), {
    id: taskListId,
    title: taskListTitle,
  });
  await store.taskStore.addTasksToStore([formattedTask]);
  return formattedTask;
};
