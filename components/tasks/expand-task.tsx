import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useButtonStyles from '../shared/button-styles';
import useExpandStyles from '../shared/expand-styles';
import { ITask } from '../store/models/task-model';
import { IStore } from '../store/use-store';

const tasksLink = 'https://calendar.google.com/calendar/u/0/r?opentasks=1';

const ExpandedTask = (props: { store: IStore; taskId?: string; close?: () => void }) => {
  const classes = useExpandStyles();
  const buttonClasses = useButtonStyles();
  const { slug }: any = useParams();
  const taskId = props.taskId || slug;
  const [task, setTask] = useState<ITask | undefined>(undefined);

  useEffect(() => {
    const fetchData = async () => {
      if (taskId) {
        const result = await props.store.taskStore.getById(taskId);
        setTask(result);
      }
    };
    void fetchData();
  }, [props.store.isLoading, taskId]);

  if (!task) {
    return null;
  }

  return (
    <React.Fragment>
      <div className={classes.topContainer}>
        <div className={classes.headingContainer}>
          <Typography variant="h3" color="textPrimary" gutterBottom>
            {task.title || '(no title)'}
          </Typography>
          {task.updated && (
            <Typography variant="h5">
              Modified: {format(new Date(task.updated), "EEEE, MMMM d yyyy 'at' p")}
            </Typography>
          )}
        </div>
        <div style={{ margin: '10px auto 0 ' }}>
          <Button
            className={buttonClasses.button}
            variant="contained"
            disableElevation
            color="primary"
            href={tasksLink}
            target="_blank"
          >
            Edit Task
          </Button>
        </div>
      </div>
    </React.Fragment>
  );
};

export default ExpandedTask;
