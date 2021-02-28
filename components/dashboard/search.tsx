import { Divider, Typography } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import panelStyles from '../../components/shared/panel-styles';
import DocumentSearchResult from '../documents/document-search-result';
import MeetingSearchResult from '../meeting/meeting-search-result';
import PersonSearchResult from '../person/person-search-result';
import TopBar from '../shared/top-bar';
import { IDocument } from '../store/models/document-model';
import { IPerson } from '../store/models/person-model';
import { ISegment } from '../store/models/segment-model';
import { uncommonPunctuation } from '../store/models/tfidf-model';
import SearchIndex, { ISearchItem } from '../store/search-index';
import { IStore } from '../store/use-store';

const filterSearchResults = (searchResults: ISearchItem[]) => {
  const people: ISearchItem[] = [];
  const meetings: ISearchItem[] = [];
  const documents: ISearchItem[] = [];
  searchResults.forEach((result) => {
    switch (result.type) {
      case 'document':
        return documents.push(result);
      case 'person':
        return people.push(result);
      case 'segment':
        return meetings.push(result);
    }
  });
  return {
    people,
    meetings,
    documents,
  };
};

const Search = (props: { store: IStore }) => {
  const classes = panelStyles();
  const router = useLocation();
  const [searchIndex, setSearchIndex] = useState<SearchIndex | undefined>(undefined);

  useEffect(() => {
    const fetchData = async () => {
      const searchIndex = new SearchIndex();
      await searchIndex.addData(props.store);
      setSearchIndex(searchIndex);
    };
    void fetchData();
  });
  if (!searchIndex) {
    return null;
  }

  const searchQuery = router.search
    .replace('?query=', '')
    .toLowerCase()
    .replace(uncommonPunctuation, ' ');
  const results = searchQuery
    ? searchIndex.results.filter((item) => item.text.includes(searchQuery))
    : [];

  const filteredResults = filterSearchResults(results);
  return (
    <div className={classes.panel}>
      <TopBar title={`Search Results for: ${searchQuery || ''}`} />
      {filteredResults.documents.length > 0 && (
        <div className={classes.rowNoBorder}>
          <Typography className={classes.headingPadding} variant="h5">
            Documents
          </Typography>
          <Divider />
          {filteredResults.documents.map((result) => (
            <DocumentSearchResult
              key={result.item.id}
              doc={result.item as IDocument}
              store={props.store}
            />
          ))}
        </div>
      )}
      {filteredResults.people.length > 0 && (
        <div className={classes.rowNoBorder}>
          <Typography className={classes.headingPadding} variant="h5">
            People
          </Typography>
          <Divider />
          {filteredResults.people.map((result) => (
            <PersonSearchResult
              key={result.item.id}
              person={result.item as IPerson}
              store={props.store}
            />
          ))}
        </div>
      )}
      {filteredResults.meetings.length > 0 && (
        <div className={classes.rowNoBorder}>
          <Typography className={classes.headingPadding} variant="h5">
            Meetings
          </Typography>
          <Divider />
          {filteredResults.meetings.map((result) => (
            <MeetingSearchResult
              key={result.item.id}
              meeting={result.item as ISegment}
              store={props.store}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Search;
