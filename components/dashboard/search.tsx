import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Fuse from 'fuse.js';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FeaturedMeeting } from '../meeting/featured-meeting';
import PersonRow from '../person/person-row';
import { IPerson, ISegment } from '../store/data-types';
import { uncommonPunctuation } from '../store/models/tfidf-model';
import SearchIndex, { ISearchItem } from '../store/search-index';
import { IStore } from '../store/use-store';
import { IFeaturedWebsite } from '../website/get-featured-websites';
import { LargeWebsite } from '../website/large-website';

const minScore = 0.75;

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

const WebsiteResults = (props: { store: IStore; isDarkMode: boolean; websites: ISearchItem[] }) => {
  const websites = props.websites.map(
    (website: ISearchItem): IFeaturedWebsite => ({
      websiteId: website.item.id,
      meetings: [],
      websiteDatabaseId: website.item.id,
      isPinned: false,
      text: (website.item as any).title,
      date: (website.item as any).visitedTime,
    }),
  );
  return (
    <React.Fragment>
      {websites.slice(0, maxWebsiteResults).map((website: IFeaturedWebsite) => (
        <LargeWebsite
          store={props.store}
          key={website.websiteId}
          item={website}
          isDarkMode={props.isDarkMode}
        />
      ))}
    </React.Fragment>
  );
};

const useStyles = makeStyles((theme) => ({
  panel: {
    marginTop: theme.spacing(3),
  },
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
    top: 7,
    left: 195,
    zIndex: 12,
    maxWidth: 500,
  },
  button: {
    borderRadius: 18,
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

const Search = (props: { store: IStore; isDarkMode: boolean }) => {
  const classes = useStyles();
  const router = useLocation();
  const [fuse, setFuse] = useState<Fuse<ISearchItem> | undefined>(undefined);

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
  }, [props.store.lastUpdated, props.store.isLoading]);

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
        {filteredResults.websites.length && (
          <Grid item>
            <Typography
              className={classes.button}
              onClick={() => document.getElementById('websites')?.scrollIntoView()}
            >
              {filteredResults.websites.length} websites
            </Typography>
          </Grid>
        )}
        {filteredResults.people.length > 1 && (
          <Grid item>
            <Typography
              className={classes.button}
              onClick={() => document.getElementById('people')?.scrollIntoView()}
            >
              {filteredResults.people.length} people
            </Typography>
          </Grid>
        )}
        {filteredResults.meetings.length > 1 && (
          <Grid item>
            <Typography
              className={classes.button}
              onClick={() => document.getElementById('meetings')?.scrollIntoView()}
            >
              {filteredResults.meetings.length} meetings
            </Typography>
          </Grid>
        )}
      </Grid>
      <div className={classes.panel}>
        {filteredResults.websites.length > 0 && (
          <div className={classes.panel} id="websites">
            <Typography className={classes.heading} variant="h6">
              Websites
            </Typography>
            <Grid container spacing={4}>
              <WebsiteResults
                store={props.store}
                websites={filteredResults.websites}
                isDarkMode={props.isDarkMode}
              />
            </Grid>
          </div>
        )}
        {filteredResults.people.length > 0 && (
          <div className={classes.panel} id="people">
            <Typography className={classes.heading} variant="h6">
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
          <div className={classes.panel} id="meetings">
            <Typography className={classes.heading} variant="h6">
              Meetings
            </Typography>
            {filteredResults.meetings.slice(0, 9).map((result: any) => (
              <FeaturedMeeting
                key={result.item.id}
                meeting={result.item as ISegment}
                store={props.store}
                showLine
                currentFilter={'all'}
                isDarkMode={props.isDarkMode}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
