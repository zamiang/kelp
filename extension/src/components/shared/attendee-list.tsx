import Typography from '@mui/material/Typography';
import clsx from 'clsx';
import { orderBy } from 'lodash';
import React, { useEffect, useState } from 'react';
import config from '../../../../constants/config';
import PersonRow from '../person/person-row';
import { IFormattedAttendee, IPerson } from '../store/data-types';
import PersonDataStore from '../store/models/person-model';
import { IStore } from '../store/use-store';
import '../../styles/components/shared/attendee-list.css';

const Row = (props: {
  attendee: IFormattedAttendee;
  personStore: IStore['personDataStore'];
  meetingCount?: number;
  isSmall?: boolean;
}) => {
  const [person, setPerson] = useState<IPerson | undefined>(undefined);
  useEffect(() => {
    const fetchData = async () => {
      if (props.attendee.emailAddress) {
        const result = await props.personStore.getByEmail(props.attendee.emailAddress);
        setPerson(result);
      }
    };
    void fetchData();
  }, [props.attendee.personId]);

  if (!person) {
    return null;
  }
  return (
    <PersonRow
      responseStatus={props.attendee.responseStatus}
      selectedPersonId={null}
      person={person}
      noMargin={props.isSmall}
    />
  );
};

interface IProps {
  attendees: IFormattedAttendee[];
  personStore: PersonDataStore;
  showAll: boolean;
  attendeeMeetingCount?: any;
  isSmall?: boolean;
}

const AttendeeRows = (props: IProps) => {
  const orderedAttendees = orderBy(props.attendees || [], 'responseStatus');
  return (
    <div>
      {orderedAttendees.map((attendee) => (
        <Row
          key={attendee.id}
          attendee={attendee}
          personStore={props.personStore}
          isSmall={props.isSmall}
        />
      ))}
    </div>
  );
};

const AttendeeList = (props: IProps) => {
  const [isExpanded, setExpand] = useState<boolean>(
    props.showAll || props.attendees.length < config.ATTENDEE_MAX,
  );
  if (props.attendees.length < 1) {
    return null;
  }
  return (
    <div className="attendee-list">
      {isExpanded && <AttendeeRows {...props} />}
      {!isExpanded && (
        <Typography
          variant="subtitle2"
          className={clsx('attendee-list__expand', 'ignore-react-onclickoutside')}
          onClick={() => setExpand(true)}
        >
          Show Full List
        </Typography>
      )}
    </div>
  );
};

export default AttendeeList;
