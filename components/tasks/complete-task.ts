export const completeTask = async (taskId: string, taskList: string, authToken: string) => {
  const body = {
    completed: new Date().toISOString,
  };

  const taskResponse = await fetch(
    `https://tasks.googleapis.com/tasks/v1/lists/${taskList}/tasks/${taskId}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(body),
    },
  );
  return taskResponse;
};
