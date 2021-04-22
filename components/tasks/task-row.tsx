import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import CheckIconOrange from '../../public/icons/check-orange.svg';
import CircleIcon from '../../public/icons/circle.svg';
import useRowStyles from '../shared/row-styles';
import { ITask } from '../store/data-types';
import { IStore } from '../store/use-store';
import { completeTask, unCompleteTask } from './complete-task';
import { TaskEditBox } from './task-edit-box';

const useStyles = makeStyles(() => ({
  image: {
    display: 'block',
    height: 18,
    width: 18,
  },
  text: {
    whiteSpace: 'pre-wrap',
  },
  showRow: {
    transition: 'all 1s ease-out',
    overflow: 'hidden',
    height: 'auto',
  },
  hideRow: {
    height: 0,
    padding: 0,
  },
  completeText: {
    textDecoration: 'line-through',
  },
}));

const TaskRow = (props: { task: ITask; selectedTaskId: string | null; store: IStore }) => {
  const isSelected = props.selectedTaskId === props.task.id;
  const rowStyles = useRowStyles();
  const classes = useStyles();
  const [task, setTask] = useState<ITask>(props.task);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isVisible, setVisible] = useState(true);
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
        rowStyles.row,
        isSelected && rowStyles.rowPrimaryMain,
        classes.showRow,
        !isVisible && isCompleted && classes.hideRow,
      )}
    >
      <Grid container alignItems="flex-start">
        <Grid item className={rowStyles.rowLeft}>
          <IconButton
            color={isCompleted ? 'primary' : 'secondary'}
            size="small"
            style={{ marginTop: 8 }}
            onClick={(event) => {
              if (isCompleted) {
                event.stopPropagation();
                void unCompleteTask(
                  task.id,
                  task.listId,
                  props.store.googleOauthToken!,
                  props.store,
                );
                setIsCompleted(false);
              } else {
                event.stopPropagation();
                void completeTask(task.id, task.listId, props.store.googleOauthToken!, props.store);
                setIsCompleted(true);
                setTimeout(() => {
                  setVisible(false);
                }, 1000 * 3);
              }
            }}
          >
            {isCompleted ? (
              <CheckIconOrange className={classes.image} />
            ) : (
              <CircleIcon className={classes.image} />
            )}
          </IconButton>
        </Grid>
        <Grid item zeroMinWidth xs>
          <div className={rowStyles.rowTopPadding}>
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
              <Typography className={clsx(classes.text, isCompleted && classes.completeText)}>
                {task.title}
              </Typography>
            )}
          </div>
        </Grid>
      </Grid>
    </div>
  );
};

export default TaskRow;
