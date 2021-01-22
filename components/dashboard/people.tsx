import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import { sortBy } from 'lodash';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import PersonRow from '../person/person-row';
import useButtonStyles from '../shared/button-styles';
import panelStyles from '../shared/panel-styles';
import TopBar from '../shared/top-bar';
import { IStore } from '../store/use-store';

export const PeopleToday = (
  props: IStore & { selectedPersonId: string | null; noLeftMargin?: boolean },
) => {
  const classes = panelStyles();
  const peopleMeetingWithToday = props.personDataStore.getPeopleMeetingWithOnDay(
    props.timeDataStore,
    new Date(),
    true,
  );
  return (
    <div className={classes.section}>
      <div className={classes.rowNoBorder}>
        {peopleMeetingWithToday.map(
          (person) =>
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
    </div>
  );
};

const PeopleThisWeek = (props: IStore & { selectedPersonId: string | null }) => {
  const classes = panelStyles();
  const peopleMeetingWithThisWeek = props.personDataStore.getPeopleMeetingWithThisWeek(
    props.timeDataStore,
    true,
  );
  return (
    <div className={classes.section}>
      <div className={classes.rowNoBorder}>
        {peopleMeetingWithThisWeek.map(
          (person) =>
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
    </div>
  );
};

const AllPeople = (props: IStore & { selectedPersonId: string | null }) => {
  const classes = panelStyles();
  const people = sortBy(props.personDataStore.getPeople(true), 'name');
  return (
    <div className={classes.section}>
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
