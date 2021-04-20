import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import React, { useState } from 'react';
import PlusIcon from '../../public/icons/plus-white.svg';
import useButtonStyles from '../shared/button-styles';
import rowStyles from '../shared/row-styles';
import { ITask } from '../store/data-types';
import { IStore } from '../store/use-store';
import { editTask } from './edit-task';

const useStyle = makeStyles(() => ({
  container: {
    position: 'relative',
    border: '0px solid',
    padding: 0,
  },
  button: {
    position: 'absolute',
    right: 28,
    bottom: 9,
    maxWidth: 88,
  },
}));

export const TaskEditBox = (props: {
  store: IStore;
  task: ITask;
  onSuccess: (task: ITask) => void;
}) => {
  const taskStyles = useStyle();
  const classes = rowStyles();
  const buttonClasses = useButtonStyles();
  const [text, setText] = useState<string>(props.task.title);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  return (
    <div className={clsx(classes.rowNoHover, taskStyles.container)}>
      <TextField
        multiline
        variant="outlined"
        placeholder="Add a Google Task..."
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
      >
        Save
      </Button>
    </div>
  );
};