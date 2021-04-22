import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { format } from 'date-fns';
import { uniqBy } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import CheckIcon from '../../public/icons/check-orange.svg';
import EditIcon from '../../public/icons/edit-orange.svg';
import PlusIcon from '../../public/icons/plus-white.svg';
import DocumentRow from '../documents/document-row';
import useButtonStyles from '../shared/button-styles';
import useExpandStyles from '../shared/expand-styles';
import { Meeting } from '../shared/meeting-list';
import { IDocument, ISegment, ITask, ITaskDocument } from '../store/data-types';
import { IStore } from '../store/use-store';
import { completeTask } from './complete-task';
import { editTask } from './edit-task';
import TaskRow from './task-row';

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
      isSmall={true}
    />
  );
};

const TaskEdit = (props: {
  store: IStore;
  text: string;
  taskId: string;
  setIsEditMode: (isEditMode: boolean) => void;
}) => {
  const [text, setText] = useState<string>(props.text);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const buttonClasses = useButtonStyles();
  return (
    <div>
      <Grid container>
        <Grid xs={12}>
          <TextField
            multiline
            rows={4}
            variant="outlined"
            fullWidth
            onChange={(event) => {
              setText(event.target.value);
            }}
            value={text}
          />
        </Grid>
      </Grid>
      <Button
        className={buttonClasses.button}
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
          if (isLoading) {
            return;
          }
          const updateTasks = async () => {
            if (props.store.defaultTaskList?.id && props.store.googleOauthToken) {
              setIsLoading(true);
              await editTask(
                props.taskId,
                text,
                props.store.defaultTaskList.id,
                props.store.defaultTaskList.title!,
                props.store.googleOauthToken,
                props.store,
              );
              setIsLoading(true);
              props.setIsEditMode(false);
            } else {
              alert('No default task list - try going to google tasks first');
            }
          };
          void updateTasks();
        }}
        style={{ width: 'auto', margin: '12px 0 0 auto' }}
      >
        Save
      </Button>
    </div>
  );
};

const ExpandedTask = (props: { store: IStore; taskId?: string; close?: () => void }) => {
  const classes = useExpandStyles();
  const buttonClasses = useButtonStyles();
  const { slug }: any = useParams();
  const taskId = props.taskId || slug;
  const [task, setTask] = useState<ITask | undefined>(undefined);
  const [isEditMode, setEditMode] = useState<boolean>(false);
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
  }, [props.store.isLoading, taskId, isEditMode]);

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
        setTaskDocuments(uniqBy(documents, 'documentId'));
        setTaskMeetings(uniqBy(meetings, 'segmentId'));
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
          {task.listTitle && (
            <Typography variant="h5" style={{ marginBottom: 5 }}>
              {task.listTitle}
            </Typography>
          )}
          {!isEditMode && (
            <Typography variant="h3" color="textPrimary" gutterBottom>
              {task.title || '(no title)'}
            </Typography>
          )}
          {isEditMode && (
            <TaskEdit
              taskId={task.id}
              store={props.store}
              text={task.title}
              setIsEditMode={setEditMode}
            />
          )}
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
            {!isEditMode && (
              <Grid item xs={6}>
                <Button
                  className={buttonClasses.button}
                  variant="outlined"
                  disableElevation
                  color="primary"
                  startIcon={<EditIcon width="24" height="24" />}
                  onClick={() => setEditMode(true)}
                >
                  Edit Task
                </Button>
              </Grid>
            )}
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
