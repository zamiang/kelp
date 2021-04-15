import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import CheckIconOrange from '../../public/icons/check-orange.svg';
import CheckIcon from '../../public/icons/check.svg';
import useRowStyles from '../shared/row-styles';
import { ITask } from '../store/data-types';
import { IStore } from '../store/use-store';
import { completeTask } from './complete-task';
import { TaskEditBox } from './task-edit-box';

const useStyles = makeStyles((theme) => ({
  image: {
    display: 'block',
    height: 18,
    width: 18,
  },
  text: {
    whiteSpace: 'pre-wrap',
    marginTop: 5,
  },
  row: {
    minHeight: 48,
    margin: 0,
    paddingTop: 9,
    paddingBottom: 9,
    borderBottom: `1px solid ${theme.palette.divider}`,
    borderRadius: 0,
    '&.MuiListItem-button:hover': {
      borderColor: theme.palette.divider,
    },
  },
}));

const TaskRow = (props: {
  task: ITask;
  selectedTaskId: string | null;
  store: IStore;
  isSmall?: boolean;
}) => {
  const isSelected = props.selectedTaskId === props.task.id;
  const rowStyles = useRowStyles();
  const classes = useStyles();
  const [task, setTask] = useState<ITask>(props.task);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(null);
  const [isCompleted, setIsCompleted] = useState<boolean>(props.task.completedAt ? true : false);

  useEffect(() => {
    if (isSelected && referenceElement) {
      referenceElement.scrollIntoView({ behavior: 'auto', block: 'center' });
    }
  }, [!!referenceElement]);

  return (
    <div
      onClick={() => {
        setIsEditing(true);
      }}
      ref={setReferenceElement as any}
      className={clsx(
        !props.isSmall && rowStyles.row,
        props.isSmall && rowStyles.rowSmall,
        isSelected && rowStyles.rowPrimaryMain,
      )}
    >
      {isEditing && (
        <TaskEditBox
          store={props.store}
          task={task}
          onSuccess={(t: ITask) => {
            setIsEditing(false);
            setTask(t);
          }}
        />
      )}
      {!isEditing && (
        <Grid container spacing={2} alignItems="flex-start">
          <Grid item className={rowStyles.rowLeft}>
            {!props.isSmall && (
              <IconButton
                color={isCompleted ? 'primary' : 'secondary'}
                onClick={(event) => {
                  event.stopPropagation();
                  void completeTask(
                    task.id,
                    task.listId,
                    props.store.googleOauthToken!,
                    props.store,
                  );
                  setIsCompleted(true);
                }}
              >
                {isCompleted ? (
                  <CheckIconOrange className={classes.image} />
                ) : (
                  <CheckIcon className={classes.image} />
                )}
              </IconButton>
            )}
          </Grid>
          <Grid item zeroMinWidth xs>
            <Typography className={classes.text}>{task.title}</Typography>
          </Grid>
        </Grid>
      )}
    </div>
  );
};

export default TaskRow;
