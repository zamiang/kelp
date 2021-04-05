import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import CheckIcon from '../../public/icons/check-orange.svg';
import useButtonStyles from '../shared/button-styles';
import panelStyles from '../shared/panel-styles';
import rowStyles from '../shared/row-styles';
import { ITask } from '../store/models/task-model';
import { IStore } from '../store/use-store';
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

  useEffect(() => {
    const fetchData = async () => {
      const result = (await props.store.taskStore.getAll()).filter((task) => !task.parent);
      // probably not correct
      setTasks(result.sort((a, b) => (a.updatedAt < b.updatedAt ? -1 : 1)));
    };
    void fetchData();
  }, [props.store.lastUpdated, props.store.isLoading]);

  return (
    <React.Fragment>
      <div className={classes.rowNoHover}>
        <Grid container>
          <Grid xs={12}>
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
          <Grid>
            <Button
              className={buttonClasses.button}
              variant="outlined"
              disableElevation
              color="primary"
              startIcon={<CheckIcon width="24" height="24" />}
              onClick={() => {
                alert('wtf');
                setText('');
              }}
              style={{ width: 'auto', margin: '12px auto 0' }}
            >
              Add a task
            </Button>
          </Grid>
        </Grid>
      </div>

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
