import Typography from '@material-ui/core/Typography';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Meeting } from '../../components/shared/meeting-list';
import panelStyles from '../../components/shared/panel-styles';
import DocumentRow from '../documents/document-row';
import PersonRow from '../person/person-row';
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
      {filteredResults.documents.length > 0 && (
        <div className={classes.section}>
          <Typography className={classes.headingPadding} variant="body2">
            Documents
          </Typography>
          {filteredResults.documents.map((result) => (
            <DocumentRow
              selectedDocumentId={null}
              key={result.item.id}
              document={result.item as IDocument}
              store={props.store}
            />
          ))}
        </div>
      )}
      {filteredResults.people.length > 0 && (
        <div className={classes.section}>
          <Typography className={classes.headingPadding} variant="body2">
            People
          </Typography>
          {filteredResults.people.map((result) => (
            <PersonRow
              selectedPersonId={null}
              key={result.item.id}
              person={result.item as IPerson}
            />
          ))}
        </div>
      )}
      {filteredResults.meetings.length > 0 && (
        <div className={classes.section}>
          <Typography className={classes.headingPadding} variant="body2">
            Meetings
          </Typography>
          {filteredResults.meetings.map((result) => (
            <Meeting
              key={result.item.id}
              meeting={result.item as ISegment}
              personStore={props.store['personDataStore']}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Search;
