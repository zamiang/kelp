import update from 'immutability-helper';
import React, { useCallback, useEffect, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useLocation } from 'react-router-dom';
import panelStyles from '../shared/panel-styles';
import { ITask } from '../store/data-types';
import { IStore } from '../store/use-store';
import { TaskCreateBox } from '../tasks/task-create-box';
import TaskRow from '../tasks/task-row';

const AllTasks = (props: {
  store: IStore;
  selectedTaskId: string | null;
  setTaskId?: (id: string) => void;
}) => {
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [taskIncrement, setIncrememnt] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      const result = (await props.store.taskStore.getAll()).filter((task) => !task.parent);
      const sortedResult = result.sort((a, b) => (a.position! < b.position! ? -1 : 1));
      setTasks(sortedResult);

      if (sortedResult[0] && props.setTaskId) {
        props.setTaskId(sortedResult[0].id);
      }
    };
    void fetchData();
  }, [props.store.lastUpdated, props.store.isLoading, taskIncrement.toString()]);

  const moveTask = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      const dragTask = tasks[dragIndex];
      const newTasks = update(tasks, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, dragTask],
        ],
      }).filter(Boolean);
      console.log('new tasks', newTasks);
      setTasks(newTasks);
    },
    [tasks],
  );

  return (
    <React.Fragment>
      <TaskCreateBox
        store={props.store}
        taskIncrement={taskIncrement}
        setTaskIncrement={setIncrememnt}
      />
      <div style={{ marginBottom: 8 }}>
        <DndProvider backend={HTML5Backend}>
          {tasks.map(
            (task) =>
              task && (
                <TaskRow
                  key={task.id}
                  moveTask={moveTask}
                  task={task}
                  store={props.store}
                  selectedTaskId={props.selectedTaskId}
                />
              ),
          )}
        </DndProvider>
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
