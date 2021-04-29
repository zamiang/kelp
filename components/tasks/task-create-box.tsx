import CircularProgress from '@material-ui/core/CircularProgress';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import useButtonStyles from '../shared/button-styles';
import rowStyles from '../shared/row-styles';
import { ITask } from '../store/data-types';
import { IStore } from '../store/use-store';
import { addTask } from '../tasks/add-task';

const useStyle = makeStyles((theme) => ({
  container: {
    position: 'relative',
    border: '0px solid',
    paddingBottom: 0,
    marginBottom: theme.spacing(2),
  },
  button: {
    position: 'absolute',
    right: 28,
    bottom: 9,
    maxWidth: 36,
    background: '#BCBCBC',
  },
  input: {},
}));

export const TaskCreateBox = (props: {
  store: IStore;
  taskIncrement: number;
  setTaskIncrement: (increment: number) => void;
}) => {
  const taskStyles = useStyle();
  const classes = rowStyles();
  const buttonClasses = useButtonStyles();
  const [text, setText] = useState<string>('');
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      const result = (await props.store.taskStore.getAll()).filter((task) => !task.parent);
      const sortedResult = result.sort((a, b) => (a.position! < b.position! ? -1 : 1));
      setTasks(sortedResult);
    };
    void fetchData();
  }, [props.store.lastUpdated, props.store.isLoading, props.taskIncrement.toString()]);

  return (
    <div className={clsx(classes.rowNoHover, taskStyles.container)}>
      <TextField
        multiline
        variant="filled"
        placeholder="Add a Google Task..."
        fullWidth
        className={taskStyles.input}
        onChange={(event) => {
          setText(event.target.value);
        }}
        value={text}
        onKeyDown={(event) => {
          if (event.key !== 'Enter' || event.shiftKey) {
            return;
            // put the login here
          }
          event.preventDefault();
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
            props.setTaskIncrement(props.taskIncrement + 1);
          };
          void updateTasks();
          setText('');
        }}
      />
      {isLoading && (
        <IconButton
          className={clsx(buttonClasses.button, taskStyles.button)}
          style={{ maxWidth: 30 }}
        >
          <CircularProgress color={'white' as any} size={18} />
        </IconButton>
      )}
    </div>
  );
};
