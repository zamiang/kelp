import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import MuiLink from '@mui/material/Link';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import useTheme from '@mui/styles/useTheme';
import clsx from 'clsx';
import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';
import Linkify from 'react-linkify';
import { useParams } from 'react-router-dom';
import config from '../../constants/config';
import EmailIcon from '../../public/icons/email.svg';
import PlusIcon from '../../public/icons/plus.svg';
import SaveIcon from '../../public/icons/save.svg';
import VideoIcon from '../../public/icons/video.svg';
import AttendeeList from '../shared/attendee-list';
import { Row, classes } from '../shared/row-styles';
import {
  IFormattedAttendee,
  ISegment,
  ISegmentTag,
  IWebsiteItem,
  IWebsiteTag,
} from '../store/data-types';
import { IStore } from '../store/use-store';
import { AddTagToMeetingDialog } from '../website/add-tag-to-meeting-dialog';
import {
  IFeaturedWebsite,
  IWebsiteCache,
  getWebsitesForMeeting,
} from '../website/get-featured-websites';
import { LargeWebsite } from '../website/large-website';
import { WebsiteHighlights } from '../website/website-highlights';
import { isSegmentTagSelected } from './featured-meeting';

const maxNumberOfWebsites = 6;

const EmailGuestsButton = (props: {
  meeting: ISegment;
  websites: IFeaturedWebsite[];
  websiteStore: IStore['websiteStore'];
}) => {
  const [websites, setWebsites] = useState<(IWebsiteItem | undefined)[]>([]);
  const websiteIds = props.websites.map((w) => w.id);

  useEffect(() => {
    const fetchData = async () => {
      const w = await Promise.all(websiteIds.map(async (id) => props.websiteStore.getById(id)));
      setWebsites(w);
    };
    void fetchData();
  }, [websiteIds.join('')]);

  const bodyText = `Hello, %0D%0A%0D%0A${websites
    .map((d) => `${d?.title} - ${d?.id}%0D%0A`)
    .join(' ')}%0D%0A%0D%0AThanks,%0D%0A%0D%0AEmail generated by http://www.kelp.nyc `;
  const link = `mailto:${props.meeting.attendees.map((a) => a.email).join(',')}?subject=${
    props.meeting.summary
  }&body=${bodyText}`;

  return (
    <Button
      onClick={() => window.open(link)}
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
      Email Guests
    </Button>
  );
};

const ExpandedMeeting = (props: {
  store: IStore;
  meetingId?: string;
  close?: () => void;
  hideHeader?: boolean;
  toggleWebsiteTag: (tag: string, websiteId: string) => Promise<void>;
  websiteTags: IWebsiteTag[];
  websiteCache: IWebsiteCache;
}) => {
  const { slug }: any = useParams();
  const meetingId = props.meetingId || slug;
  const [meeting, setMeeting] = useState<ISegment | undefined>(undefined);
  const [attendees, setAttendees] = useState<IFormattedAttendee[]>([]);
  const [currentTag, setTag] = useState<string>('all');
  const [websites, setWebsites] = useState<IFeaturedWebsite[]>([]);
  const [segmentTags, setSegmentTags] = useState<ISegmentTag[]>([]);
  const [isAddTagsVisible, setAddTagsVisible] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery((theme as any).breakpoints.down('lg'), {
    defaultMatches: true,
  });

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

  useEffect(() => {
    const fetchData = async () => {
      const result = await props.store.segmentTagStore.getAll();
      setSegmentTags(result);
    };
    void fetchData();
  }, [props.store.isLoading, props.meetingId]);

  const meetingSummary = meeting?.summary?.toLocaleLowerCase() || '';
  const relevantTags = segmentTags.filter((t) => {
    const isTextTheSame =
      (t.segmentSummary || '').length > 1 &&
      meetingSummary.length > 1 &&
      t.segmentSummary === meetingSummary;
    const isIdTheSame = t.segmentId === meeting?.id;
    return isIdTheSame || isTextTheSame;
  });

  const toggleMeetingTag = (tag: string, meetingId: string, meetingSummary: string) => {
    const updateData = async () => {
      if (isSegmentTagSelected(meetingId, tag, segmentTags)) {
        await props.store.segmentTagStore.deleteAllForTag(tag);
      } else {
        await props.store.segmentTagStore.create(tag, meetingId, meetingSummary);
      }
      const result = await props.store.segmentTagStore.getAll();
      setSegmentTags(result);
    };
    void updateData();
  };

  if (!meeting) {
    return null;
  }
  const shouldShowMeetingLink = !!meeting.videoLink;
  const hasAttendees = attendees.length > 0;
  const hasDescription = meeting.description && meeting.description.length > 0;

  const isHtml = meeting.description && /<\/?[a-z][\s\S]*>/i.test(meeting.description);

  const hasMeetingNotes = !!meeting.meetingNotesLink;
  const meetingDescriptionIsMicrosoftHtml =
    isHtml && meeting.description?.includes('<span itemscope');
  const hasWebsites = websites.length > 0 || relevantTags.length > 0;
  return (
    <Row>
      <AddTagToMeetingDialog
        meeting={meeting}
        userTags={props.websiteTags}
        isOpen={isAddTagsVisible}
        store={props.store}
        meetingTags={segmentTags}
        toggleMeetingTag={toggleMeetingTag}
        close={() => setAddTagsVisible(false)}
      />
      <Grid
        container
        className={classes.topContainer}
        justifyContent="space-between"
        alignItems="center"
      >
        <Grid item xs={6}>
          <Typography variant="h2" gutterBottom>
            {meeting.summary || '(no title)'}
          </Typography>
          <Typography variant="body2">
            {format(meeting.start, 'EEEE, MMMM d')} ⋅ {format(meeting.start, 'p')} –{' '}
            {format(meeting.end, 'p')}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Grid container spacing={2} alignItems="center" justifyContent="flex-end">
            {hasMeetingNotes && (
              <Grid item>
                <Tooltip title="Open meeting notes">
                  <IconButton
                    color="primary"
                    onClick={() => window.open(meeting.meetingNotesLink, '_blank')}
                    className={classes.iconButton}
                    size="large"
                  >
                    <SaveIcon
                      width={config.ICON_SIZE}
                      height={config.ICON_SIZE}
                      className={classes.iconPrimary}
                    />
                  </IconButton>
                </Tooltip>
              </Grid>
            )}
            <Grid item>
              <Button
                onClick={() => setAddTagsVisible(true)}
                variant="outlined"
                disableElevation
                color="primary"
                startIcon={
                  <PlusIcon
                    width={config.ICON_SIZE}
                    height={config.ICON_SIZE}
                    className={classes.iconPrimary}
                  />
                }
                className={classes.button}
              >
                Add Tags
              </Button>
            </Grid>
            <Grid item>
              <EmailGuestsButton
                meeting={meeting}
                websites={websites}
                websiteStore={props.store.websiteStore}
              />
            </Grid>
            {shouldShowMeetingLink && (
              <Grid item>
                <Button
                  onClick={() => window.open(meeting.videoLink, '_blank')}
                  variant="contained"
                  disableElevation
                  color="primary"
                  startIcon={
                    <VideoIcon
                      width={config.ICON_SIZE}
                      height={config.ICON_SIZE}
                      className={classes.iconPrimary}
                    />
                  }
                  className={classes.button}
                >
                  Join
                </Button>
              </Grid>
            )}
          </Grid>
        </Grid>
      </Grid>
      <div className={classes.container}>
        {hasWebsites && (
          <div className={classes.section} id="websites">
            <Grid container alignItems="center" spacing={2}>
              <Grid item>
                <Typography variant="h3" className={classes.rowText}>
                  Filter by:
                </Typography>
              </Grid>
              <Grid item>
                <Typography
                  variant="h3"
                  className={clsx(classes.tag, currentTag === 'all' && classes.tagSelected)}
                  onClick={() => setTag('all')}
                >
                  All
                </Typography>
              </Grid>
              {relevantTags.map((t) => (
                <Grid item key={t.tag}>
                  <Typography
                    variant="h3"
                    className={clsx(classes.tag, currentTag === t.tag && classes.tagSelected)}
                    onClick={() => setTag(t.tag)}
                  >
                    {t.tag}
                  </Typography>
                </Grid>
              ))}
            </Grid>
            <br />
            {currentTag === 'all' && (
              <Grid container spacing={isMobile ? 5 : 6}>
                {websites.map((item) => (
                  <Grid item xs={3} key={item.id}>
                    <LargeWebsite
                      item={item}
                      store={props.store}
                      websiteTags={props.websiteTags}
                      toggleWebsiteTag={props.toggleWebsiteTag}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
            {currentTag !== 'all' && (
              <WebsiteHighlights
                store={props.store}
                websiteTags={props.websiteTags}
                toggleWebsiteTag={props.toggleWebsiteTag}
                filterByTag={currentTag}
                websiteCache={props.websiteCache}
              />
            )}
          </div>
        )}
        {hasDescription && !isHtml && (
          <div className={classes.section}>
            <Typography variant="h3" className={classes.rowText}>
              Description
            </Typography>
            <Typography className={classes.description}>
              <Linkify>{meeting.description?.trim()}</Linkify>
            </Typography>
          </div>
        )}
        {hasDescription && isHtml && (
          <div className={classes.section}>
            <Typography variant="h3" className={classes.rowText}>
              Description
            </Typography>
            <Typography
              className={clsx(
                classes.description,
                meetingDescriptionIsMicrosoftHtml && classes.descriptionMicrosoft,
              )}
              dangerouslySetInnerHTML={{ __html: meeting.description.trim() }}
            />
          </div>
        )}
        {hasAttendees && (
          <div className={classes.section} id="people">
            <Typography variant="h3" className={classes.rowText}>
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
            <Typography variant="h3" className={classes.rowText}>
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
    </Row>
  );
};

export default ExpandedMeeting;
