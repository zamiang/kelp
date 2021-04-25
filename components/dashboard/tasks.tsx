import React, { useEffect, useState } from 'react';
import { DragDropContext, Draggable, DropResult, Droppable } from 'react-beautiful-dnd';
import { useLocation } from 'react-router-dom';
import panelStyles from '../shared/panel-styles';
import { ITask } from '../store/data-types';
import { IStore } from '../store/use-store';
import { moveTaskRequest } from '../tasks/move-task';
import { TaskCreateBox } from '../tasks/task-create-box';
import TaskRow from '../tasks/task-row';

interface ITaskWithIndex extends ITask {
  index: number;
}

const TaskItem = (props: {
  store: IStore;
  task: ITaskWithIndex;
  selectedTaskId: string | null;
  index: number;
}) => (
  <Draggable draggableId={props.task.id} index={props.index}>
    {(provided) => (
      <div
        key={props.task.id}
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
      >
        <TaskRow
          task={props.task}
          store={props.store}
          selectedTaskId={props.selectedTaskId}
        />
      </div>
    )}
  </Draggable>
);

const TaskListMemo = React.memo(function QuoteList({ tasks, store, selectedTaskId }: any) {
  return tasks.map((task: ITaskWithIndex, index: number) => (
    <TaskItem
      task={task}
      index={index}
      store={store}
      key={task.id}
      selectedTaskId={selectedTaskId}
    />
  ));
});

const moveTask = (tasks: ITaskWithIndex[], startIndex: number, endIndex: number) => {
  const result = Array.from(tasks);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result.map((t, index) => ({ ...t, index }));
};

const AllTasks = (props: {
  store: IStore;
  selectedTaskId: string | null;
  setTaskId?: (id: string) => void;
}) => {
  const [tasks, setTasks] = useState<ITaskWithIndex[]>([]);
  const [taskIncrement, setIncrememnt] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      const result = (await props.store.taskStore.getAll()).filter((task) => !task.parent);
      const sortedResult = result
        .sort((a, b) => (a.position! < b.position! ? -1 : 1))
        .map((t, index) => ({ ...t, index }));
      setTasks(sortedResult);

      if (sortedResult[0] && props.setTaskId) {
        props.setTaskId(sortedResult[0].id);
      }
    };
    void fetchData();
  }, [props.store.lastUpdated, props.store.isLoading, taskIncrement.toString()]);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    if (result.destination.index === result.source.index) {
      return;
    }
    const newTasks = moveTask(tasks, result.source.index, result.destination.index);
    setTasks(newTasks);

    const movedTask = newTasks[result.destination.index];
    void moveTaskRequest(
      movedTask.id,
      newTasks[result.destination.index - 1]?.id,
      movedTask.listId,
      movedTask.listTitle!,
      props.store.googleOauthToken!,
      props.store,
    );
  };

  return (
    <React.Fragment>
      <TaskCreateBox
        store={props.store}
        taskIncrement={taskIncrement}
        setTaskIncrement={setIncrememnt}
      />
      <div style={{ marginBottom: 8 }}>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="tasks-list">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                <TaskListMemo
                  selectedTaskId={props.selectedTaskId}
                  setTaskId={props.setTaskId}
                  store={props.store}
                  tasks={tasks}
                  setTasks={setTasks}
                />
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
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
