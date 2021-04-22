import { IStore } from '../store/use-store';

const fields = 'id,title,completed,updated,deleted,status,due,links,notes,parent,position,selfLink';

export const completeTask = async (
  taskId: string,
  taskListId: string,
  authToken: string,
  store: IStore,
) => {
  const body = {
    status: 'completed',
    id: taskId,
    fields,
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
  await store.taskStore.completeTask(taskId);
  return taskResponse;
};

export const unCompleteTask = async (
  taskId: string,
  taskListId: string,
  authToken: string,
  store: IStore,
) => {
  const body = {
    status: 'needsAction',
    id: taskId,
    fields,
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
  await store.taskStore.completeTask(taskId);
  return taskResponse;
};
