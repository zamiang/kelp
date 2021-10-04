import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import { format, formatDistanceToNow, subMinutes } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import PlusIcon from '../../public/icons/plus-orange.svg';
import VideoIconWhite from '../../public/icons/video-white.svg';
import useButtonStyles from '../shared/button-styles';
import { ISegment, ISegmentTag, IWebsiteTag } from '../store/data-types';
import { IStore } from '../store/use-store';
import { AddTagToMeetingDialog } from '../website/add-tag-to-meeting-dialog';
import { IFeaturedWebsite } from '../website/get-featured-websites';
import MeetingRowBelow from './meeting-row-below';

const useStyles = makeStyles((theme) => ({
  container: {
    padding: theme.spacing(4),
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
    border: `1px solid ${theme.palette.primary.main}`,
    borderRadius: 16,
    marginBottom: theme.spacing(2),
    [theme.breakpoints.down('md')]: {},
  },
  containerLine: {
    paddingTop: theme.spacing(3),
    marginBottom: theme.spacing(2),
  },
  leftLine: {
    width: 1,
    background: theme.palette.divider,
    height: 'calc(100% + 39px)',
    marginTop: -14,
    marginLeft: 26,
  },
  containerNow: {
    borderColor: theme.palette.divider,
  },
  meetingTimeInWords: {
    display: 'inline-block',
    marginBottom: 0,
    color: theme.palette.text.hint,
  },
  heading: {
    color: theme.palette.text.primary,
    fontSize: theme.typography.h3.fontSize,
    cursor: 'pointer',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  button: {
    width: 'auto',
    paddingLeft: 40,
    paddingRight: 40,
  },
  topSpacing: {
    marginTop: theme.spacing(2),
  },
  '@keyframes fadeOut': {
    from: { opacity: 1 },
    '50%': {
      opacity: 0.4,
    },
    to: {
      opacity: 1,
    },
  },
  '@keyframes fadeOut2': {
    from: { opacity: 0.2 },
    '50%': {
      opacity: 0.05,
    },
    to: {
      opacity: 0.2,
    },
  },
  outerDot: {
    width: 40,
    height: 40,
    background: '#FF4500',
    borderRadius: 20,
    animation: '$fadeOut2 5s ease infinite',
  },
  innerDot: {
    width: 12,
    borderRadius: 6,
    height: 12,
    position: 'absolute',
    top: 14,
    left: 14,
    background: '#FF4500',
    animation: '$fadeOut 5s ease infinite',
  },
  dotNow: {
    background: theme.palette.divider,
  },
  dotContainer: {
    position: 'relative',
  },
}));

export const isSegmentTagSelected = (
  segmentId: string,
  tag: string,
  segmentTags: ISegmentTag[],
) => {
  const existingTags = segmentTags.map((t) => t.id);
  return existingTags.includes(`${segmentId}-${tag}`);
};

export const FeaturedMeeting = (props: {
  meeting: ISegment;
  store: IStore;
  showButton?: boolean;
  showLine?: boolean;
  isDarkMode: boolean;
  happeningSoonLimit?: number;
  toggleWebsiteTag: (tag: string, websiteId: string) => Promise<void>;
  showWebsitePopup: (item: IFeaturedWebsite) => void;
  websiteTags: IWebsiteTag[];
}) => {
  const classes = useStyles();
  const buttonClasses = useButtonStyles();
  const router = useHistory();
  const [isAddTagsVisible, setAddTagsVisible] = useState(false);
  const [segmentTags, setSegmentTags] = useState<ISegmentTag[]>([]);

  const toggleMeetingTag = (tag: string, meetingId: string, meetingSummary: string) => {
    let isSubscribed = true;
    const updateData = async () => {
      if (isSegmentTagSelected(meetingId, tag, segmentTags)) {
        await props.store.segmentTagStore.deleteAllForTag(tag);
      } else {
        await props.store.segmentTagStore.create(tag, meetingId, meetingSummary);
      }
      const result = await props.store.segmentTagStore.getAll();
      return isSubscribed && setSegmentTags(result);
    };
    void updateData();
    return () => (isSubscribed = false) as any;
  };

  useEffect(() => {
    let isSubscribed = true;
    const fetchData = async () => {
      const result = await props.store.segmentTagStore.getAll();
      return isSubscribed && setSegmentTags(result);
    };
    void fetchData();
    return () => (isSubscribed = false) as any;
  }, [props.store.isLoading, props.meeting.id]);

  const meetingSummary = props.meeting?.summary?.toLocaleLowerCase() || '';
  const relevantTags = segmentTags.filter((t) => {
    const isTextTheSame =
      (t.segmentSummary || '').length > 1 &&
      (meetingSummary || '').length > 1 &&
      t.segmentSummary === meetingSummary;
    const isIdTheSame = t.segmentId === props.meeting.id;
    return isIdTheSame || isTextTheSame;
  });
  const happeningSoonLimit = props.happeningSoonLimit || 10;

  const isFuture = new Date() < props.meeting.start;
  const isPast = new Date() > props.meeting.end;
  const isHappeningNow = new Date() > props.meeting.start && new Date() < props.meeting.end;
  const isHappeningSoon =
    new Date() > subMinutes(props.meeting.start, happeningSoonLimit) &&
    new Date() < props.meeting.end;

  const domain = props.meeting.videoLink ? new URL(props.meeting.videoLink) : null;
  return (
    <div
      className={clsx(
        !props.showLine && classes.container,
        !isHappeningSoon && classes.containerNow,
        props.showLine && classes.containerLine,
      )}
    >
      <AddTagToMeetingDialog
        meeting={props.meeting}
        userTags={props.websiteTags}
        isOpen={isAddTagsVisible}
        store={props.store}
        meetingTags={segmentTags}
        toggleMeetingTag={toggleMeetingTag}
        close={() => setAddTagsVisible(false)}
      />
      <Grid container alignItems="center" spacing={2}>
        <Grid item>
          <div className={classes.dotContainer}>
            <div className={clsx(classes.outerDot, !isHappeningSoon && classes.dotNow)}></div>
            <div className={clsx(classes.innerDot, !isHappeningSoon && classes.dotNow)}></div>
          </div>
        </Grid>
        <Grid item xs>
          {isHappeningNow && (
            <Typography className={classes.meetingTimeInWords}>Happening Now</Typography>
          )}
          {isFuture && (
            <Typography className={classes.meetingTimeInWords}>
              In {formatDistanceToNow(props.meeting.start)}
            </Typography>
          )}
          {isPast && (
            <Typography className={classes.meetingTimeInWords}>
              {format(props.meeting.start, 'EEEE, MMMM d')} at {format(props.meeting.start, 'p')}
            </Typography>
          )}
          <Typography
            className={classes.heading}
            style={{ cursor: 'pointer' }}
            onClick={() => {
              void router.push(`/meetings/${props.meeting.id}`);
              return false;
            }}
          >
            {props.meeting.summary || '(no title)'}
          </Typography>
        </Grid>
        <Grid item>
          <Button
            onClick={() => setAddTagsVisible(true)}
            variant="outlined"
            disableElevation
            color="primary"
            startIcon={<PlusIcon width="24" height="24" />}
            className={buttonClasses.button}
          >
            Add Tags
          </Button>
        </Grid>
        {domain && isHappeningSoon && (
          <Grid item>
            <Button
              className={clsx(buttonClasses.button, classes.button)}
              variant="contained"
              color={'primary'}
              startIcon={<VideoIconWhite width="24" height="24" />}
              onClick={() => window.open(props.meeting.videoLink, '_blank')}
            >
              Join
            </Button>
          </Grid>
        )}
        {props.showLine && (
          <Grid container style={{ marginTop: 12 }}>
            <Grid item style={{ width: 60, minHeight: 30 }}>
              <div className={classes.leftLine}></div>
            </Grid>
            <MeetingRowBelow
              meeting={props.meeting}
              store={props.store}
              isDarkMode={props.isDarkMode}
              isFullWidth={false}
              websiteTags={props.websiteTags}
              meetingTags={relevantTags}
              toggleWebsiteTag={props.toggleWebsiteTag}
              toggleMeetingTag={toggleMeetingTag}
              showWebsitePopup={props.showWebsitePopup}
            />
          </Grid>
        )}
        {!props.showLine && (
          <MeetingRowBelow
            meeting={props.meeting}
            store={props.store}
            isDarkMode={props.isDarkMode}
            isFullWidth={true}
            websiteTags={props.websiteTags}
            meetingTags={relevantTags}
            toggleWebsiteTag={props.toggleWebsiteTag}
            toggleMeetingTag={toggleMeetingTag}
            showWebsitePopup={props.showWebsitePopup}
          />
        )}
      </Grid>
    </div>
  );
};
