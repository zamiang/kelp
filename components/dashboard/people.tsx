import { Divider } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import { flatten, sortBy, uniqBy } from 'lodash';
import { useRouter } from 'next/router';
import React from 'react';
import panelStyles from '../../components/shared/panel-styles';
import PersonRow from '../person/person-row';
import { getWeek } from '../shared/date-helpers';
import { IStore } from '../store/use-store';

const People = (props: IStore) => {
  const classes = panelStyles();
  const people = sortBy(props.personDataStore.getPeople(), 'name');
  const selectedPersonId = useRouter().query.slug as string;
  const meetingsThisWeek = props.timeDataStore.getSegmentsForWeek(getWeek(new Date()));
  const peopleMeetingWithThisWeek = sortBy(
    uniqBy(
      flatten(meetingsThisWeek.map((segment) => segment.formattedAttendees)),
      'personId',
    ).map((attendee) => props.personDataStore.getPersonById(attendee.personId)),
    'name',
  );
  return (
    <div className={classes.panel}>
      <div className={classes.section}>
        {peopleMeetingWithThisWeek.length > 0 && (
          <div className={classes.rowNoBorder}>
            <Typography variant="caption" className={classes.title}>
              People you are meeting with this week
            </Typography>
            <Divider />
            {peopleMeetingWithThisWeek.map(
              (person) =>
                person && (
                  <PersonRow
                    key={person.id}
                    person={person}
                    selectedPersonId={selectedPersonId}
                    {...props}
                  />
                ),
            )}
          </div>
        )}
        <div className={classes.rowNoBorder}>
          <Typography variant="caption" className={classes.title}>
            Contacts
          </Typography>
          <Divider />
          {people.map((person) => (
            <PersonRow
              key={person.id}
              person={person}
              selectedPersonId={selectedPersonId}
              {...props}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default People;
