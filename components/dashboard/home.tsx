import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import { setHours, setMinutes, subDays } from 'date-fns';
import { Dictionary, flatten } from 'lodash';
import React, { useEffect, useState } from 'react';
import { FeaturedMeeting } from '../dashboard/meetings';
import { IFeaturedPerson, PeopleToday, getFeaturedPeople } from '../dashboard/people';
import PersonRow from '../person/person-row';
import panelStyles from '../shared/panel-styles';
import useRowStyles from '../shared/row-styles';
import { ISegment } from '../store/data-types';
import { IStore } from '../store/use-store';
import { DocumentsForToday } from './documents';

const Home = (props: { store: IStore }) => {
  const classes = panelStyles();
  const rowClasses = useRowStyles();

  const currentTime = new Date();
  const [meetingsByDay, setMeetingsByDay] = useState<Dictionary<ISegment[]>>({});
  const [featuredPeople, setFeaturedPeople] = useState<IFeaturedPerson[]>([]);

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

  return (
    <div className={classes.panel}>
      {featuredMeeting && <FeaturedMeeting meeting={featuredMeeting} store={props.store} />}
      {featuredPeople.length > 0 && (
        <div className={rowClasses.rowHighlight}>
          <Typography variant="h6" className={rowClasses.rowText}>
            People you are meeting with next
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
      <Typography variant="h6">People you are meeting with today</Typography>
      <PeopleToday store={props.store} selectedPersonId={null} isSmall />
      <Divider />
      <Typography variant="h6">Documents you may need today</Typography>
      <DocumentsForToday store={props.store} selectedDocumentId={null} isSmall={true} />
    </div>
  );
};

export default Home;
