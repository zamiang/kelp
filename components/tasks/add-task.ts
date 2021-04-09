import { toNumber } from 'lodash';
import { formatTask } from '../fetch/google/fetch-tasks';
import { IStore } from '../store/use-store';

const fields = 'id,title,completed,updated,deleted,status,due,links,notes,parent,position,selfLink';

export const addTask = async (
  title: string,
  taskListId: string,
  taskListTitle: string,
  authToken: string,
  taskPosition: string | number,
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
  if (formattedTask) {
    (formattedTask as any).position = (toNumber(taskPosition) - 1) as any; // add another zero??
    await store.taskStore.addTasksToStore([formattedTask]);
    return formattedTask;
  } else {
    alert('error');
  }
};
