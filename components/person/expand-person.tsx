import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import { flatten } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AttendeeList from '../shared/attendee-list';
import useButtonStyles from '../shared/button-styles';
import useExpandStyles from '../shared/expand-styles';
import MeetingList from '../shared/meeting-list';
import { orderByCount } from '../shared/order-by-count';
import useRowStyles from '../shared/row-styles';
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
  websiteTags: IWebsiteTag[];
  isDarkMode: boolean;
  hideWebsite: (item: IFeaturedWebsite) => void;
  currentFilter: string;
  hideDialogUrl?: string;
}) => {
  const classes = useExpandStyles();
  const buttonClasses = useButtonStyles();
  const rowStyles = useRowStyles();
  const { slug }: any = useParams();
  const personId = props.personId || decodeURIComponent(slug);
  const [person, setPerson] = useState<IPerson | undefined>(undefined);
  const [segments, setSegments] = useState<ISegment[]>([]);
  const [upcomingSegments, setUpcomingSegments] = useState<ISegment[]>([]);
  const [websites, setWebsites] = useState<IFeaturedWebsite[]>([]);
  const [associates, setAssociates] = useState<IFormattedAttendee[]>([]);
  const [associatesStats, setAssociatesStats] = useState<any>({});
  const [segmentDocuments, setSegmentDocuments] = useState<ISegmentDocument[]>([]);
  // used to refetch websites
  const [pinIncrement, setPinIncrement] = useState(0);

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
              const result = await fetchWebsitesForMeetingFiltered(
                meeting,
                props.store,
                props.currentFilter,
                false,
              );
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
  }, [props.store.isLoading, personId, props.currentFilter, pinIncrement, props.hideDialogUrl]);

  const togglePin = async (item: IFeaturedWebsite, isPinned: boolean) => {
    if (isPinned) {
      await props.store.websitePinStore.delete(item.websiteId);
    } else {
      await props.store.websitePinStore.create(item.websiteId);
    }
    setPinIncrement(pinIncrement + 1);
  };

  if (!person) {
    return null;
  }
  const emailAddress = person.emailAddresses[0];
  const meetingsYouBothAttended = segments.filter((s) => s.end < new Date());
  return (
    <React.Fragment>
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
                className={buttonClasses.button}
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
              className={buttonClasses.greyButton}
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
              className={buttonClasses.greyButton}
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
              className={buttonClasses.greyButton}
            >
              Meetings
            </Typography>
          </Grid>
        )}
      </Grid>
      <div className={classes.container}>
        {websites.length > 0 && (
          <div className={classes.section} id="websites">
            <Typography variant="h6" className={rowStyles.rowText}>
              Associated websites
            </Typography>
            <Grid container spacing={4}>
              {websites.map((item) => (
                <LargeWebsite
                  key={item.websiteId}
                  item={item}
                  store={props.store}
                  hideItem={props.hideWebsite}
                  isDarkMode={props.isDarkMode}
                  togglePin={togglePin}
                  websiteTags={props.websiteTags}
                  toggleWebsiteTag={props.toggleWebsiteTag}
                />
              ))}
            </Grid>
          </div>
        )}
        {segmentDocuments.length > 0 && (
          <div className={classes.section}>
            <Typography variant="h6" className={rowStyles.rowText}>
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
            <Typography variant="h6" className={rowStyles.rowText}>
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
            <Typography variant="h6" className={rowStyles.rowText}>
              Upcoming Meetings
            </Typography>
            <MeetingList
              segments={upcomingSegments}
              store={props.store}
              isDarkMode={props.isDarkMode}
              currentFilter={props.currentFilter}
              hideWebsite={props.hideWebsite}
              websiteTags={props.websiteTags}
              toggleWebsiteTag={props.toggleWebsiteTag}
            />
          </div>
        )}
        {meetingsYouBothAttended.length > 0 && (
          <div className={classes.section} id="meetings">
            <Typography variant="h6" className={rowStyles.rowText}>
              Meetings you both attended
            </Typography>
            <MeetingList
              segments={meetingsYouBothAttended}
              store={props.store}
              isDarkMode={props.isDarkMode}
              currentFilter={props.currentFilter}
              hideWebsite={props.hideWebsite}
              websiteTags={props.websiteTags}
              toggleWebsiteTag={props.toggleWebsiteTag}
            />
          </div>
        )}
      </div>
    </React.Fragment>
  );
};

export default ExpandPerson;
