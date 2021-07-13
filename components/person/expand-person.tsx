import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import clsx from 'clsx';
import { flatten, uniqBy } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import EmailIcon from '../../public/icons/email-orange.svg';
import AttendeeList from '../shared/attendee-list';
import useButtonStyles from '../shared/button-styles';
import useExpandStyles from '../shared/expand-styles';
import MeetingList from '../shared/meeting-list';
import usePanelStyles from '../shared/panel-styles';
import useRowStyles from '../shared/row-styles';
import SegmentDocumentList from '../shared/segment-document-list';
import { IFormattedAttendee, IPerson, ISegment, ISegmentDocument } from '../store/data-types';
import { getAssociates } from '../store/helpers';
import { IStore } from '../store/use-store';
import { IFeaturedWebsite } from '../website/get-featured-websites';

const ADD_SENDER_LINK =
  'https://www.lifewire.com/add-a-sender-to-your-gmail-address-book-fast-1171918';

const ExpandPerson = (props: {
  store: IStore;
  personId?: string;
  close?: () => void;
  isDarkMode: boolean;
  hideWebsite: (item: IFeaturedWebsite) => void;
  currentFilter: string;
}) => {
  const classes = useExpandStyles();
  const buttonClasses = useButtonStyles();
  const panelClasses = usePanelStyles();
  const rowStyles = useRowStyles();
  const { slug }: any = useParams();
  const personId = props.personId || decodeURIComponent(slug);
  const [person, setPerson] = useState<IPerson | undefined>(undefined);
  const [segments, setSegments] = useState<ISegment[]>([]);
  const [upcomingSegments, setUpcomingSegments] = useState<ISegment[]>([]);
  const [segmentDocuments, setSegmentDocuments] = useState<ISegmentDocument[]>([]);
  const [associates, setAssociates] = useState<IFormattedAttendee[]>([]);
  const [associatesStats, setAssociatesStats] = useState<any>({});

  useEffect(() => {
    const fetchData = async () => {
      const p = await props.store.personDataStore.getByIdOrEmail(personId);
      setPerson(p);

      const s =
        p &&
        flatten(
          await Promise.all(
            p.emailAddresses.map((e) => props.store.timeDataStore.getSegmentsForEmail(e)),
          ),
        );
      if (s) {
        const filteredSegments = s.filter(Boolean) as ISegment[];
        setSegments(filteredSegments);

        const currentDay = new Date();
        const upcommingSegments = s.filter((s) => s && s.start && s.start > currentDay);
        setUpcomingSegments(upcommingSegments as any);

        const a = await getAssociates(personId, filteredSegments, props.store.attendeeDataStore);
        setAssociates(a.attendees.slice(0, 5));
        setAssociatesStats(a.attendeeStats);

        // segment documents
        // potentially should be in the database
        const segmentDocumentsFromPersonEdits =
          await props.store.segmentDocumentStore.getAllForPersonId(personId);
        const segmentDocumentsFromSegments = await Promise.all(
          filteredSegments.map(async (s: ISegment) =>
            props.store.segmentDocumentStore.getAllForSegment(s),
          ),
        );
        const segmentDocumentsCombined = uniqBy(
          segmentDocumentsFromPersonEdits.concat(flatten(segmentDocumentsFromSegments)),
          'segmentId',
        );

        setSegmentDocuments(segmentDocumentsCombined);
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
          <Avatar
            alt={`Profile photo for ${person.name || person.emailAddresses[0] || undefined}`}
            className={classes.avatar}
            src={person.imageUrl || ''}
          >
            {(person.name || person.id)[0]}
          </Avatar>
          <Typography className={classes.titleCenter} variant="h3" color="textPrimary" gutterBottom>
            {person.name}
          </Typography>
        </Box>
        {emailAddress && (
          <div style={{ textAlign: 'center' }}>
            <Typography variant="h5">
              {emailAddress}{' '}
              <Link
                style={{ cursor: 'pointer' }}
                onClick={() => navigator.clipboard.writeText(emailAddress)}
              >
                copy
              </Link>
            </Typography>
            <div style={{ maxWidth: 210, margin: '10px auto 0 ' }}>
              <Button
                className={clsx(buttonClasses.button, buttonClasses.buttonPrimary)}
                variant="outlined"
                href={`mailto:${emailAddress}`}
                target="_blank"
                startIcon={<EmailIcon width="24" height="24" />}
              >
                Email Contact
              </Button>
            </div>
          </div>
        )}
      </div>
      <Divider />
      <div className={classes.container}>
        {upcomingSegments.length > 0 && (
          <div className={rowStyles.rowHighlight} style={{ margin: 0 }}>
            <Typography variant="h6" className={rowStyles.rowText}>
              Upcoming Meetings
            </Typography>
            <MeetingList
              segments={upcomingSegments}
              store={props.store}
              isDarkMode={props.isDarkMode}
              currentFilter={props.currentFilter}
              hideWebsite={props.hideWebsite}
            />
          </div>
        )}
        {!person.isInContacts && (
          <div className={classes.section}>
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
          </div>
        )}
        {segmentDocuments.length > 0 && (
          <div className={classes.section}>
            <Typography variant="h6" style={{ marginBottom: 0 }}>
              Related documents
            </Typography>
            <SegmentDocumentList
              segmentDocuments={segmentDocuments}
              store={props.store}
              isSmall={true}
            />
          </div>
        )}
        {associates.length > 0 && (
          <div className={classes.section}>
            <Typography variant="h6">Associates</Typography>
            <AttendeeList
              personStore={props.store.personDataStore}
              attendees={associates}
              attendeeMeetingCount={associatesStats}
              showAll={true}
              isSmall={true}
            />
          </div>
        )}
        <div className={classes.section}>
          <Typography variant="h6">Meetings you both attended</Typography>
          <MeetingList
            segments={segments}
            store={props.store}
            isDarkMode={props.isDarkMode}
            currentFilter={props.currentFilter}
            hideWebsite={props.hideWebsite}
          />
        </div>
      </div>
    </div>
  );
};

export default ExpandPerson;
