import { formatTask } from '../fetch/google/fetch-tasks';
import { IStore } from '../store/use-store';

const fields = 'id,title,completed,updated,deleted,status,due,links,notes,parent,position,selfLink';

export const editTask = async (
  taskId: string,
  title: string,
  taskListId: string,
  taskListTitle: string,
  authToken: string,
  store: IStore,
) => {
  const body = {
    fields,
    title,
  };

  const taskResponse = await fetch(
    `https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks/${taskId}`,
    {
      method: 'PATCH',
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
    await store.taskStore.addTasksToStore([formattedTask]);
    return formattedTask;
  } else {
    alert('error');
  }
};
