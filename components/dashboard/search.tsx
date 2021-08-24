import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Fuse from 'fuse.js';
import { uniqBy } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FeaturedMeeting } from '../meeting/featured-meeting';
import PersonRow from '../person/person-row';
import useExpandStyles from '../shared/expand-styles';
import useRowStyles from '../shared/row-styles';
import { cleanText } from '../shared/tfidf';
import { IPerson, ISegment, IWebsite, IWebsiteTag } from '../store/data-types';
import { uncommonPunctuation } from '../store/models/tfidf-model';
import SearchIndex, { ISearchItem } from '../store/search-index';
import { IStore } from '../store/use-store';
import { IFeaturedWebsite } from '../website/get-featured-websites';
import { LargeWebsite } from '../website/large-website';

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

export const getCleanTextForWebsite = (website: IWebsite) =>
  website.cleanTitle
    ? `${website.cleanTitle} ${website.cleanDescription || ''}`
    : cleanText(website.title).join(' ');

const maxWebsiteResults = 12;

const WebsiteResults = (props: {
  store: IStore;
  isDarkMode: boolean;
  websites: ISearchItem[];
  togglePin: (item: IFeaturedWebsite, isPinned: boolean) => Promise<void>;
  hideWebsite: (item: IFeaturedWebsite) => void;
  toggleWebsiteTag: (tag: string, websiteId: string) => Promise<void>;
  websiteTags: IWebsiteTag[];
}) => {
  const websites = props.websites.map((item): IFeaturedWebsite => {
    const website = item.item as IWebsite;
    return {
      websiteId: website.url,
      meetings: [],
      websiteDatabaseId: website.id,
      isPinned: false,
      rawUrl: website.rawUrl || website.id,
      text: website.title,
      cleanText: getCleanTextForWebsite(website),
      date: website.visitedTime,
    };
  });
  const filteredWebsites = uniqBy(websites, 'websiteId');

  return (
    <React.Fragment>
      {filteredWebsites.slice(0, maxWebsiteResults).map((website: IFeaturedWebsite) => (
        <LargeWebsite
          store={props.store}
          key={website.websiteId}
          item={website}
          isDarkMode={props.isDarkMode}
          togglePin={props.togglePin}
          hideItem={props.hideWebsite}
          websiteTags={props.websiteTags}
          toggleWebsiteTag={props.toggleWebsiteTag}
        />
      ))}
    </React.Fragment>
  );
};

const useStyles = makeStyles((theme) => ({
  boxStyle: {
    background: theme.palette.background.paper,
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  heading: {
    marginLeft: 0,
  },
  lineCalendarContainer: {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  topNav: {
    position: 'fixed',
    top: 11,
    left: 195,
    zIndex: 12,
    maxWidth: 500,
  },
  button: {
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

const Search = (props: {
  store: IStore;
  isDarkMode: boolean;
  hideDialogUrl?: string;
  hideWebsite: (item: IFeaturedWebsite) => void;
  toggleWebsiteTag: (tag: string, websiteId: string) => Promise<void>;
  websiteTags: IWebsiteTag[];
}) => {
  const rowStyles = useRowStyles();
  const expandStyles = useExpandStyles();
  const classes = useStyles();
  const router = useLocation();
  const [fuse, setFuse] = useState<Fuse<ISearchItem> | undefined>(undefined);
  // used to refetch data
  const [pinIncrement, setPinIncrement] = useState(0);

  const togglePin = async (item: IFeaturedWebsite, isPinned: boolean) => {
    if (isPinned) {
      await props.store.websitePinStore.delete(item.websiteId);
    } else {
      await props.store.websitePinStore.create(item.websiteId);
    }
    setPinIncrement(pinIncrement + 1);
  };

  useEffect(() => {
    const fetchData = async () => {
      const searchIndex = new SearchIndex();
      await searchIndex.addData(props.store);

      const fuse = new Fuse(searchIndex.results, {
        includeScore: true,
        minMatchCharLength: 2,
        keys: ['text'],
      });
      setFuse(fuse);
    };
    void fetchData();
  }, [props.store.lastUpdated, props.store.isLoading, pinIncrement, props.hideDialogUrl]);

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
    <div>
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
      <div className={expandStyles.container}>
        {filteredResults.websites.length > 0 && (
          <div className={expandStyles.section} id="websites">
            <Typography variant="h6" className={rowStyles.rowText}>
              Websites
            </Typography>
            <Grid container spacing={4}>
              <WebsiteResults
                store={props.store}
                websites={filteredResults.websites}
                isDarkMode={props.isDarkMode}
                togglePin={togglePin}
                websiteTags={props.websiteTags}
                toggleWebsiteTag={props.toggleWebsiteTag}
                hideWebsite={(website) => {
                  props.hideWebsite(website);
                  setPinIncrement(pinIncrement + 1);
                }}
              />
            </Grid>
          </div>
        )}
        {filteredResults.people.length > 0 && (
          <div className={expandStyles.section} id="people">
            <Typography variant="h6" className={rowStyles.rowText}>
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
          <div className={expandStyles.section} id="meetings">
            <Typography variant="h6" className={rowStyles.rowText}>
              Meetings
            </Typography>
            {filteredResults.meetings.slice(0, 9).map((result: any) => (
              <FeaturedMeeting
                key={result.item.id}
                meeting={result.item as ISegment}
                store={props.store}
                showLine
                hideWebsite={props.hideWebsite}
                currentFilter={'all'}
                isDarkMode={props.isDarkMode}
                websiteTags={props.websiteTags}
                toggleWebsiteTag={props.toggleWebsiteTag}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
