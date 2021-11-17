import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { keyframes } from '@mui/styled-engine';
import clsx from 'clsx';
import { format, formatDistanceToNow, subMinutes } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../../constants/config';
import PlusIcon from '../../public/icons/plus.svg';
import VideoIcon from '../../public/icons/video.svg';
import { ISegment, ISegmentTag, IWebsiteTag } from '../store/data-types';
import { IStore } from '../store/use-store';
import { AddTagToMeetingDialog } from '../website/add-tag-to-meeting-dialog';
import { IWebsiteCache } from '../website/get-featured-websites';
import MeetingRowBelow from './meeting-row-below';

const PREFIX = 'FeaturedMeeting';

const fadeOut = keyframes`
  from {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
  to {
    opacity: 1;
  }
`;

const fadeOut2 = keyframes`
  from {
    opacity: 0.2;
  }
  50% {
    opacity: 0.05;
  }
  to {
    opacity: 0.2;
  }
`;

const classes = {
  container: `${PREFIX}-container`,
  containerLine: `${PREFIX}-containerLine`,
  leftLine: `${PREFIX}-leftLine`,
  containerNow: `${PREFIX}-containerNow`,
  meetingTimeInWords: `${PREFIX}-meetingTimeInWords`,
  heading: `${PREFIX}-heading`,
  button: `${PREFIX}-button`,
  buttonContained: `${PREFIX}-buttonContained`,
  topSpacing: `${PREFIX}-topSpacing`,
  '@keyframes fadeOut': `${PREFIX}-fadeout`,
  '@keyframes fadeOut2': `${PREFIX}-fadeout2`,
  outerDot: `${PREFIX}-outerDot`,
  innerDot: `${PREFIX}-innerDot`,
  dotNow: `${PREFIX}-dotNow`,
  dotContainer: `${PREFIX}-dotContainer`,
  iconText: `${PREFIX}-iconText`,
  iconPrimary: `${PREFIX}-iconPrimary`,
};

const Root = styled('div')(({ theme }) => ({
  [`& .${classes.container}`]: {
    padding: theme.spacing(4),
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
    border: `1px solid ${theme.palette.primary.main}`,
    borderRadius: theme.shape.borderRadius,
    minHeight: 102,
  },
  [`& .${classes.containerLine}`]: {
    paddingTop: theme.spacing(3),
    marginBottom: theme.spacing(2),
  },
  [`& .${classes.leftLine}`]: {
    width: 1,
    background: theme.palette.divider,
    height: 'calc(100% + 39px)',
    marginTop: -16,
    marginLeft: 19,
  },
  [`& .${classes.containerNow}`]: {
    borderColor: theme.palette.divider,
  },
  [`& .${classes.iconText}`]: {
    color: theme.palette.getContrastText(theme.palette.primary.main),
  },
  [`& .${classes.iconPrimary}`]: {
    borderColor: theme.palette.primary.main,
  },
  [`& .${classes.meetingTimeInWords}`]: {
    display: 'inline-block',
    marginBottom: 0,
    color: theme.palette.text.secondary,
  },
  [`& .${classes.heading}`]: {
    color: theme.palette.text.primary,
    fontSize: theme.typography.h3.fontSize,
    cursor: 'pointer',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  [`& .${classes.button}`]: {
    borderRadius: 30,
    paddingTop: 6,
    paddingBottom: 6,
    transition: 'opacity 0.3s',
    minHeight: 48,
    opacity: 1,
    width: 'auto',
    paddingLeft: 40,
    paddingRight: 40,
    '&:hover': {
      opacity: 0.6,
    },
  },
  [`& .${classes.buttonContained}`]: {
    color: theme.palette.getContrastText(theme.palette.primary.main),
  },
  [`& .${classes.topSpacing}`]: {
    marginTop: theme.spacing(2),
  },
  [`& .${classes.outerDot}`]: {
    width: 40,
    height: 40,
    background: theme.palette.primary.main,
    borderRadius: 20,
    animation: `${fadeOut2} 5s ease infinite`,
  },
  [`& .${classes.innerDot}`]: {
    width: 12,
    borderRadius: 6,
    height: 12,
    position: 'absolute',
    top: 14,
    left: 14,
    background: theme.palette.primary.main,
    animation: `${fadeOut} 5s ease infinite`,
  },
  [`& .${classes.dotNow}`]: {
    background: theme.palette.divider,
  },
  [`& .${classes.dotContainer}`]: {
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
  happeningSoonLimit?: number;
  toggleWebsiteTag: (tag: string, websiteId: string) => Promise<void>;
  websiteTags: IWebsiteTag[];
  websiteCache: IWebsiteCache;
}) => {
  const navigate = useNavigate();
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
    <Root>
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
                void navigate(`/meetings/${props.meeting.id}`);
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
          {domain && isHappeningSoon && (
            <Grid item>
              <Button
                className={clsx(classes.button, classes.buttonContained)}
                variant="contained"
                startIcon={
                  <VideoIcon
                    width={config.ICON_SIZE}
                    height={config.ICON_SIZE}
                    className={classes.iconText}
                  />
                }
                onClick={() => window.open(props.meeting.videoLink, '_blank')}
              >
                Join
              </Button>
            </Grid>
          )}
        </Grid>
        <Grid container alignItems="flex-start" style={{ marginTop: 12 }}>
          {props.showLine && (
            <Grid item xs={12}>
              <Grid container>
                <Grid item style={{ width: 60, minHeight: 30 }}>
                  <div className={classes.leftLine}></div>
                </Grid>
                <MeetingRowBelow
                  meeting={props.meeting}
                  store={props.store}
                  isFullWidth={false}
                  websiteTags={props.websiteTags}
                  meetingTags={relevantTags}
                  toggleWebsiteTag={props.toggleWebsiteTag}
                  toggleMeetingTag={toggleMeetingTag}
                  shouldHideShowAll={true}
                  websiteCache={props.websiteCache}
                />
              </Grid>
            </Grid>
          )}
          {!props.showLine && (
            <MeetingRowBelow
              meeting={props.meeting}
              store={props.store}
              isFullWidth={true}
              websiteTags={props.websiteTags}
              meetingTags={relevantTags}
              toggleWebsiteTag={props.toggleWebsiteTag}
              toggleMeetingTag={toggleMeetingTag}
              shouldHideShowAll={true}
              websiteCache={props.websiteCache}
            />
          )}
        </Grid>
      </div>
    </Root>
  );
};
