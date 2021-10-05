import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import useTheme from '@mui/styles/useTheme';
import Fuse from 'fuse.js';
import { uniqBy } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { mediumFontFamily } from '../../constants/theme';
import { FeaturedMeeting } from '../meeting/featured-meeting';
import PersonRow from '../person/person-row';
import { IPerson, ISegment, IWebsiteTag } from '../store/data-types';
import { uncommonPunctuation } from '../store/models/tfidf-model';
import SearchIndex, { ISearchItem } from '../store/search-index';
import { IStore } from '../store/use-store';
import { IFeaturedWebsite } from '../website/get-featured-websites';
import { LargeWebsite } from '../website/large-website';

const PREFIX = 'Search';

const classes = {
  boxStyle: `${PREFIX}-boxStyle`,
  heading: `${PREFIX}-heading`,
  lineCalendarContainer: `${PREFIX}-lineCalendarContainer`,
  topNav: `${PREFIX}-topNav`,
  button: `${PREFIX}-button`,
  section: `${PREFIX}-section`,
  rowText: `${PREFIX}-rowText`,
  container: `${PREFIX}-container`,
};

const Root = styled('div')(({ theme }) => ({
  [`& .${classes.boxStyle}`]: {
    background: theme.palette.background.paper,
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  [`& .${classes.rowText}`]: {
    color: '#9D9D99',
    fontWeight: 500,
    fontFamily: mediumFontFamily,
  },
  [`& .${classes.heading}`]: {
    marginLeft: 0,
  },
  [`& .${classes.lineCalendarContainer}`]: {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  [`& .${classes.container}`]: {
    margin: 0,
    width: 'auto',
  },
  [`& .${classes.topNav}`]: {
    position: 'fixed',
    top: 11,
    left: 224,
    zIndex: 12,
    maxWidth: 500,
    [theme.breakpoints.down('xl')]: {
      left: 184,
    },
    [theme.breakpoints.down('xl')]: {
      left: 178,
    },
    [theme.breakpoints.down('lg')]: {
      left: 138,
    },
  },
  [`$ .${classes.section}`]: {
    marginTop: 88,
  },
  [`& .${classes.button}`]: {
    borderRadius: 21,
    background: theme.palette.background.paper,
    padding: 10,
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    cursor: 'pointer',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
}));

// A score of 0 indicates a perfect match, while a score of 1 indicates a complete mismatch.
const minScore = 0.6;

const filterSearchResults = (searchResults: Fuse.FuseResult<ISearchItem>[]) => {
  const people: ISearchItem[] = [];
  const meetings: ISearchItem[] = [];
  const websites: ISearchItem[] = [];
  searchResults.forEach((searchResult) => {
    const result = searchResult.item;
    if (!searchResult.score || searchResult.score > minScore) {
      return;
    }
    switch (result.type) {
      case 'person':
        return people.push(result);
      case 'segment':
        return meetings.push(result);
      case 'website':
        return websites.push(result);
    }
  });
  return {
    people,
    meetings,
    websites,
  };
};

const maxWebsiteResults = 12;

const WebsiteResults = (props: {
  store: IStore;
  isDarkMode: boolean;
  websites: ISearchItem[];
  showWebsitePopup: (item: IFeaturedWebsite) => void;
  toggleWebsiteTag: (tag: string, websiteId: string) => Promise<void>;
  websiteTags: IWebsiteTag[];
}) => {
  const websites = props.websites.map((item) => {
    const website = item.item as any;
    return {
      websiteId: website.id,
      meetings: [],
      isPinned: false,
      url: website.url,
      date: new Date(),
    };
  });
  const filteredWebsites = uniqBy(websites, 'websiteId');

  return (
    <React.Fragment>
      {filteredWebsites.slice(0, maxWebsiteResults).map((website: IFeaturedWebsite) => (
        <Grid item xs={3} key={website.websiteId}>
          <LargeWebsite
            store={props.store}
            item={website}
            isDarkMode={props.isDarkMode}
            websiteTags={props.websiteTags}
            toggleWebsiteTag={props.toggleWebsiteTag}
            showWebsitePopup={props.showWebsitePopup}
          />
        </Grid>
      ))}
    </React.Fragment>
  );
};

const Search = (props: {
  store: IStore;
  isDarkMode: boolean;
  toggleWebsiteTag: (tag: string, websiteId: string) => Promise<void>;
  showWebsitePopup: (item: IFeaturedWebsite) => void;
  websiteTags: IWebsiteTag[];
}) => {
  const router = useLocation();
  const [fuse, setFuse] = useState<Fuse<ISearchItem> | undefined>(undefined);

  const theme = useTheme();
  const isMobile = useMediaQuery((theme as any).breakpoints.down('lg'), {
    defaultMatches: true,
  });

  useEffect(() => {
    let isSubscribed = true;
    const fetchData = async () => {
      const searchIndex = new SearchIndex();
      await searchIndex.addData(props.store);

      const fuse = new Fuse(searchIndex.results, {
        includeScore: true,
        minMatchCharLength: 2,
        keys: ['text'],
      });
      if (isSubscribed) {
        setFuse(fuse);
      }
    };
    void fetchData();
    return () => (isSubscribed = false) as any;
  }, [props.store.isLoading]);

  if (!fuse) {
    return null;
  }

  const searchQuery = router.search
    .replace('?query=', '')
    .toLowerCase()
    .replace(uncommonPunctuation, ' ');

  const results = searchQuery ? fuse.search(searchQuery) : [];
  const filteredResults = filterSearchResults(results);

  return (
    <Root>
      <Grid container className={classes.topNav} spacing={2}>
        {filteredResults.websites.length > 1 && (
          <Grid item>
            <Typography
              className={classes.button}
              onClick={() =>
                document.getElementById('websites')?.scrollIntoView({ behavior: 'smooth' })
              }
            >
              {filteredResults.websites.length} websites
            </Typography>
          </Grid>
        )}
        {filteredResults.people.length > 1 && (
          <Grid item>
            <Typography
              className={classes.button}
              onClick={() =>
                document.getElementById('people')?.scrollIntoView({ behavior: 'smooth' })
              }
            >
              {filteredResults.people.length} people
            </Typography>
          </Grid>
        )}
        {filteredResults.meetings.length > 1 && (
          <Grid item>
            <Typography
              className={classes.button}
              onClick={() =>
                document.getElementById('meetings')?.scrollIntoView({ behavior: 'smooth' })
              }
            >
              {filteredResults.meetings.length} meetings
            </Typography>
          </Grid>
        )}
      </Grid>
      <div className={classes.container}>
        {filteredResults.websites.length > 0 && (
          <div className={classes.section} id="websites">
            <Typography variant="h6" className={classes.rowText}>
              Websites
            </Typography>
            <Grid container spacing={isMobile ? 5 : 6}>
              <WebsiteResults
                store={props.store}
                websites={filteredResults.websites}
                isDarkMode={props.isDarkMode}
                websiteTags={props.websiteTags}
                toggleWebsiteTag={props.toggleWebsiteTag}
                showWebsitePopup={props.showWebsitePopup}
              />
            </Grid>
          </div>
        )}
        {filteredResults.people.length > 0 && (
          <div className={classes.section} id="people">
            <Typography variant="h6" className={classes.rowText}>
              People
            </Typography>
            {filteredResults.people.slice(0, 9).map((result: any) => (
              <PersonRow
                selectedPersonId={null}
                key={result.item.id}
                person={result.item as IPerson}
              />
            ))}
          </div>
        )}
        {filteredResults.meetings.length > 0 && (
          <div className={classes.section} id="meetings">
            <Typography variant="h6" className={classes.rowText}>
              Meetings
            </Typography>
            {filteredResults.meetings.slice(0, 9).map((result: any) => (
              <FeaturedMeeting
                key={result.item.id}
                meeting={result.item as ISegment}
                store={props.store}
                showLine
                isDarkMode={props.isDarkMode}
                websiteTags={props.websiteTags}
                toggleWebsiteTag={props.toggleWebsiteTag}
                showWebsitePopup={props.showWebsitePopup}
              />
            ))}
          </div>
        )}
      </div>
    </Root>
  );
};

export default Search;
