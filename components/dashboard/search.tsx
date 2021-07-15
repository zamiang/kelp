import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Fuse from 'fuse.js';
import { uniqBy } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FeaturedMeeting } from '../meeting/featured-meeting';
import PersonRow from '../person/person-row';
import { IPerson, ISegment, IWebsite } from '../store/data-types';
import { uncommonPunctuation } from '../store/models/tfidf-model';
import SearchIndex, { ISearchItem } from '../store/search-index';
import { IStore } from '../store/use-store';
import { IFeaturedWebsite } from '../website/get-featured-websites';
import { LargeWebsite } from '../website/large-website';

const filterSearchResults = (searchResults: Fuse.FuseResult<ISearchItem>[]) => {
  const people: ISearchItem[] = [];
  const meetings: ISearchItem[] = [];
  const websites: ISearchItem[] = [];
  searchResults.forEach((searchResult) => {
    const result = searchResult.item;
    if (!searchResult.score || searchResult.score > 0.7) {
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

const WebsiteResults = (props: { store: IStore; isDarkMode: boolean; websites: ISearchItem[] }) => {
  const websites = (
    uniqBy(
      props.websites.map((r) => r.item),
      'id',
    ) as any
  ).map(
    (website: IWebsite): IFeaturedWebsite => ({
      websiteId: website.id,
      meetings: [],
      websiteDatabaseId: website.id,
      isPinned: false,
      text: website.title,
      date: website.visitedTime,
    }),
  );
  return (
    <React.Fragment>
      {websites.map((website: IFeaturedWebsite) => (
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
      <div className={classes.panel}>
        {filteredResults.websites.length > 0 && (
          <div className={classes.panel}>
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
          <div className={classes.panel}>
            <Typography className={classes.heading} variant="h6">
              People
            </Typography>
            {filteredResults.people.map((result: any) => (
              <PersonRow
                selectedPersonId={null}
                key={result.item.id}
                person={result.item as IPerson}
              />
            ))}
          </div>
        )}
        {filteredResults.meetings.length > 0 && (
          <div className={classes.panel}>
            <Typography className={classes.heading} variant="h6">
              Meetings
            </Typography>
            {filteredResults.meetings.map((result: any) => (
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
