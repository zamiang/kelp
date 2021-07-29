import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import MuiLink from '@material-ui/core/Link';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import clsx from 'clsx';
import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';
import Linkify from 'react-linkify';
import { useParams } from 'react-router-dom';
import EmailIcon from '../../public/icons/email-orange.svg';
import PlusIcon from '../../public/icons/plus-orange.svg';
import SaveIcon from '../../public/icons/save-orange.svg';
import VideoIcon from '../../public/icons/video-white.svg';
import AttendeeList from '../shared/attendee-list';
import useButtonStyles from '../shared/button-styles';
import useExpandStyles from '../shared/expand-styles';
import useRowStyles from '../shared/row-styles';
import { IFormattedAttendee, ISegment, IWebsite } from '../store/data-types';
import { IStore } from '../store/use-store';
import { IFeaturedWebsite, getWebsitesForMeeting } from '../website/get-featured-websites';
import { LargeWebsite } from '../website/large-website';
import { createMeetingNotes } from './create-meeting-notes';

const maxNumberOfWebsites = 6;

const EmailGuestsButton = (props: {
  meeting: ISegment;
  websites: IFeaturedWebsite[];
  websiteStore: IStore['websitesStore'];
}) => {
  const buttonClasses = useButtonStyles();

  const [websites, setWebsites] = useState<(IWebsite | undefined)[]>([]);
  const websiteIds = props.websites.map((w) => w.websiteId);

  useEffect(() => {
    const fetchData = async () => {
      const w = await Promise.all(websiteIds.map(async (id) => props.websiteStore.getById(id)));
      setWebsites(w);
    };
    void fetchData();
  }, [websiteIds.join('')]);

  const bodyText = `Hello, %0D%0A%0D%0A${websites
    .map((d) => `${d?.title} - ${d?.url}%0D%0A`)
    .join(' ')}%0D%0A%0D%0AThanks,%0D%0A%0D%0AEmail generated by http://www.kelp.nyc `;
  const link = `mailto:${props.meeting.attendees.map((a) => a.email).join(',')}?subject=${
    props.meeting.summary
  }&body=${bodyText}`;

  return (
    <Tooltip title="Email guests">
      <IconButton
        onClick={() => window.open(link)}
        color="primary"
        className={buttonClasses.iconButton}
      >
        <EmailIcon width="24" height="24" />
      </IconButton>
    </Tooltip>
  );
};

const createSmartMeetingNotes = (
  meeting: ISegment,
  store: IStore,
  websites: IFeaturedWebsite[],
  setMeetingNotesLoading: (isLoading: boolean) => void,
) =>
  createMeetingNotes(
    meeting,
    websites,
    setMeetingNotesLoading,
    store.personDataStore,
    store.websitesStore,
    store.attendeeDataStore,
    store.refetch,
    store.scope!,
    store.googleOauthToken!,
  );

const ExpandedMeeting = (props: {
  store: IStore;
  meetingId?: string;
  close?: () => void;
  isDarkMode: boolean;
  hideHeader?: boolean;
}) => {
  const classes = useExpandStyles();
  const buttonClasses = useButtonStyles();
  const rowStyles = useRowStyles();
  const { slug }: any = useParams();
  const meetingId = props.meetingId || slug;
  const [isMeetingNotesLoading, setMeetingNotesLoading] = useState<boolean>(false);
  const [meeting, setMeeting] = useState<ISegment | undefined>(undefined);
  const [attendees, setAttendees] = useState<IFormattedAttendee[]>([]);
  const [websites, setWebsites] = useState<IFeaturedWebsite[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (meetingId) {
        const result = await props.store.timeDataStore.getById(meetingId);
        setMeeting(result);
      }
    };
    void fetchData();
  }, [props.store.isLoading, meetingId]);

  useEffect(() => {
    const fetchData = async () => {
      if (meetingId) {
        const result = await props.store.attendeeDataStore.getAllForSegmentId(meetingId);
        setAttendees(result);
      }
    };
    void fetchData();
  }, [props.store.isLoading, meetingId]);

  useEffect(() => {
    const fetchData = async () => {
      if (meeting) {
        const result = await getWebsitesForMeeting(meeting, props.store);
        setWebsites(result.slice(0, maxNumberOfWebsites));
      }
    };
    void fetchData();
  }, [props.store.isLoading, meeting?.id]);

  if (!meeting) {
    return null;
  }

  const videoLinkDomain = meeting.videoLink ? new URL(meeting.videoLink).hostname : undefined;
  const shouldShowMeetingLink = !!meeting.videoLink;
  const hasAttendees = attendees.length > 0;
  const hasDescription = meeting.description && meeting.description.length > 0;

  const isHtml = meeting.description && /<\/?[a-z][\s\S]*>/i.test(meeting.description);

  const hasMeetingNotes = !!meeting.meetingNotesLink;
  const meetingDescriptionIsMicrosoftHtml =
    isHtml && meeting.description?.includes('<span itemscope');
  const hasWebsites = websites.length > 0;
  return (
    <React.Fragment>
      <Grid
        container
        className={classes.topContainer}
        justifyContent="space-between"
        alignItems="center"
      >
        <Grid item>
          <Typography variant="h3" gutterBottom>
            {meeting.summary || '(no title)'}
          </Typography>
          <Typography variant="h5">
            {format(meeting.start, 'EEEE, MMMM d')} ⋅ {format(meeting.start, 'p')} –{' '}
            {format(meeting.end, 'p')}
          </Typography>
        </Grid>
        <Grid item>
          <Grid container spacing={2}>
            {!hasMeetingNotes && (
              <Grid item>
                <Tooltip title="Create Smart Meeting notes">
                  <IconButton
                    onClick={() =>
                      createSmartMeetingNotes(
                        meeting,
                        props.store,
                        websites,
                        setMeetingNotesLoading,
                      )
                    }
                    disabled={isMeetingNotesLoading}
                    color="primary"
                    className={buttonClasses.iconButton}
                  >
                    {isMeetingNotesLoading ? (
                      <CircularProgress size={20} />
                    ) : (
                      <PlusIcon width="24" height="24" />
                    )}
                  </IconButton>
                </Tooltip>
              </Grid>
            )}
            {hasMeetingNotes && (
              <Grid item>
                <Tooltip title="Open meeting notes">
                  <IconButton
                    color="primary"
                    onClick={() => window.open(meeting.meetingNotesLink, '_blank')}
                    className={buttonClasses.iconButton}
                  >
                    <SaveIcon width="24" height="24" />
                  </IconButton>
                </Tooltip>
              </Grid>
            )}
            <Grid item>
              <EmailGuestsButton
                meeting={meeting}
                websites={websites}
                websiteStore={props.store.websitesStore}
              />
            </Grid>
            {shouldShowMeetingLink && (
              <Grid item>
                <Button
                  onClick={() => window.open(meeting.videoLink, '_blank')}
                  variant="contained"
                  disableElevation
                  color="primary"
                  startIcon={<VideoIcon width="24" height="24" />}
                  className={buttonClasses.button}
                >
                  Join {videoLinkDomain}
                </Button>
              </Grid>
            )}
          </Grid>
        </Grid>
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
        {attendees.length > 0 && (
          <Grid item>
            <Typography
              onClick={() =>
                document.getElementById('people')?.scrollIntoView({ behavior: 'smooth' })
              }
              className={buttonClasses.greyButton}
            >
              Guests
            </Typography>
          </Grid>
        )}
      </Grid>
      <div className={classes.container}>
        {hasWebsites && (
          <div className={classes.section}>
            <Typography variant="h6" className={rowStyles.rowText}>
              Websites you may need
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
        {hasDescription && !isHtml && (
          <div className={classes.section}>
            <Typography variant="h6" className={rowStyles.rowText}>
              Description
            </Typography>
            <Typography className={classes.description}>
              <Linkify>{meeting.description?.trim()}</Linkify>
            </Typography>
          </div>
        )}
        {hasDescription && isHtml && (
          <div className={classes.section}>
            <Typography variant="h6" className={rowStyles.rowText}>
              Description
            </Typography>
            <Typography
              className={clsx(
                classes.description,
                meetingDescriptionIsMicrosoftHtml && classes.descriptionMicrosoft,
              )}
              dangerouslySetInnerHTML={{ __html: meeting.description!.trim() }}
            />
          </div>
        )}
        {hasAttendees && (
          <div className={classes.section}>
            <Typography variant="h6" className={rowStyles.rowText}>
              Guests
            </Typography>
            <AttendeeList
              personStore={props.store.personDataStore}
              attendees={attendees}
              showAll={false}
              isSmall={true}
            />
          </div>
        )}
        {meeting.location && (
          <div className={classes.section}>
            <Typography variant="h6" className={rowStyles.rowText}>
              Location
            </Typography>
            <MuiLink
              className={classes.overflowEllipsis}
              href={`https://maps.google.com/?q=${meeting.location}`}
            >
              {meeting.location}
            </MuiLink>
          </div>
        )}
      </div>
    </React.Fragment>
  );
};

export default ExpandedMeeting;
