import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import { getDayOfYear } from 'date-fns';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import PersonRow from '../person/person-row';
import useButtonStyles from '../shared/button-styles';
import { getWeek } from '../shared/date-helpers';
import panelStyles from '../shared/panel-styles';
import TopBar from '../shared/top-bar';
import { IPerson } from '../store/models/person-model';
import { IStore } from '../store/use-store';

export const PeopleToday = (
  props: IStore & { selectedPersonId: string | null; noLeftMargin?: boolean },
) => {
  const classes = panelStyles();
  const [people, setPeople] = useState<IPerson[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      const result = await props.attendeeDataStore.getForDay(getDayOfYear(new Date()));
      const p = await props.personDataStore.getBulkByEmail(result.map((r) => r.personId!));
      setPeople(p.sort((a, b) => (a.name < b.name ? -1 : 1)));
    };
    void fetchData();
  }, []);
  return (
    <div className={classes.rowNoBorder}>
      {people.map(
        (person: IPerson) =>
          person && (
            <PersonRow
              key={person.id}
              person={person}
              selectedPersonId={props.selectedPersonId}
              store={{ ...props }}
              noLeftMargin={props.noLeftMargin}
            />
          ),
      )}
    </div>
  );
};

const PeopleThisWeek = (props: IStore & { selectedPersonId: string | null }) => {
  const classes = panelStyles();
  const [people, setPeople] = useState<IPerson[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      const result = await props.attendeeDataStore.getForWeek(getWeek(new Date()));
      const p = await props.personDataStore.getBulkByEmail(result.map((r) => r.personId!));

      setPeople(p.sort((a, b) => (a.name < b.name ? -1 : 1)));
    };
    void fetchData();
  }, []);
  return (
    <div className={classes.rowNoBorder}>
      {people.map(
        (person: IPerson) =>
          person && (
            <PersonRow
              key={person.id}
              person={person}
              selectedPersonId={props.selectedPersonId}
              store={{ ...props }}
            />
          ),
      )}
    </div>
  );
};

const AllPeople = (props: IStore & { selectedPersonId: string | null }) => {
  const classes = panelStyles();
  const [people, setPeople] = useState<IPerson[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await props.personDataStore.getAll(true);
      setPeople(result.sort((a, b) => (a.name < b.name ? -1 : 1)));
    };
    void fetchData();
  }, []);

  return (
    <div className={classes.rowNoBorder}>
      {people.map((person) => (
        <PersonRow
          key={person.id}
          person={person}
          selectedPersonId={props.selectedPersonId}
          store={{ ...props }}
        />
      ))}
    </div>
  );
};

type tab = 'today' | 'this-week' | 'all';

const titleHash = {
  today: 'Contacts',
  'this-week': 'Contacts',
  all: 'Contacts',
};

const People = (props: IStore) => {
  const classes = panelStyles();
  const buttonClasses = useButtonStyles();
  const [currentTab, changeTab] = useState<tab>('all');
  const selectedPersonId = useRouter().query.slug as string;
  const currentTitle = titleHash[currentTab];
  const tabHash = {
    all: <AllPeople selectedPersonId={selectedPersonId} {...props} />,
    'this-week': <PeopleThisWeek selectedPersonId={selectedPersonId} {...props} />,
    today: <PeopleToday selectedPersonId={selectedPersonId} {...props} />,
  };
  return (
    <div className={classes.panel}>
      <TopBar title={currentTitle}>
        <Grid container spacing={2} justify="flex-end">
          <Grid item>
            <Button
              variant="contained"
              className={currentTab === 'today' ? buttonClasses.selected : buttonClasses.unSelected}
              disableElevation
              onClick={() => changeTab('today')}
            >
              Today
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              className={
                currentTab === 'this-week' ? buttonClasses.selected : buttonClasses.unSelected
              }
              disableElevation
              onClick={() => changeTab('this-week')}
            >
              This Week
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              className={currentTab === 'all' ? buttonClasses.selected : buttonClasses.unSelected}
              disableElevation
              onClick={() => changeTab('all')}
            >
              All
            </Button>
          </Grid>
        </Grid>
      </TopBar>
      {tabHash[currentTab]}
    </div>
  );
};

export default People;
