import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import CheckIcon from '../../public/icons/check-orange.svg';
import EditIcon from '../../public/icons/edit-orange.svg';
import DocumentRow from '../documents/document-row';
import useButtonStyles from '../shared/button-styles';
import useExpandStyles from '../shared/expand-styles';
import { Meeting } from '../shared/meeting-list';
import { IDocument } from '../store/models/document-model';
import { ISegment } from '../store/models/segment-model';
import { ITaskDocument } from '../store/models/task-document-model';
import { ITask } from '../store/models/task-model';
import { IStore } from '../store/use-store';
import { completeTask } from './complete-task';
import TaskRow from './task-row';

const tasksLink = 'https://calendar.google.com/calendar/u/0/r?opentasks=1';

const TaskDocumentRow = (props: { store: IStore; taskDocument: ITaskDocument }) => {
  const [document, setDocument] = useState<IDocument | undefined>(undefined);

  useEffect(() => {
    const fetchData = async () => {
      if (props.taskDocument.documentId) {
        const result = await props.store.documentDataStore.getById(props.taskDocument.documentId);
        if (result) {
          setDocument(result);
        }
      }
    };
    void fetchData();
  }, [props.store.isLoading, props.taskDocument.id]);

  if (!document) {
    return null;
  }

  return <DocumentRow document={document} store={props.store} selectedDocumentId={null} />;
};

const TaskMeetingRow = (props: { store: IStore; taskDocument: ITaskDocument }) => {
  const [meeting, setMeeting] = useState<ISegment | undefined>(undefined);

  useEffect(() => {
    const fetchData = async () => {
      const result = await props.store.timeDataStore.getById(props.taskDocument.segmentId!);
      if (result) {
        setMeeting(result);
      }
    };
    void fetchData();
  }, [props.store.isLoading, props.taskDocument.id]);

  if (!meeting) {
    return null;
  }

  return (
    <Meeting
      meeting={meeting}
      personStore={props.store.personDataStore}
      info={props.taskDocument.reason}
    />
  );
};

const ExpandedTask = (props: { store: IStore; taskId?: string; close?: () => void }) => {
  const classes = useExpandStyles();
  const buttonClasses = useButtonStyles();
  const { slug }: any = useParams();
  const taskId = props.taskId || slug;
  const [task, setTask] = useState<ITask | undefined>(undefined);
  const [subTasks, setSubTasks] = useState<ITask[]>([]);
  const [taskDocuments, setTaskDocuments] = useState<ITaskDocument[]>([]);
  const [taskMeetings, setTaskMeetings] = useState<ITaskDocument[]>([]);

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
        const result = await props.store.taskStore.getAllByParentId(taskId);
        setSubTasks(result);
      }
    };
    void fetchData();
  }, [props.store.isLoading, taskId]);

  useEffect(() => {
    const fetchData = async () => {
      if (taskId) {
        const result = await props.store.taskDocumentStore.getAllForTaskId(taskId);
        const meetings = result.filter((r) => !!r.segmentId);
        const documents = result.filter((r) => !!r.documentId);
        console.log(meetings, documents);
        setTaskDocuments(document);
        setTaskMeetings(meetings);
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
          {task.updatedAt && (
            <Typography variant="h5">
              Modified: {format(task.updatedAt, "EEEE, MMMM d yyyy 'at' p")}
            </Typography>
          )}
        </div>
        <div style={{ margin: '10px auto 0 ' }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Button
                className={buttonClasses.button}
                variant="outlined"
                disableElevation
                color="primary"
                startIcon={<CheckIcon width="24" height="24" />}
                onClick={() => {
                  void completeTask(
                    task.id,
                    task.listId,
                    props.store.googleOauthToken!,
                    props.store,
                  );
                  alert('complete task');
                }}
              >
                Complete Task
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                className={buttonClasses.button}
                variant="outlined"
                disableElevation
                color="primary"
                startIcon={<EditIcon width="24" height="24" />}
                href={tasksLink}
                target="_blank"
              >
                Edit Task
              </Button>
            </Grid>
          </Grid>
        </div>
      </div>
      <Divider />
      <div className={classes.container}>
        {subTasks.length > 0 && (
          <div className={classes.section}>
            <Typography variant="h6" style={{ marginBottom: 0 }}>
              Subtasks
            </Typography>
            <div>
              {subTasks.map(
                (subTask) =>
                  subTask && (
                    <TaskRow
                      key={subTask.id}
                      selectedTaskId={null}
                      task={subTask}
                      store={props.store}
                    />
                  ),
              )}
            </div>
          </div>
        )}
        {taskMeetings.length > 0 && (
          <div className={classes.section}>
            <Typography variant="h6" style={{ marginBottom: 0 }}>
              Related Meetings
            </Typography>
            <div>
              {taskMeetings.map(
                (taskMeeting) =>
                  taskMeeting && (
                    <TaskMeetingRow
                      key={taskMeeting.id}
                      taskDocument={taskMeeting}
                      store={props.store}
                    />
                  ),
              )}
            </div>
          </div>
        )}
        {taskDocuments.length > 0 && (
          <div className={classes.section}>
            <Typography variant="h6" style={{ marginBottom: 0 }}>
              Related Documents
            </Typography>
            <div>
              {taskDocuments.map(
                (taskDocument) =>
                  taskDocument && (
                    <TaskDocumentRow
                      key={task.id}
                      taskDocument={taskDocument}
                      store={props.store}
                    />
                  ),
              )}
            </div>
          </div>
        )}
      </div>
    </React.Fragment>
  );
};

export default ExpandedTask;
