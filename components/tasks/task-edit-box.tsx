import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import React, { useState } from 'react';
import rowStyles from '../shared/row-styles';
import { ITask } from '../store/data-types';
import { IStore } from '../store/use-store';
import { editTask } from './edit-task';

const useStyle = makeStyles(() => ({
  container: {
    position: 'relative',
    border: '0px solid',
    padding: 0,
    transition: 'opacity 0.3s',
  },
  input: {
    padding: 0,
    borderRadius: 0,
    background: 'transparent !important',
    lineHeight: '21px',
    '&:hover': {
      background: 'transparent',
    },
  },
  loading: {
    opacity: 0.5,
  },
}));

export const TaskEditBox = (props: {
  store: IStore;
  task: ITask;
  onSuccess: (task: ITask) => void;
}) => {
  const taskStyles = useStyle();
  const classes = rowStyles();
  const [text, setText] = useState<string>(props.task.title);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  return (
    <div
      className={clsx(classes.rowNoHover, taskStyles.container, isLoading && taskStyles.loading)}
    >
      <TextField
        multiline
        variant="filled"
        placeholder="Add a Google Task..."
        fullWidth
        autoFocus
        inputProps={{
          className: taskStyles.input,
        }}
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
              const task = await editTask(
                props.task.id,
                text,
                props.store.defaultTaskList.id,
                props.store.defaultTaskList.title!,
                props.store.googleOauthToken,
                props.store,
              );
              setIsLoading(false);
              if (task) {
                props.onSuccess(task);
              }
            } else {
              alert('No default task list - try going to google tasks first');
            }
          };
          void updateTasks();
        }}
      />
    </div>
  );
};
