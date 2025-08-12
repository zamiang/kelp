import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import clsx from 'clsx';
import { format, formatDistanceToNow, subMinutes } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../../../../constants/config';
import PlusIcon from '../../../../public/icons/plus.svg';
import VideoIcon from '../../../../public/icons/video.svg';
import { ISegment, ISegmentTag, IWebsiteTag } from '../store/data-types';
import { IStore } from '../store/use-store';
import { AddTagToMeetingDialog } from '../website/add-tag-to-meeting-dialog';
import { IWebsiteCache } from '../website/get-featured-websites';
import MeetingRowBelow from './meeting-row-below';

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
    <div className="featured-meeting-root">
      <div
        className={clsx(
          !props.showLine && 'featured-meeting-container',
          !isHappeningSoon && 'featured-meeting-container-now',
          props.showLine && 'featured-meeting-container-line',
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
        <div className="featured-meeting-main-content">
          <div>
            <div className="featured-meeting-dot-container">
              <div
                className={clsx(
                  'featured-meeting-outer-dot',
                  !isHappeningSoon && 'featured-meeting-dot-now',
                )}
              ></div>
              <div
                className={clsx(
                  'featured-meeting-inner-dot',
                  !isHappeningSoon && 'featured-meeting-dot-now',
                )}
              ></div>
            </div>
          </div>
          <div className="featured-meeting-content-section">
            {isHappeningNow && (
              <Typography className="featured-meeting-time-words">Happening Now</Typography>
            )}
            {isFuture && (
              <Typography className="featured-meeting-time-words">
                In {formatDistanceToNow(props.meeting.start)}
              </Typography>
            )}
            {isPast && (
              <Typography className="featured-meeting-time-words">
                {format(props.meeting.start, 'EEEE, MMMM d')} at {format(props.meeting.start, 'p')}
              </Typography>
            )}
            <Typography
              className="featured-meeting-heading"
              onClick={() => {
                void navigate(`/meetings/${props.meeting.id}`);
                return false;
              }}
            >
              {props.meeting.summary || '(no title)'}
            </Typography>
          </div>
          <div className="featured-meeting-actions">
            <Button
              onClick={() => setAddTagsVisible(true)}
              variant="outlined"
              disableElevation
              color="primary"
              startIcon={
                <PlusIcon
                  width={config.ICON_SIZE}
                  height={config.ICON_SIZE}
                  className="featured-meeting-icon-primary"
                />
              }
              className="featured-meeting-button"
            >
              Add Tags
            </Button>
            {domain && isHappeningSoon && (
              <Button
                className="featured-meeting-button featured-meeting-button-contained"
                variant="contained"
                startIcon={
                  <VideoIcon
                    width={config.ICON_SIZE}
                    height={config.ICON_SIZE}
                    className="featured-meeting-icon-text"
                  />
                }
                onClick={() => window.open(props.meeting.videoLink, '_blank')}
              >
                Join
              </Button>
            )}
          </div>
        </div>
        <div className="featured-meeting-below-content">
          {props.showLine && (
            <div className="featured-meeting-line-section">
              <div className="featured-meeting-line-container">
                <div className="featured-meeting-line-spacer">
                  <div className="featured-meeting-left-line"></div>
                </div>
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
              </div>
            </div>
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
        </div>
      </div>
    </div>
  );
};
