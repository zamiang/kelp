import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { orderBy } from 'lodash';
import React, { useEffect, useState } from 'react';
import config from '../../constants/config';
import PersonRow from '../person/person-row';
import { IFormattedAttendee, IPerson } from '../store/data-types';
import PersonDataStore from '../store/models/person-model';
import { IStore } from '../store/use-store';

const Row = (props: {
  attendee: IFormattedAttendee;
  personStore: IStore['personDataStore'];
  meetingCount?: number;
  isSmall?: boolean;
}) => {
  const [person, setPerson] = useState<IPerson | undefined>(undefined);
  useEffect(() => {
    const fetchData = async () => {
      if (props.attendee.personId) {
        const result = await props.personStore.getById(props.attendee.personId);
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
      isSmall={props.isSmall}
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

const useAttendeeStyles = makeStyles(() => ({
  expand: {
    textDecoration: 'underline',
    cursor: 'pointer',
  },
}));

const AttendeeList = (props: IProps) => {
  const classes = useAttendeeStyles();
  const [isExpanded, setExpand] = useState<boolean>(
    props.showAll || props.attendees.length < config.ATTENDEE_MAX,
  );
  if (props.attendees.length < 1) {
    return null;
  }
  return (
    <React.Fragment>
      {isExpanded && <AttendeeRows {...props} />}
      {!isExpanded && (
        <Typography
          variant="subtitle2"
          className={clsx(classes.expand, 'ignore-react-onclickoutside')}
          onClick={() => setExpand(true)}
        >
          Show Full List
        </Typography>
      )}
    </React.Fragment>
  );
};

export default AttendeeList;
