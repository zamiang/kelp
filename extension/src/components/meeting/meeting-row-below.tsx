import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
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

const PREFIX = 'MeetingRowBelow';

const classes = {
  section: `${PREFIX}-section`,
  title: `${PREFIX}-title`,
  topSection: `${PREFIX}-topSection`,
  icon: `${PREFIX}-icon`,
};

const StyledBox = styled(Box)(({ theme }) => ({
  [`& .${classes.section}`]: {
    marginTop: theme.spacing(4),
  },
  [`& .${classes.icon}`]: {
    color: theme.palette.text.primary,
  },
  [`& .${classes.title}`]: {
    color: theme.palette.text.primary,
    fontSize: theme.typography.h3.fontSize,
  },
  [`& .${classes.topSection}`]: {
    marginBottom: theme.spacing(1),
    position: 'relative',
    zIndex: 5,
  },
}));

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
    <StyledBox flex={props.isFullWidth ? '1' : '0 0 91.67%'}>
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
            className={classes.icon}
          />{' '}
        </IconButton>
      )}
      {props.meetingTags.map((t) => (
        <div className={classes.section} key={t.id}>
          <div className={classes.topSection}>
            <Typography className={classes.title}>{t.tag}</Typography>
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
    </StyledBox>
  );
};

export default MeetingRowBelow;
