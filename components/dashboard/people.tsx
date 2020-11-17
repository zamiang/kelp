import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import { flatten, sortBy, uniqBy } from 'lodash';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import PersonRow from '../person/person-row';
import { getWeek } from '../shared/date-helpers';
import panelStyles from '../shared/panel-styles';
import TopBar from '../shared/top-bar';
import { IStore } from '../store/use-store';

const PeopleToday = (props: IStore & { selectedPersonId: string | null }) => {
  const classes = panelStyles();
  const meetingsToday = props.timeDataStore.getSegmentsForDay(new Date());
  const peopleMeetingWithToday = sortBy(
    uniqBy(
      flatten(meetingsToday.map((segment) => segment.formattedAttendees)),
      'personId',
    ).map((attendee) => props.personDataStore.getPersonById(attendee.personId)),
    'name',
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
              />
            ),
        )}
      </div>
    </div>
  );
};

const PeopleThisWeek = (props: IStore & { selectedPersonId: string | null }) => {
  const classes = panelStyles();
  const meetingsThisWeek = props.timeDataStore.getSegmentsForWeek(getWeek(new Date()));
  const peopleMeetingWithThisWeek = sortBy(
    uniqBy(
      flatten(meetingsThisWeek.map((segment) => segment.formattedAttendees)),
      'personId',
    ).map((attendee) => props.personDataStore.getPersonById(attendee.personId)),
    'name',
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
  const people = sortBy(props.personDataStore.getPeople(), 'name');
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
  today: 'Contacts you are meeting with today',
  'this-week': 'Contacts you are meeting with this week',
  all: 'All Contacts',
};

const People = (props: IStore) => {
  const classes = panelStyles();
  const [currentTab, changeTab] = useState<tab>('this-week');
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
        <Grid container spacing={2}>
          <Grid item>
            <Button
              variant="contained"
              className={currentTab === 'today' ? classes.selected : classes.unSelected}
              disableElevation
              onClick={() => changeTab('today')}
            >
              Today
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              className={currentTab === 'this-week' ? classes.selected : classes.unSelected}
              disableElevation
              onClick={() => changeTab('this-week')}
            >
              This Week
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              className={currentTab === 'all' ? classes.selected : classes.unSelected}
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
