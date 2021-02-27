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

const renderSearchResults = (searchResults: ISearchItem[], store: IStore) =>
  searchResults.map((result) => {
    switch (result.type) {
      case 'document':
        return (
          <DocumentSearchResult key={result.item.id} doc={result.item as IDocument} store={store} />
        );
      case 'person':
        return (
          <PersonSearchResult key={result.item.id} person={result.item as IPerson} store={store} />
        );
      case 'segment':
        return (
          <MeetingSearchResult
            key={result.item.id}
            meeting={result.item as ISegment}
            store={store}
          />
        );
    }
  });

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
  return (
    <div className={classes.panel}>
      <TopBar title={`Search Results for: ${searchQuery || ''}`} />
      <div className={classes.rowNoBorder}>{renderSearchResults(results || [], props.store)}</div>
    </div>
  );
};

export default Search;
