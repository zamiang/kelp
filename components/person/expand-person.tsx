import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AttendeeList from '../shared/attendee-list';
import useButtonStyles from '../shared/button-styles';
import useExpandStyles from '../shared/expand-styles';
import MeetingList from '../shared/meeting-list';
import usePanelStyles from '../shared/panel-styles';
import SegmentDocumentList from '../shared/segment-document-list';
import { getAssociates } from '../store/helpers';
import { IFormattedAttendee } from '../store/models/attendee-model';
import { IPerson } from '../store/models/person-model';
import { ISegmentDocument } from '../store/models/segment-document-model';
import { ISegment } from '../store/models/segment-model';
import { IStore } from '../store/use-store';
import PersonNotes from './person-notes';

const ADD_SENDER_LINK =
  'https://www.lifewire.com/add-a-sender-to-your-gmail-address-book-fast-1171918';

const ExpandPerson = (props: { store: IStore; personId?: string; close?: () => void }) => {
  const classes = useExpandStyles();
  const buttonClasses = useButtonStyles();
  const panelClasses = usePanelStyles();
  const { slug }: any = useParams();
  const personId = props.personId || decodeURIComponent(slug);
  const [person, setPerson] = useState<IPerson | undefined>(undefined);
  const [segments, setSegments] = useState<ISegment[]>([]);
  const [segmentDocuments, setSegmentDocuments] = useState<ISegmentDocument[]>([]);
  const [associates, setAssociates] = useState<IFormattedAttendee[]>([]);
  const [associatesStats, setAssociatesStats] = useState<any>({});

  useEffect(() => {
    const fetchData = async () => {
      const p = await props.store.personDataStore.getById(personId);
      setPerson(p);
    };
    void fetchData();
  }, [props.store.isLoading, personId]);

  useEffect(() => {
    const fetchData = async () => {
      const p = await props.store.segmentDocumentStore.getAllForPersonId(personId);
      setSegmentDocuments(p);
    };
    void fetchData();
  }, [props.store.isLoading, personId]);

  useEffect(() => {
    const fetchData = async () => {
      const s = await props.store.timeDataStore.getSegmentsForPersonId(personId);
      if (s) {
        const filteredSegments = s.filter(Boolean) as any;
        setSegments(filteredSegments);

        const a = await getAssociates(personId, filteredSegments, props.store.attendeeDataStore);
        setAssociates(a.attendees.slice(0, 5));
        setAssociatesStats(a.attendeeStats);
      }
    };
    void fetchData();
  }, [props.store.isLoading, personId]);

  if (!person) {
    return null;
  }
  const emailAddress = person.emailAddresses[0];
  return (
    <div className={panelClasses.panel}>
      <div className={classes.topContainer}>
        <Box flexDirection="column" alignItems="center" display="flex">
          <Avatar className={classes.avatar} src={person.imageUrl || ''}>
            {(person.name || person.id)[0]}
          </Avatar>
          <Typography className={classes.titleCenter} variant="h5" color="textPrimary" gutterBottom>
            {person.name}
          </Typography>
        </Box>
        {emailAddress && (
          <div style={{ textAlign: 'center' }}>
            {emailAddress}{' '}
            <Link onClick={() => navigator.clipboard.writeText(emailAddress)}>copy</Link>
            <br />
            <div style={{ maxWidth: 150, margin: '10px auto 0 ' }}>
              <Button
                className={clsx(buttonClasses.button, buttonClasses.buttonPrimary)}
                variant="outlined"
                href={`mailto:${emailAddress}`}
                target="_blank"
              >
                Email Contact
              </Button>
            </div>
          </div>
        )}
      </div>
      <Divider />
      <div className={classes.container}>
        {person.isInContacts && person.googleId && (
          <React.Fragment>
            <Typography variant="h6">Notes</Typography>
            <PersonNotes
              person={person}
              setPerson={(p: any) => setPerson(p)}
              personStore={props.store.personDataStore}
              scope={props.store.scope}
              accessToken={props.store.googleOauthToken}
            />
          </React.Fragment>
        )}
        {(!person.isInContacts || !person.googleId) && (
          <Typography variant="body2">
            Add this person to your google contacts for more info{' '}
            <Link target="_blank" href={ADD_SENDER_LINK}>
              (guide)
            </Link>
            <br />
            {person.emailAddresses && (
              <Link
                target="_blank"
                href={`https://mail.google.com/mail/u/0/#search/${person.emailAddresses[0]}`}
              >
                (search Gmail)
              </Link>
            )}
          </Typography>
        )}
        {segmentDocuments.length > 0 && (
          <React.Fragment>
            <Typography variant="h6">Documents they have edited</Typography>
            <SegmentDocumentList segmentDocuments={segmentDocuments} store={props.store} />
          </React.Fragment>
        )}
        {associates.length > 0 && (
          <React.Fragment>
            <Typography variant="h6">Associates</Typography>
            <AttendeeList
              personStore={props.store.personDataStore}
              attendees={associates}
              attendeeMeetingCount={associatesStats}
              showAll={true}
            />
          </React.Fragment>
        )}
        <React.Fragment>
          <Typography variant="h6">Meetings you both attended</Typography>
          <MeetingList segments={segments} personStore={props.store.personDataStore} />
        </React.Fragment>
      </div>
    </div>
  );
};

export default ExpandPerson;
