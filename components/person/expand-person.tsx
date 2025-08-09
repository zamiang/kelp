import Grid from '@mui/material/Grid';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { flatten } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import config from '../../constants/config';
import EmailIcon from '../../public/icons/email.svg';
import AttendeeList from '../shared/attendee-list';
import { getAssociates } from '../shared/calendar-helpers';
import MeetingList from '../shared/meeting-list';
import { orderByCount } from '../shared/order-by-count';
import { Row, classes } from '../shared/row-styles';
import SegmentDocumentList from '../shared/segment-document-list';
import {
  IFormattedAttendee,
  IPerson,
  ISegment,
  ISegmentDocument,
  IWebsiteTag,
} from '../store/data-types';
import { IStore } from '../store/use-store';
import {
  IFeaturedWebsite,
  IWebsiteCache,
  fetchWebsitesForMeetingFiltered,
} from '../website/get-featured-websites';
import { LargeWebsite } from '../website/large-website';

const ExpandPerson = (props: {
  store: IStore;
  personId?: string;
  close?: () => void;
  toggleWebsiteTag: (tag: string, websiteId: string) => Promise<void>;
  websiteTags: IWebsiteTag[];
  websiteCache: IWebsiteCache;
}) => {
  const { slug }: any = useParams();
  const personId = props.personId || decodeURIComponent(slug);
  const [person, setPerson] = useState<IPerson | undefined>(undefined);
  const [segments, setSegments] = useState<ISegment[]>([]);
  const [upcomingSegments, setUpcomingSegments] = useState<ISegment[]>([]);
  const [websites, setWebsites] = useState<IFeaturedWebsite[]>([]);
  const [associates, setAssociates] = useState<IFormattedAttendee[]>([]);
  const [associatesStats, setAssociatesStats] = useState<any>({});
  const [segmentDocuments, setSegmentDocuments] = useState<ISegmentDocument[]>([]);

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

        const websitesForMeetings = await Promise.all(
          filteredSegments.map(async (meeting) => {
            if (meeting) {
              const result = await fetchWebsitesForMeetingFiltered(meeting, props.store, false, 4);
              return result;
            }
            return [];
          }),
        );

        const flattenedWebsites = orderByCount(
          flatten(websitesForMeetings).filter(Boolean),
          'websiteId',
          'date',
        );
        setWebsites(flattenedWebsites);

        const segmentDocumentsFromPersonEdits =
          await props.store.segmentDocumentStore.getAllForPersonId(personId);
        setSegmentDocuments(segmentDocumentsFromPersonEdits);
      }
    };
    void fetchData();
  }, [props.store.isLoading, personId]);

  if (!person) {
    return null;
  }
  const emailAddress = person.emailAddresses[0];
  const meetingsYouBothAttended = segments.filter((s) => s.end < new Date());
  return (
    <Row>
      <Box display="flex" className={classes.topContainer} justifyContent="space-between">
        <Box>
          <Box display="flex" alignItems="center" gap={3}>
            <Box>
              <Avatar
                alt={`Profile photo for ${person.name || person.emailAddresses[0] || undefined}`}
                className={classes.avatar}
                src={person.imageUrl || ''}
              >
                {(person.name || person.id)[0]}
              </Avatar>
            </Box>
            <Box>
              <Typography variant="h2" color="textPrimary" gutterBottom>
                {person.name}
              </Typography>
              {emailAddress && (
                <Typography variant="body2">
                  {emailAddress}{' '}
                  <Link
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigator.clipboard.writeText(emailAddress)}
                  >
                    copy
                  </Link>
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
        {emailAddress && (
          <Box>
            <div style={{ maxWidth: 210, margin: '10px auto 0 ' }}>
              <Button
                href={`mailto:${emailAddress}`}
                variant="outlined"
                disableElevation
                color="primary"
                className={classes.button}
                startIcon={
                  <EmailIcon
                    width={config.ICON_SIZE}
                    height={config.ICON_SIZE}
                    className={classes.iconPrimary}
                  />
                }
              >
                Email Contact
              </Button>
            </div>
          </Box>
        )}
      </Box>
      <div className={classes.container}>
        {websites.length > 0 && (
          <div className={classes.section} id="websites">
            <Typography variant="h3" className={classes.rowText}>
              Associated websites
            </Typography>
            <Box sx={{ flexGrow: 1 }}>
              <Grid container columns={3} spacing={2}>
                {websites.map((item) => (
                  <Grid size={1}>
                    <LargeWebsite
                      item={item}
                      store={props.store}
                      websiteTags={props.websiteTags}
                      toggleWebsiteTag={props.toggleWebsiteTag}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          </div>
        )}
        {segmentDocuments.length > 0 && (
          <div className={classes.section}>
            <Typography variant="h3" className={classes.rowText}>
              Documents they edited recently
            </Typography>
            <SegmentDocumentList
              segmentDocuments={segmentDocuments}
              store={props.store}
              isSmall={true}
            />
          </div>
        )}
        {associates.length > 0 && (
          <div className={classes.section} id="people">
            <Typography variant="h3" className={classes.rowText}>
              Associates
            </Typography>
            <AttendeeList
              personStore={props.store.personDataStore}
              attendees={associates}
              attendeeMeetingCount={associatesStats}
              showAll={true}
              isSmall={true}
            />
          </div>
        )}
        {upcomingSegments.length > 0 && (
          <div className={classes.section}>
            <Typography variant="h3" className={classes.rowText}>
              Upcoming Meetings
            </Typography>
            <MeetingList
              segments={upcomingSegments}
              store={props.store}
              websiteTags={props.websiteTags}
              toggleWebsiteTag={props.toggleWebsiteTag}
              websiteCache={props.websiteCache}
            />
          </div>
        )}
        {meetingsYouBothAttended.length > 0 && (
          <div className={classes.section} id="meetings">
            <Typography variant="h3" className={classes.rowText}>
              Meetings you both attended
            </Typography>
            <MeetingList
              segments={meetingsYouBothAttended}
              store={props.store}
              websiteTags={props.websiteTags}
              toggleWebsiteTag={props.toggleWebsiteTag}
              websiteCache={props.websiteCache}
            />
          </div>
        )}
      </div>
    </Row>
  );
};

export default ExpandPerson;
