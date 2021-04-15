import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import { setHours, setMinutes, subDays } from 'date-fns';
import { Dictionary, flatten } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import ArrowIcon from '../../public/icons/chevron-right.svg';
import { FeaturedMeeting } from '../dashboard/meetings';
import DocumentRow from '../documents/document-row';
import PersonRow from '../person/person-row';
import panelStyles from '../shared/panel-styles';
import useRowStyles from '../shared/row-styles';
import { ISegment, ITask } from '../store/data-types';
import { IStore } from '../store/use-store';
import { TaskCreateBox } from '../tasks/task-create-box';
import TaskRow from '../tasks/task-row';
import { IFeaturedDocument, getFeaturedDocuments } from './documents';
import { IFeaturedPerson, getFeaturedPeople } from './people';

const Home = (props: { store: IStore }) => {
  const classes = panelStyles();
  const rowClasses = useRowStyles();
  const router = useHistory();

  const currentTime = new Date();
  const [meetingsByDay, setMeetingsByDay] = useState<Dictionary<ISegment[]>>({});
  const [featuredPeople, setFeaturedPeople] = useState<IFeaturedPerson[]>([]);
  const [topDocuments, setTopDocuments] = useState<IFeaturedDocument[]>([]);
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [taskIncrement, setIncrememnt] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      const result = await props.store.timeDataStore.getSegmentsByDay(
        subDays(setMinutes(setHours(new Date(), 0), 0), 0),
      );
      setMeetingsByDay(result);
    };
    void fetchData();
  }, [props.store.lastUpdated, props.store.isLoading]);

  let featuredMeeting: ISegment | undefined;
  // Assumes meetings are already sorted
  flatten(Object.values(meetingsByDay)).forEach((meeting) => {
    if (!featuredMeeting && currentTime < meeting.end) {
      featuredMeeting = meeting;
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      const fp = await getFeaturedPeople(props.store);
      setFeaturedPeople(fp);
    };
    void fetchData();
  }, [props.store.isLoading, props.store.lastUpdated]);

  useEffect(() => {
    const fetchData = async () => {
      const result = (await props.store.taskStore.getAll()).filter((task) => !task.parent);
      const sortedResult = result.sort((a, b) => (a.position! < b.position! ? -1 : 1));
      setTasks(sortedResult.slice(0, 3));
    };
    void fetchData();
  }, [props.store.lastUpdated, props.store.isLoading, taskIncrement.toString()]);

  useEffect(() => {
    const fetchData = async () => {
      const featuredDocuments = await getFeaturedDocuments(props.store);
      setTopDocuments(featuredDocuments.filter(Boolean));
    };
    void fetchData();
  }, [props.store.lastUpdated, props.store.isLoading]);

  return (
    <div className={classes.panel}>
      {featuredMeeting && (
        <FeaturedMeeting meeting={featuredMeeting} store={props.store} showButton />
      )}
      {tasks.length > 0 && (
        <div className={rowClasses.rowHighlight}>
          <TaskCreateBox
            store={props.store}
            taskIncrement={taskIncrement}
            setTaskIncrement={setIncrememnt}
          />
          <Typography variant="h6" className={rowClasses.rowText} style={{ marginTop: 16 }}>
            Recent tasks
            <IconButton onClick={() => router.push('/tasks')} className={rowClasses.rightIcon}>
              <ArrowIcon width="24" height="24" />
            </IconButton>
          </Typography>
          {tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              selectedTaskId={null}
              isSmall={false}
              store={props.store}
            />
          ))}
        </div>
      )}
      {topDocuments.length > 0 && (
        <div className={rowClasses.rowHighlight}>
          <Typography className={rowClasses.rowText} variant="h6">
            Recent documents
            <IconButton onClick={() => router.push('/documents')} className={rowClasses.rightIcon}>
              <ArrowIcon width="24" height="24" />
            </IconButton>
          </Typography>
          {topDocuments.map((document) => (
            <DocumentRow
              key={document.document.id}
              document={document.document}
              store={props.store}
              selectedDocumentId={null}
              text={document.text}
            />
          ))}
        </div>
      )}
      {featuredPeople.length > 0 && (
        <div className={rowClasses.rowHighlight}>
          <Typography variant="h6" className={rowClasses.rowText}>
            People you are meeting with next
            <IconButton onClick={() => router.push('/people')} className={rowClasses.rightIcon}>
              <ArrowIcon width="24" height="24" />
            </IconButton>
          </Typography>
          {featuredPeople.map((featuredPerson) => (
            <PersonRow
              key={featuredPerson.person.id}
              person={featuredPerson.person}
              selectedPersonId={null}
              text={featuredPerson.text}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
