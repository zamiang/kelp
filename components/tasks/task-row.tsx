import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import CheckIcon from '../../public/icons/check.svg';
import useRowStyles from '../shared/row-styles';
import { ITask } from '../store/models/task-model';
import { IStore } from '../store/use-store';
import { completeTask } from './complete-task';

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
  const router = useHistory();
  const rowStyles = useRowStyles();
  const classes = useStyles();
  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (isSelected && referenceElement) {
      referenceElement.scrollIntoView({ behavior: 'auto', block: 'center' });
    }
  }, [!!referenceElement]);

  return (
    <div
      onClick={() => {
        void router.push(`/tasks/${props.task.id}`);
        return false;
      }}
      ref={setReferenceElement as any}
      className={clsx(
        !props.isSmall && rowStyles.row,
        props.isSmall && rowStyles.rowSmall,
        isSelected && rowStyles.rowPrimaryMain,
      )}
    >
      <Grid container spacing={2} alignItems="flex-start">
        <Grid item className={rowStyles.rowLeft}>
          {!props.isSmall && (
            <IconButton
              onClick={(event) => {
                event.stopPropagation();
                void completeTask(
                  props.task.id!,
                  props.task.taskList,
                  props.store.googleOauthToken,
                );
                alert('todo: complete task');
              }}
            >
              <CheckIcon className={classes.image} />
            </IconButton>
          )}
        </Grid>
        <Grid item zeroMinWidth xs>
          <Typography className={classes.text}>{props.task.title}</Typography>
        </Grid>
      </Grid>
    </div>
  );
};

export default TaskRow;
