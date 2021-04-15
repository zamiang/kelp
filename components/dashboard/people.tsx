import Typography from '@material-ui/core/Typography';
import { format } from 'date-fns';
import { Dictionary, groupBy, sortBy, uniq } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import PersonRow from '../person/person-row';
import panelStyles from '../shared/panel-styles';
import useRowStyles from '../shared/row-styles';
import { IPerson, ISegment } from '../store/data-types';
import { IStore } from '../store/use-store';

export interface IFeaturedPerson {
  person: IPerson;
  meetings: ISegment[];
  nextMeetingStartAt?: Date;
  text?: string;
}

/**
 * Gets people in the featured section by looking through attendees for the coming week
 * Finds attendees and then the upcoming meetings for those attendees
 * It sorts in decending order so upcoming people are next
 */
const maxResult = 3;
export const getFeaturedPeople = async (props: IStore) => {
  const currentDate = new Date();
  const result = await props.attendeeDataStore.getForNextDays(currentDate);
  const peopleForAttendees = await props.personDataStore.getBulk(
    uniq(result.map((r) => r.personId!)),
  );

  // Hash of personId to meeting array
  const meetingsForAttendees: { [id: string]: ISegment[] } = {};
  await Promise.all(
    result.map(async (r) => {
      const meeting = await props.timeDataStore.getById(r.segmentId);
      if (meeting) {
        if (r.personId && meetingsForAttendees[r.personId]) {
          meetingsForAttendees[r.personId].push(meeting);
        } else if (r.personId) {
          meetingsForAttendees[r.personId] = [meeting];
        }
      }
    }),
  );

  const p = peopleForAttendees
    .map((person) => {
      const meetings = sortBy(meetingsForAttendees[person.id], 'start').filter(
        (m) => m.start > currentDate,
      );
      const nextMeetingStartAt = meetings[0] ? meetings[0].start : undefined;
      const text =
        meetings[0] && nextMeetingStartAt
          ? `${meetings[0].summary} on ${format(nextMeetingStartAt, 'EEEE, MMMM d')}`
          : undefined;
      return {
        person,
        meetings,
        nextMeetingStartAt,
        text,
      };
    })
    .filter((m) => m.nextMeetingStartAt && !m.person.isCurrentUser);

  return sortBy(p, 'nextMeetingStartAt').slice(0, maxResult);
};

const AllPeople = (props: {
  store: IStore;
  selectedPersonId: string | null;
  setPersonId?: (id: string) => void;
}) => {
  const classes = useRowStyles();
  const [people, setPeople] = useState<Dictionary<IPerson[]>>({});
  const [featuredPeople, setFeaturedPeople] = useState<IFeaturedPerson[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await props.store.personDataStore.getAll(false);
      const sortedPeople = result
        .filter((p) => !p.name.includes('Unknown'))
        .sort((a, b) => (a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1));
      const groupedPeople = groupBy(sortedPeople, (p) => p.name.toLocaleLowerCase()[0]);
      setPeople(groupedPeople);
    };
    void fetchData();
  }, [props.store.isLoading, props.store.lastUpdated]);

  useEffect(() => {
    const fetchData = async () => {
      const fp = await getFeaturedPeople(props.store);
      setFeaturedPeople(fp);
      if (fp[0] && fp[0].person && props.setPersonId) {
        props.setPersonId(fp[0].person.id);
      }
    };
    void fetchData();
  }, [props.store.isLoading, props.store.lastUpdated]);

  return (
    <React.Fragment>
      {featuredPeople.length > 0 && (
        <div className={classes.rowHighlight}>
          <Typography variant="h6" className={classes.rowText}>
            People you are meeting with next
          </Typography>
          {featuredPeople.map((featuredPerson) => (
            <PersonRow
              key={featuredPerson.person.id}
              person={featuredPerson.person}
              selectedPersonId={props.selectedPersonId}
              text={featuredPerson.text}
            />
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

const People = (props: { store: IStore; setPersonId?: (id: string) => void }) => {
  const classes = panelStyles();
  const selectedPersonId = decodeURIComponent(
    useLocation().pathname.replace('/people/', '').replace('/', ''),
  );

  return (
    <div className={classes.panel}>
      <AllPeople
        selectedPersonId={selectedPersonId}
        store={props.store}
        setPersonId={props.setPersonId}
      />
    </div>
  );
};

export default People;
