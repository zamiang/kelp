import Divider from '@material-ui/core/Divider';
import { getDayOfYear } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import PersonRow from '../person/person-row';
import { getWeek } from '../shared/date-helpers';
import panelStyles from '../shared/panel-styles';
import TopBar from '../shared/top-bar';
import { IPerson } from '../store/models/person-model';
import { IStore } from '../store/use-store';

const AllPeople = (props: IStore & { selectedPersonId: string | null }) => {
  const classes = panelStyles();
  const [people, setPeople] = useState<IPerson[]>([]);
  const [featuredPeople, setFeaturedPeople] = useState<IPerson[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await props.personDataStore.getAll(false);
      setPeople(result.sort((a, b) => (a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1)));
    };
    void fetchData();
  }, [props.isLoading, props.lastUpdated]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await props.attendeeDataStore.getForWeek(getWeek(new Date()));
      const p = await props.personDataStore.getBulkByEmail(result.map((r) => r.personId!));

      setFeaturedPeople(p.sort((a, b) => (a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1)));
    };
    void fetchData();
  }, [props.isLoading, props.lastUpdated]);

  return (
    <React.Fragment>
      <div className={classes.rowHighlight}>
        {featuredPeople.map((person) => (
          <PersonRow key={person.id} person={person} selectedPersonId={props.selectedPersonId} />
        ))}
        <Divider />
      </div>
      <div className={classes.rowNoBorder}>
        {people.map((person) => (
          <PersonRow key={person.id} person={person} selectedPersonId={props.selectedPersonId} />
        ))}
      </div>
    </React.Fragment>
  );
};

export const PeopleToday = (
  props: IStore & { selectedPersonId: string | null; noLeftMargin?: boolean },
) => {
  const classes = panelStyles();
  const [people, setPeople] = useState<IPerson[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      const result = await props.attendeeDataStore.getForDay(getDayOfYear(new Date()));
      const p = await props.personDataStore.getBulkByEmail(result.map((r) => r.personId!));
      setPeople(p.sort((a, b) => (a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1)));
    };
    void fetchData();
  }, [props.isLoading, props.lastUpdated]);
  return (
    <div className={classes.rowNoBorder}>
      {people.map(
        (person: IPerson) =>
          person && (
            <PersonRow
              key={person.id}
              person={person}
              selectedPersonId={props.selectedPersonId}
              noLeftMargin={props.noLeftMargin}
            />
          ),
      )}
    </div>
  );
};

const People = (props: { store: IStore; hideHeading?: boolean }) => {
  const classes = panelStyles();
  const selectedPersonId = decodeURIComponent(
    useLocation().pathname.replace('/people/', '').replace('/', ''),
  );

  if (props.hideHeading) {
    return <AllPeople selectedPersonId={selectedPersonId} {...props.store} />;
  }
  return (
    <div className={classes.panel}>
      <TopBar title="People" />
      <AllPeople selectedPersonId={selectedPersonId} {...props.store} />
    </div>
  );
};

export default People;
