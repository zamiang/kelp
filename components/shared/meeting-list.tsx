import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import clsx from 'clsx';
import { format } from 'date-fns';
import { uniqBy } from 'lodash';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../../constants/config';
import CalendarIcon from '../../public/icons/calendar.svg';
import { FeaturedMeeting } from '../meeting/featured-meeting';
import { Row, classes } from '../shared/row-styles';
import { ISegment, IWebsiteTag } from '../store/data-types';
import PersonDataStore from '../store/models/person-model';
import { IStore } from '../store/use-store';
import { IWebsiteCache } from '../website/get-featured-websites';

export const Meeting = (props: {
  meeting: ISegment;
  personStore: PersonDataStore;
  info?: string;
  isSmall?: boolean;
  websiteCache: IWebsiteCache;
}) => {
  const navigate = useNavigate();
  const opacity = props.meeting.start > new Date() ? 0.5 : 0.3;
  return (
    <Row>
      <Button
        onClick={() => navigate(`/meetings/${props.meeting.id}`)}
        className={clsx(classes.row, props.isSmall && classes.rowSmall)}
      >
        <Grid container wrap="nowrap" alignItems="center">
          <Grid item className={classes.rowLeft}>
            <CalendarIcon
              width={config.ICON_SIZE}
              height={config.ICON_SIZE}
              style={{ display: 'block', margin: '0 auto', opacity }}
            />
          </Grid>
          <Grid item zeroMinWidth xs>
            <Grid
              container
              justifyContent="space-between"
              alignItems="center"
              className={classes.rowTopPadding}
            >
              <Grid item xs={12}>
                <Typography noWrap>{props.meeting.summary || '(No title)'}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" noWrap>
                  {format(props.meeting.start, 'EEEE, MMMM d')} ⋅ {format(props.meeting.start, 'p')}{' '}
                  – {format(props.meeting.end, 'p')}
                </Typography>
              </Grid>
              {props.info && (
                <Grid item xs={12}>
                  <Typography variant="body2" noWrap>
                    {props.info}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>
      </Button>
    </Row>
  );
};

/**
 * Intended to be used with the 'expand' views for each entity type
 */
const MeetingList = (props: {
  segments: (ISegment | undefined)[];
  store: IStore;
  isDarkMode: boolean;
  toggleWebsiteTag: (tag: string, websiteId: string) => Promise<void>;
  websiteTags: IWebsiteTag[];
  websiteCache: IWebsiteCache;
}) => {
  if (props.segments.length < 1) {
    return <Typography variant="caption">None</Typography>;
  }

  const sortedSegments = uniqBy(
    props.segments.filter((item) => !!item).sort((a, b) => (a!.start < b!.start ? -1 : 1)),
    'id',
  );
  return (
    <div>
      {sortedSegments.map(
        (segment) =>
          segment && (
            <FeaturedMeeting
              key={segment.id}
              meeting={segment}
              store={props.store}
              showLine
              isDarkMode={props.isDarkMode}
              websiteTags={props.websiteTags}
              toggleWebsiteTag={props.toggleWebsiteTag}
              websiteCache={props.websiteCache}
            />
          ),
      )}
    </div>
  );
};

export default MeetingList;
