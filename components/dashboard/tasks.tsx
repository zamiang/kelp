import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import PlusIcon from '../../public/icons/plus-white.svg';
import useButtonStyles from '../shared/button-styles';
import panelStyles from '../shared/panel-styles';
import rowStyles from '../shared/row-styles';
import { ITask } from '../store/data-types';
import { IStore } from '../store/use-store';
import { addTask } from '../tasks/add-task';
import TaskRow from '../tasks/task-row';

const AllTasks = (props: {
  store: IStore;
  selectedTaskId: string | null;
  setTaskId?: (id: string) => void;
}) => {
  const classes = rowStyles();
  const buttonClasses = useButtonStyles();
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [text, setText] = useState<string>('');
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

  return (
    <React.Fragment>
      {props.store.defaultTaskList && (
        <div className={classes.rowNoHover}>
          <Grid container>
            <Grid item xs={12}>
              <TextField
                multiline
                rows={4}
                variant="outlined"
                fullWidth
                onChange={(event) => {
                  setText(event.target.value);
                }}
                value={text}
              />
            </Grid>
          </Grid>
          <Button
            className={buttonClasses.button}
            variant="contained"
            disableElevation
            color="primary"
            startIcon={<PlusIcon width="24" height="24" />}
            onClick={() => {
              const updateTasks = async () => {
                if (props.store.defaultTaskList?.id && props.store.googleOauthToken) {
                  await addTask(
                    text,
                    props.store.defaultTaskList.id,
                    props.store.defaultTaskList.title!,
                    props.store.googleOauthToken,
                    tasks[0] && tasks[0].position ? tasks[0].position : '000000000000',
                    props.store,
                  );
                } else {
                  alert('No default task list - try going to google tasks first');
                }
                // trigger refetching
                setIncrememnt(taskIncrement + 1);
              };
              void updateTasks();
              setText('');
            }}
            style={{ width: 'auto', margin: '12px 0 0 auto' }}
          >
            Add a task
          </Button>
        </div>
      )}
      <div>
        {tasks.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            store={props.store}
            selectedTaskId={props.selectedTaskId}
          />
        ))}
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
