import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import React, { useRef, useState } from 'react';
import { DropTargetMonitor, useDrag, useDrop } from 'react-dnd';
import Linkify from 'react-linkify';
import CheckIconOrange from '../../public/icons/check-orange.svg';
import CircleIcon from '../../public/icons/circle.svg';
import useButtonStyles from '../shared/button-styles';
import isTouchEnabled from '../shared/is-touch-enabled';
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

interface DragItem {
  index: number;
  id: string;
  type: string;
}

const TaskRow = (props: {
  task: ITask;
  selectedTaskId: string | null;
  store: IStore;
  moveTask?: (dragIndex: number, hoverIndex: number) => void;
}) => {
  const buttonStyles = useButtonStyles();
  const isSelected = props.selectedTaskId === props.task.id;
  const rowStyles = useRowStyles();
  const classes = useStyles();
  const [task, setTask] = useState<ITask>(props.task);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isVisible, setVisible] = useState(true);
  const [isCompleted, setIsCompleted] = useState<boolean>(props.task.completedAt ? true : false);
  const [isDetailsVisible, setDetailsVisible] = useState(isTouchEnabled());

  const ref = useRef<HTMLDivElement>(null);
  const [{ handlerId }, drop] = useDrop({
    accept: 'task',
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: DragItem, monitor: DropTargetMonitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = Number(props.task.position);

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = (clientOffset?.y || 0) - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      if (props.moveTask) {
        props.moveTask(dragIndex, hoverIndex);
      }

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: 'task',
    item: () => props.task,
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0 : 1;
  if (props.moveTask) {
    drag(drop(ref));
  }

  return (
    <div
      style={{ opacity }}
      ref={ref}
      data-handler-id={handlerId}
      onMouseEnter={() => !isTouchEnabled() && setDetailsVisible(true)}
      onMouseLeave={() => !isTouchEnabled() && setDetailsVisible(false)}
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
                <Linkify
                  componentDecorator={(decoratedHref, decoratedText, key) => (
                    <a
                      target="blank"
                      href={decoratedHref}
                      key={key}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {decoratedText}
                    </a>
                  )}
                >
                  {task.title.trim()}
                </Linkify>
              </Typography>
            )}
          </div>
        </Grid>
        {isDetailsVisible && (
          <Grid item>
            <Button
              className={clsx(buttonStyles.button, buttonStyles.buttonPrimary)}
              variant="outlined"
              onClick={(event) => {
                event.stopPropagation();
                setIsEditing(true);
                return false;
              }}
            >
              Details
            </Button>
          </Grid>
        )}
      </Grid>
    </div>
  );
};

export default TaskRow;
