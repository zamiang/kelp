import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import PlusIcon from '../../public/icons/plus-white.svg';
import useButtonStyles from '../shared/button-styles';
import rowStyles from '../shared/row-styles';
import { ITask } from '../store/data-types';
import { IStore } from '../store/use-store';
import { addTask } from '../tasks/add-task';

const useStyle = makeStyles(() => ({
  container: {
    position: 'relative',
    border: '0px solid',
    paddingBottom: 0,
  },
  button: {
    position: 'absolute',
    right: 28,
    bottom: 9,
    maxWidth: 88,
  },
}));

export const TaskCreateBox = (props: {
  store: IStore;
  taskIncrement?: number;
  setTaskIncrement?: (increment: number) => void;
}) => {
  const taskStyles = useStyle();
  const classes = rowStyles();
  const buttonClasses = useButtonStyles();
  const [text, setText] = useState<string>('');
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useHistory();

  useEffect(() => {
    const fetchData = async () => {
      const result = (await props.store.taskStore.getAll()).filter((task) => !task.parent);
      const sortedResult = result.sort((a, b) => (a.position! < b.position! ? -1 : 1));
      setTasks(sortedResult);
    };
    void fetchData();
  }, [
    props.store.lastUpdated,
    props.store.isLoading,
    props.taskIncrement ? props.taskIncrement.toString() : '',
  ]);

  if (!props.store.defaultTaskList) {
    return null;
  }

  return (
    <div className={clsx(classes.rowNoHover, taskStyles.container)}>
      <TextField
        multiline
        variant="outlined"
        placeholder="Add a task (saved to Google Tasks)"
        fullWidth
        onChange={(event) => {
          setText(event.target.value);
        }}
        value={text}
      />
      <Button
        className={clsx(buttonClasses.button, taskStyles.button)}
        variant="contained"
        disableElevation
        color="primary"
        startIcon={
          isLoading ? (
            <CircularProgress color={'white' as any} size={24} />
          ) : (
            <PlusIcon width="24" height="24" />
          )
        }
        onClick={() => {
          setIsLoading(true);
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
            setIsLoading(false);
            // trigger refetching
            if (props.setTaskIncrement && props.taskIncrement) {
              props.setTaskIncrement(props.taskIncrement + 1);
            }
            router.push('/tasks');
          };
          void updateTasks();
          setText('');
        }}
      >
        Save
      </Button>
    </div>
  );
};
