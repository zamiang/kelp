import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import useTheme from '@mui/styles/useTheme';
import React, { useEffect, useState } from 'react';
import config from '../../../../constants/config';
import PlusIcon from '../../../../public/icons/plus.svg';
import { ISegment, ISegmentTag, IWebsiteTag } from '../store/data-types';
import { IStore } from '../store/use-store';
import {
  IFeaturedWebsite,
  IWebsiteCache,
  fetchWebsitesForMeetingFiltered,
} from '../website/get-featured-websites';
import { LargeWebsite } from '../website/large-website';
import { WebsiteHighlights } from '../website/website-highlights';
import '../../styles/components/meeting/meeting-row-below.css';

const MeetingRowBelow = (props: {
  meeting: ISegment;
  store: IStore;
  isFullWidth: boolean;
  websiteTags: IWebsiteTag[];
  meetingTags: ISegmentTag[];
  toggleWebsiteTag: (tag: string, websiteId: string) => Promise<void>;
  toggleMeetingTag: (tag: string, meetingId: string, meetingSummary: string) => void;
  shouldHideShowAll?: boolean;
  websiteCache: IWebsiteCache;
}) => {
  const [websites, setWebsites] = useState<IFeaturedWebsite[]>([]);
  const [shouldShowAll, setShouldShowAll] = useState(false);
  const [extraItemsCount, setExtraItemsCount] = useState(0);

  const theme = useTheme();
  const isLarge = useMediaQuery((theme as any).breakpoints.up('lg'));
  const maxWebsites = isLarge ? 3 : 3;

  useEffect(() => {
    let isSubscribed = true;
    void fetchWebsitesForMeetingFiltered(
      props.meeting,
      props.store,
      shouldShowAll,
      maxWebsites,
      setWebsites,
      setExtraItemsCount,
      isSubscribed,
    );
    return () => (isSubscribed = false) as any;
  }, [props.store.isLoading, props.meeting.id, shouldShowAll, isLarge]);

  if (websites.length < 1 && props.meetingTags.length < 1) {
    return null;
  }

  return (
    <Box
      className={`meeting-row-below-root ${props.isFullWidth ? 'meeting-row-below-full-width' : 'meeting-row-below-constrained'}`}
      flex={props.isFullWidth ? '1' : '0 0 91.67%'}
    >
      <Box sx={{ flexGrow: 1 }}>
        <Grid container columns={3} spacing={2}>
          {websites.map((item) => (
            <Grid size={1} key={item.id}>
              <LargeWebsite
                item={item}
                store={props.store}
                smGridSize={4}
                websiteTags={props.websiteTags}
                toggleWebsiteTag={props.toggleWebsiteTag}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
      {extraItemsCount > 0 && !props.shouldHideShowAll && (
        <IconButton
          onClick={() => {
            setShouldShowAll(!shouldShowAll);
          }}
        >
          <PlusIcon
            width={config.ICON_SIZE}
            height={config.ICON_SIZE}
            className="meeting-row-below-icon"
          />{' '}
        </IconButton>
      )}
      {props.meetingTags.map((t) => (
        <div className="meeting-row-below-section" key={t.id}>
          <div className="meeting-row-below-top-section">
            <Typography className="meeting-row-below-title">{t.tag}</Typography>
          </div>
          <WebsiteHighlights
            store={props.store}
            toggleWebsiteTag={props.toggleWebsiteTag}
            websiteTags={props.websiteTags}
            filterByTag={t.tag}
            websiteCache={props.websiteCache}
          />
        </div>
      ))}
    </Box>
  );
};

export default MeetingRowBelow;
