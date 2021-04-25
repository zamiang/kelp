import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { setHours, setMinutes, subDays } from 'date-fns';
import { Dictionary, flatten } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import ArrowIcon from '../../public/icons/chevron-right.svg';
import DocumentRow from '../documents/document-row';
import { FeaturedMeeting } from '../meeting/featured-meeting';
import { LineCalendar } from '../meeting/line-calendar';
import PersonRow from '../person/person-row';
import useRowStyles from '../shared/row-styles';
import { ISegment, ITask, ITopWebsite } from '../store/data-types';
import { IStore } from '../store/use-store';
import { TaskCreateBox } from '../tasks/task-create-box';
import { IFeaturedDocument, getFeaturedDocuments } from './documents';
import { IFeaturedPerson, getFeaturedPeople } from './people';
import Tasks from './tasks';
import { TopWebsites } from './top-websites';

const useStyles = makeStyles((theme) => ({
  panel: {
    marginTop: theme.spacing(3),
  },
  boxStyle: {
    background: '#fff',
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  heading: {
    marginLeft: 0,
    cursor: 'pointer',
    color: '#000',
  },
  lineCalendarContainer: {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
}));

const Home = (props: { store: IStore }) => {
  const classes = useStyles();
  const rowClasses = useRowStyles();
  const router = useHistory();

  const currentTime = new Date();
  const [meetingsByDay, setMeetingsByDay] = useState<Dictionary<ISegment[]>>({});
  const [featuredPeople, setFeaturedPeople] = useState<IFeaturedPerson[]>([]);
  const [topDocuments, setTopDocuments] = useState<IFeaturedDocument[]>([]);
  const [topWebsites, setTopWebsites] = useState<ITopWebsite[]>([]);
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

  useEffect(() => {
    const fetchData = async () => {
      const topWebsites = await props.store.topWebsitesStore.getAll();
      setTopWebsites(topWebsites.filter(Boolean));
    };
    void fetchData();
  }, [props.store.lastUpdated, props.store.isLoading]);

  return (
    <div className={classes.panel}>
      <Typography variant="h6" className={classes.heading} onClick={() => router.push('/meetings')}>
        Today&rsquo;s Meetings
        <IconButton className={rowClasses.rightIcon}>
          <ArrowIcon width="24" height="24" />
        </IconButton>
      </Typography>
      <Box boxShadow={3} borderRadius={8} className={classes.boxStyle}>
        <div className={classes.lineCalendarContainer}>
          <LineCalendar store={props.store} />
        </div>
        {featuredMeeting && (
          <FeaturedMeeting meeting={featuredMeeting} store={props.store} showButton />
        )}
      </Box>
      {tasks.length > 0 && (
        <div className={classes.panel}>
          <Typography
            variant="h6"
            className={classes.heading}
            onClick={() => router.push('/tasks')}
          >
            Recent tasks
            <IconButton className={rowClasses.rightIcon}>
              <ArrowIcon width="24" height="24" />
            </IconButton>
          </Typography>
          <Box
            boxShadow={3}
            borderRadius={8}
            className={classes.boxStyle}
            style={{ paddingTop: 0 }}
          >
            <Tasks store={props.store} />
          </Box>
        </div>
      )}
      {topDocuments.length > 0 && (
        <div className={classes.panel}>
          <Typography
            variant="h6"
            className={classes.heading}
            onClick={() => router.push('/documents')}
          >
            Recent documents
            <IconButton className={rowClasses.rightIcon}>
              <ArrowIcon width="24" height="24" />
            </IconButton>
          </Typography>
          <Box boxShadow={3} borderRadius={8} className={classes.boxStyle}>
            {topDocuments.map((document) => (
              <DocumentRow
                key={document.document.id}
                document={document.document}
                store={props.store}
                selectedDocumentId={null}
                text={document.text}
              />
            ))}
          </Box>
        </div>
      )}
      {topWebsites.length > 0 && (
        <div className={classes.panel}>
          <Typography variant="h6" className={classes.heading}>
            Top Websites
          </Typography>
          <Box boxShadow={3} borderRadius={8} className={classes.boxStyle}>
            <TopWebsites store={props.store} />
          </Box>
        </div>
      )}
      {featuredPeople.length > 0 && (
        <div className={classes.panel}>
          <Typography
            variant="h6"
            className={classes.heading}
            onClick={() => router.push('/people')}
          >
            People you are meeting with next
            <IconButton className={rowClasses.rightIcon}>
              <ArrowIcon width="24" height="24" />
            </IconButton>
          </Typography>
          <Box boxShadow={3} borderRadius={8} className={classes.boxStyle}>
            {featuredPeople.map((featuredPerson) => (
              <PersonRow
                key={featuredPerson.person.id}
                person={featuredPerson.person}
                selectedPersonId={null}
                text={featuredPerson.text}
              />
            ))}
          </Box>
        </div>
      )}
    </div>
  );
};

export default Home;
