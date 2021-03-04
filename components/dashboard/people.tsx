import { Typography } from '@material-ui/core';
import { getDayOfYear } from 'date-fns';
import { Dictionary, groupBy } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import PersonRow from '../person/person-row';
import { getWeek } from '../shared/date-helpers';
import panelStyles from '../shared/panel-styles';
import rowStyles from '../shared/row-styles';
import TopBar from '../shared/top-bar';
import { IPerson } from '../store/models/person-model';
import { IStore } from '../store/use-store';

const AllPeople = (props: IStore & { selectedPersonId: string | null }) => {
  const classes = rowStyles();
  const [people, setPeople] = useState<Dictionary<IPerson[]>>({});
  const [featuredPeople, setFeaturedPeople] = useState<IPerson[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await props.personDataStore.getAll(false);
      const sortedPeople = result.sort((a, b) =>
        a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1,
      );
      const groupedPeople = groupBy(sortedPeople, (p) => p.name.toLocaleLowerCase()[0]);
      console.log(groupedPeople);
      setPeople(groupedPeople);
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
      {featuredPeople.length > 0 && (
        <div className={classes.rowHighlight}>
          <Typography className={classes.rowText} variant="body2">
            People you are likely to meet with this week
          </Typography>
          {featuredPeople.map((person) => (
            <PersonRow key={person.id} person={person} selectedPersonId={props.selectedPersonId} />
          ))}
        </div>
      )}
      <div>
        {Object.keys(people).map((key) => (
          <React.Fragment key={key}>
            <Typography variant="h6" className={classes.heading}>
              {key}
            </Typography>
            {people[key].map((person) => (
              <PersonRow
                key={person.id}
                person={person}
                selectedPersonId={props.selectedPersonId}
              />
            ))}
          </React.Fragment>
        ))}
      </div>
    </React.Fragment>
  );
};

export const PeopleToday = (
  props: IStore & { selectedPersonId: string | null; isSmall?: boolean },
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
    <div className={classes.section}>
      {people.map(
        (person: IPerson) =>
          person && (
            <PersonRow
              key={person.id}
              person={person}
              selectedPersonId={props.selectedPersonId}
              isSmall={props.isSmall}
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
