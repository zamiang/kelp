import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import MuiLink from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import clsx from 'clsx';
import { formatDistance, formatDuration } from 'date-fns';
import { last } from 'lodash';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import AttendeeList from '../shared/attendee-list';
import AppBar from '../shared/elevate-app-bar';
import useExpandStyles from '../shared/expand-styles';
import MeetingList from '../shared/meeting-list';
import SegmentDocumentList from '../shared/segment-document-list';
import { getAssociates, getMeetingTime } from '../store/helpers';
import { IFormattedAttendee } from '../store/models/attendee-model';
import { IPerson } from '../store/models/person-model';
import { ISegmentDocument } from '../store/models/segment-document-model';
import { ISegment } from '../store/models/segment-model';
import { IStore } from '../store/use-store';
import PersonNotes from './person-notes';

const ADD_SENDER_LINK =
  'https://www.lifewire.com/add-a-sender-to-your-gmail-address-book-fast-1171918';

const ExpandPerson = (props: { store: IStore; personId: string; close: () => void }) => {
  const classes = useExpandStyles();
  const [person, setPerson] = useState<IPerson | undefined>(undefined);
  const [segments, setSegments] = useState<ISegment[]>([]);
  const [segmentDocuments, setSegmentDocuments] = useState<ISegmentDocument[]>([]);
  const [associates, setAssociates] = useState<IFormattedAttendee[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      const p = await props.store.personDataStore.getPersonById(props.personId);
      setPerson(p);
    };
    void fetchData();
  }, [props.personId]);

  useEffect(() => {
    const fetchData = async () => {
      const p = await props.store.segmentDocumentStore.getAllForPersonId(props.personId);
      setSegmentDocuments(p);
    };
    void fetchData();
  }, [props.personId]);

  useEffect(() => {
    const fetchData = async () => {
      const s = await props.store.timeDataStore.getSegmentsForPersonId(props.personId);
      if (s) {
        setSegments(s.filter(Boolean) as any);
      }
    };
    void fetchData();
  }, [props.personId]);

  useEffect(() => {
    const fetchData = async () => {
      const a = await getAssociates(props.personId, segments, props.store.attendeeDataStore);
      setAssociates(a);
    };
    void fetchData();
  }, [segments.length]);

  if (!person) {
    return null;
  }
  const lastMeeting = last(segments);
  const meetingTime = getMeetingTime(segments);
  const timeInMeetings = formatDuration(meetingTime.thisWeek)
    .replace(' hours', 'h')
    .replace(' minutes', 'm');
  const timeInMeetingsLastWeek = formatDuration(meetingTime.lastWeek)
    .replace(' hours', 'h')
    .replace(' minutes', 'm');

  const hasName = !person.name.includes('people/') && !person.name.includes('@');
  const hasMeetingTime = meetingTime.lastWeekMs > 0;
  return (
    <React.Fragment>
      <AppBar
        linkedinName={hasName ? person.name : undefined}
        onClose={props.close}
        emailAddress={person.emailAddresses[0]}
      />
      <div className={classes.topContainer}>
        <Box flexDirection="column" alignItems="center" display="flex">
          <Avatar className={classes.avatar} src={person.imageUrl || ''}>
            {(person.name || person.id)[0]}
          </Avatar>
          <Typography
            className={clsx(classes.title, classes.titleCenter)}
            variant="h5"
            color="textPrimary"
            gutterBottom
            noWrap
          >
            {person.name}
          </Typography>
          <PersonNotes person={person} refetch={props.store.refetch} />
        </Box>
      </div>
      <Divider />
      <Grid container className={classes.triGroup} justify="space-between">
        <Grid item xs className={classes.triGroupItem}>
          <Typography variant="h6" className={classes.triGroupHeading}>
            Last meeting
          </Typography>
          {lastMeeting && (
            <Link href={`/meetings/${lastMeeting.id}`}>
              <Typography className={classes.highlight}>
                <span className={classes.highlightValue} style={{ fontSize: '1.3094rem' }}>
                  {formatDistance(lastMeeting.start, new Date(), { addSuffix: true })}
                </span>
              </Typography>
            </Link>
          )}
          {!lastMeeting && (
            <Typography className={classes.highlight}>
              <span className={classes.highlightValue}>None</span>
            </Typography>
          )}
        </Grid>
        <div className={classes.triGroupBorder}></div>
        <Grid item xs className={classes.triGroupItem}>
          <Typography variant="h6" className={classes.triGroupHeading}>
            Meetings this week
          </Typography>
          <Typography className={classes.highlight}>
            <span className={classes.highlightValue}>{timeInMeetings || 'None'} </span>
            {hasMeetingTime && (
              <span className={classes.highlightSub}>from {timeInMeetingsLastWeek || 'None'}</span>
            )}
          </Typography>
        </Grid>
      </Grid>
      <Divider />
      <div className={classes.container}>
        {!person.isInContacts && (
          <Typography variant="body2">
            Add this person to your google contacts for more info{' '}
            <MuiLink className={classes.link} target="_blank" href={ADD_SENDER_LINK}>
              (guide)
            </MuiLink>
            <br />
            {person.emailAddresses && (
              <MuiLink
                className={classes.link}
                target="_blank"
                href={`https://mail.google.com/mail/u/0/#search/${person.emailAddresses[0]}`}
              >
                (search Gmail)
              </MuiLink>
            )}
          </Typography>
        )}
        <React.Fragment>
          <Typography variant="h6" className={classes.smallHeading}>
            Documents they have edited
          </Typography>
          <SegmentDocumentList
            segmentDocuments={segmentDocuments}
            personStore={props.store.personDataStore}
            docStore={props.store.documentDataStore}
          />
        </React.Fragment>
        <React.Fragment>
          <Typography variant="h6" className={classes.smallHeading}>
            Associates
          </Typography>
          <AttendeeList
            personStore={props.store.personDataStore}
            attendees={associates}
            showAll={true}
          />
        </React.Fragment>
        <React.Fragment>
          <Typography variant="h6" className={classes.smallHeading}>
            Meetings you both attended
          </Typography>
          <MeetingList segments={segments} personStore={props.store.personDataStore} />
        </React.Fragment>
      </div>
    </React.Fragment>
  );
};

export default ExpandPerson;
