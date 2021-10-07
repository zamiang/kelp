import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import useTheme from '@mui/styles/useTheme';
import { flatten } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AttendeeList from '../shared/attendee-list';
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
import { getAssociates } from '../store/helpers';
import { IStore } from '../store/use-store';
import {
  IFeaturedWebsite,
  fetchWebsitesForMeetingFiltered,
} from '../website/get-featured-websites';
import { LargeWebsite } from '../website/large-website';

const ExpandPerson = (props: {
  store: IStore;
  personId?: string;
  close?: () => void;
  toggleWebsiteTag: (tag: string, websiteId: string) => Promise<void>;
  showWebsitePopup: (item: IFeaturedWebsite) => void;
  websiteTags: IWebsiteTag[];
  isDarkMode: boolean;
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

  const theme = useTheme();
  const isMobile = useMediaQuery((theme as any).breakpoints.down('lg'), {
    defaultMatches: true,
  });

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
      <Grid container className={classes.topContainer} justifyContent="space-between">
        <Grid item>
          <Grid container alignItems="center" spacing={3}>
            <Grid item>
              <Avatar
                alt={`Profile photo for ${person.name || person.emailAddresses[0] || undefined}`}
                className={classes.avatar}
                src={person.imageUrl || ''}
              >
                {(person.name || person.id)[0]}
              </Avatar>
            </Grid>
            <Grid item>
              <Typography variant="h3" color="textPrimary" gutterBottom>
                {person.name}
              </Typography>
              {emailAddress && (
                <Typography variant="h5">
                  {emailAddress}{' '}
                  <Link
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigator.clipboard.writeText(emailAddress)}
                  >
                    copy
                  </Link>
                </Typography>
              )}
            </Grid>
          </Grid>
        </Grid>
        {emailAddress && (
          <Grid item>
            <div style={{ maxWidth: 210, margin: '10px auto 0 ' }}>
              <Button
                className={classes.button}
                variant="contained"
                color="primary"
                href={`mailto:${emailAddress}`}
                target="_blank"
              >
                Email Contact
              </Button>
            </div>
          </Grid>
        )}
      </Grid>
      <Grid container className={classes.buttonSecton} spacing={2}>
        {websites.length > 0 && (
          <Grid item>
            <Typography
              onClick={() =>
                document.getElementById('websites')?.scrollIntoView({ behavior: 'smooth' })
              }
              className={classes.greyButton}
            >
              Websites
            </Typography>
          </Grid>
        )}
        {associates.length > 0 && (
          <Grid item>
            <Typography
              onClick={() =>
                document.getElementById('people')?.scrollIntoView({ behavior: 'smooth' })
              }
              className={classes.greyButton}
            >
              People
            </Typography>
          </Grid>
        )}
        {segments.length > 0 && (
          <Grid item>
            <Typography
              onClick={() =>
                document.getElementById('meetings')?.scrollIntoView({ behavior: 'smooth' })
              }
              className={classes.greyButton}
            >
              Meetings
            </Typography>
          </Grid>
        )}
      </Grid>
      <div className={classes.container}>
        {websites.length > 0 && (
          <div className={classes.section} id="websites">
            <Typography variant="h6" className={classes.rowText}>
              Associated websites
            </Typography>
            <Grid container spacing={isMobile ? 5 : 6}>
              {websites.map((item) => (
                <Grid item xs={3} key={item.websiteId}>
                  <LargeWebsite
                    item={item}
                    store={props.store}
                    isDarkMode={props.isDarkMode}
                    websiteTags={props.websiteTags}
                    toggleWebsiteTag={props.toggleWebsiteTag}
                    showWebsitePopup={props.showWebsitePopup}
                  />
                </Grid>
              ))}
            </Grid>
          </div>
        )}
        {segmentDocuments.length > 0 && (
          <div className={classes.section}>
            <Typography variant="h6" className={classes.rowText}>
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
            <Typography variant="h6" className={classes.rowText}>
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
            <Typography variant="h6" className={classes.rowText}>
              Upcoming Meetings
            </Typography>
            <MeetingList
              segments={upcomingSegments}
              store={props.store}
              isDarkMode={props.isDarkMode}
              websiteTags={props.websiteTags}
              toggleWebsiteTag={props.toggleWebsiteTag}
              showWebsitePopup={props.showWebsitePopup}
            />
          </div>
        )}
        {meetingsYouBothAttended.length > 0 && (
          <div className={classes.section} id="meetings">
            <Typography variant="h6" className={classes.rowText}>
              Meetings you both attended
            </Typography>
            <MeetingList
              segments={meetingsYouBothAttended}
              store={props.store}
              isDarkMode={props.isDarkMode}
              websiteTags={props.websiteTags}
              toggleWebsiteTag={props.toggleWebsiteTag}
              showWebsitePopup={props.showWebsitePopup}
            />
          </div>
        )}
      </div>
    </Row>
  );
};

export default ExpandPerson;
