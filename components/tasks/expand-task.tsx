import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useButtonStyles from '../shared/button-styles';
import useExpandStyles from '../shared/expand-styles';
import SegmentMeetingList from '../shared/segment-meeting-list';
import { ISegmentDocument } from '../store/models/segment-document-model';
import { ITask } from '../store/models/task-model';
import { IStore } from '../store/use-store';

const tasksLink = 'https://calendar.google.com/calendar/u/0/r?opentasks=1';

const ExpandedTask = (props: { store: IStore; taskId?: string; close?: () => void }) => {
  const classes = useExpandStyles();
  const buttonClasses = useButtonStyles();
  const { slug }: any = useParams();
  const taskId = props.taskId || slug;
  const [task, setTask] = useState<ITask | undefined>(undefined);
  const [segmentDocuments, setSegmentDocuments] = useState<ISegmentDocument[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (taskId) {
        const result = await props.store.taskStore.getById(taskId);
        setTask(result);
      }
    };
    void fetchData();
  }, [props.store.isLoading, taskId]);

  useEffect(() => {
    const fetchData = async () => {
      if (taskId) {
        const result = await props.store.taskDocumentStore.getAllForTaskId(taskId);
        setSegmentDocuments(result);
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
      <Divider />
      <div className={classes.container}>
        {segmentDocuments.length > 0 && (
          <div className={classes.section}>
            <Typography variant="h6">Meetings</Typography>
            <SegmentMeetingList
              segmentDocuments={segmentDocuments}
              timeStore={props.store.timeDataStore}
              personStore={props.store.personDataStore}
            />
          </div>
        )}
      </div>
    </React.Fragment>
  );
};

export default ExpandedTask;
