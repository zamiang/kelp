import Typography from '@material-ui/core/Typography';
import { flatten, sortBy, uniqBy } from 'lodash';
import { useRouter } from 'next/router';
import React from 'react';
import panelStyles from '../../components/shared/panel-styles';
import PersonRow from '../person/person-row';
import { getWeek } from '../shared/date-helpers';
import { IStore } from '../store/use-store';

const People = (props: IStore) => {
  const styles = panelStyles();
  const people = sortBy(props.personDataStore.getPeople(), 'name');
  const selectedPersonId = useRouter().query.slug as string;
  const meetingsThisWeek = props.timeDataStore.getSegmentsForWeek(getWeek(new Date()));
  const peopleMeetingWithThisWeek = uniqBy(
    flatten(meetingsThisWeek.map((segment) => segment.attendees)),
    'id',
  );
  console.log(peopleMeetingWithThisWeek);
  return (
    <React.Fragment>
      {peopleMeetingWithThisWeek.length > 0 && (
        <div className={styles.row}>
          <Typography className={styles.title}>People you are meeting with this week</Typography>
          {people.map((person) => (
            <PersonRow
              key={person.id}
              person={person}
              selectedPersonId={selectedPersonId}
              {...props}
            />
          ))}
        </div>
      )}
      <Typography className={styles.title}>Contacts</Typography>
      {people.map((person) => (
        <PersonRow key={person.id} person={person} selectedPersonId={selectedPersonId} {...props} />
      ))}
    </React.Fragment>
  );
};

export default People;
