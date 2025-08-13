import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Fuse, { FuseResult } from 'fuse.js';
import { uniqBy } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FeaturedMeeting } from '../meeting/featured-meeting';
import PersonRow from '../person/person-row';
import Loading from '../shared/loading';
import { IPerson, ISegment, IWebsiteTag } from '../store/data-types';
import { uncommonPunctuation } from '../store/models/enhanced-tfidf-store';
import { ISearchItem, enhancedSearchIndex } from '../store/utils/enhanced-search-index';
import { IStore } from '../store/use-store';
import { IFeaturedWebsite, IWebsiteCache } from '../website/get-featured-websites';
import { LargeWebsite } from '../website/large-website';
import '../../styles/components/dashboard/search.css';

// A score of 0 indicates a perfect match, while a score of 1 indicates a complete mismatch.
const minScore = 0.6;

const filterSearchResults = (searchResults: FuseResult<ISearchItem>[]) => {
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
  websites: ISearchItem[];
  toggleWebsiteTag: (tag: string, websiteId: string) => Promise<void>;
  websiteTags: IWebsiteTag[];
}) => {
  const websites = props.websites.map((item) => {
    const website = item.item as any;
    return {
      id: website.id,
      meetings: [],
      isPinned: false,
      rawUrl: website.url,
      lastVisited: new Date(),
      visitCount: 0,
    } as IFeaturedWebsite;
  });
  const filteredWebsites = uniqBy(websites, 'id');

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container columns={3} spacing={2}>
        {filteredWebsites.slice(0, maxWebsiteResults).map((website: IFeaturedWebsite) => (
          <Grid key={website.id} size={1}>
            <LargeWebsite
              store={props.store}
              item={website}
              websiteTags={props.websiteTags}
              toggleWebsiteTag={props.toggleWebsiteTag}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

const SearchResults = (props: {
  searchQuery: string;
  fuse: Fuse<ISearchItem>;
  store: IStore;
  toggleWebsiteTag: (tag: string, websiteId: string) => Promise<void>;
  websiteTags: IWebsiteTag[];
  websiteCache: IWebsiteCache;
}) => {
  const results = props.searchQuery ? props.fuse.search(props.searchQuery) : [];
  const filteredResults = filterSearchResults(results);
  return (
    <React.Fragment>
      <div className="search-container">
        {filteredResults.websites.length > 0 && (
          <div className="search-row" id="websites">
            <Typography variant="h3" className="search-row-text">
              Websites
            </Typography>
            <WebsiteResults
              store={props.store}
              websites={filteredResults.websites}
              websiteTags={props.websiteTags}
              toggleWebsiteTag={props.toggleWebsiteTag}
            />
          </div>
        )}
        {filteredResults.people.length > 0 && (
          <div className="search-row" id="people">
            <Typography variant="h3" className="search-row-text">
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
          <div className="search-row" id="meetings">
            <Typography variant="h3" className="search-row-text">
              Meetings
            </Typography>
            {filteredResults.meetings.slice(0, 9).map((result: any) => (
              <FeaturedMeeting
                key={result.item.id}
                meeting={result.item as ISegment}
                store={props.store}
                showLine
                websiteTags={props.websiteTags}
                toggleWebsiteTag={props.toggleWebsiteTag}
                websiteCache={props.websiteCache}
              />
            ))}
          </div>
        )}
      </div>
    </React.Fragment>
  );
};

const Search = (props: {
  store: IStore;
  toggleWebsiteTag: (tag: string, websiteId: string) => Promise<void>;
  websiteTags: IWebsiteTag[];
  websiteCache: IWebsiteCache;
}) => {
  const router = useLocation();
  const [searchItems, setSearchItems] = useState<ISearchItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isSubscribed = true;
    const fetchData = async () => {
      try {
        // Use enhanced search index to get all items for Fuse.js
        const result = await enhancedSearchIndex.search('', props.store, {
          limit: 10000, // Get all items for local Fuse.js search
        });

        if (isSubscribed && result.success) {
          setSearchItems(result.data.items);
        }
      } catch (error) {
        console.error('Failed to load search data:', error);
      } finally {
        if (isSubscribed) {
          setIsLoading(false);
        }
      }
    };
    void fetchData();
    return () => (isSubscribed = false) as any;
  }, [props.store]);

  const searchQuery = router.search
    .replace('?query=', '')
    .toLowerCase()
    .replace(uncommonPunctuation, ' ');

  // Create Fuse instance with loaded search items
  const fuse = new Fuse(searchItems, {
    includeScore: true,
    minMatchCharLength: 2,
    keys: ['text'],
  });

  return (
    <div className="search-root">
      <Loading isOpen={isLoading} message={'Searching...'} />
      <SearchResults searchQuery={searchQuery} fuse={fuse} {...props} />
    </div>
  );
};

export default Search;
