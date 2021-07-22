import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import { flatten } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import EmailIcon from '../../public/icons/email-white.svg';
import AttendeeList from '../shared/attendee-list';
import useButtonStyles from '../shared/button-styles';
import useExpandStyles from '../shared/expand-styles';
import MeetingList from '../shared/meeting-list';
import { orderByCount } from '../shared/order-by-count';
import useRowStyles from '../shared/row-styles';
import SegmentDocumentList from '../shared/segment-document-list';
import { IFormattedAttendee, IPerson, ISegment, ISegmentDocument } from '../store/data-types';
import { getAssociates } from '../store/helpers';
import { IStore } from '../store/use-store';
import { IFeaturedWebsite, getWebsitesForMeeting } from '../website/get-featured-websites';
import { LargeWebsite } from '../website/large-website';

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
              const result = await getWebsitesForMeeting(meeting, props.store);
              return result;
            }
            return [];
          }),
        );
        const flattenedWebsites = orderByCount(flatten(websitesForMeetings), 'websiteId', 'date');
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
  return (
    <React.Fragment>
      <Grid container className={classes.topContainer} justifyContent="space-between">
        <Grid item>
          <Grid container alignItems="center" spacing={2}>
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
          <Grid item justifyContent="flex-end">
            <div style={{ maxWidth: 210, margin: '10px auto 0 ' }}>
              <Button
                className={buttonClasses.button}
                variant="contained"
                color="primary"
                href={`mailto:${emailAddress}`}
                target="_blank"
                startIcon={<EmailIcon width="24" height="24" />}
              >
                Email Contact
              </Button>
            </div>
          </Grid>
        )}
      </Grid>
      <div className={classes.container}>
        {websites.length > 0 && (
          <div className={rowStyles.rowHighlight} style={{ margin: 0 }}>
            <Typography variant="h6" className={rowStyles.rowText}>
              Associated websites
            </Typography>
            <Grid container spacing={4}>
              {websites.map((item) => (
                <LargeWebsite
                  key={item.websiteId}
                  item={item}
                  store={props.store}
                  isDarkMode={props.isDarkMode}
                />
              ))}
            </Grid>
          </div>
        )}
        {segmentDocuments.length > 0 && (
          <div className={classes.section}>
            <Typography variant="h6" style={{ marginBottom: 0 }}>
              Documents they edited recently
            </Typography>
            <SegmentDocumentList
              segmentDocuments={segmentDocuments}
              store={props.store}
              isSmall={true}
            />
          </div>
        )}
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
    </React.Fragment>
  );
};

export default ExpandPerson;
