import Typography from '@material-ui/core/Typography';
import Fuse from 'fuse.js';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Meeting } from '../../components/shared/meeting-list';
import panelStyles from '../../components/shared/panel-styles';
import DocumentRow from '../documents/document-row';
import PersonRow from '../person/person-row';
import { IDocument, IPerson, ISegment } from '../store/data-types';
import { uncommonPunctuation } from '../store/models/tfidf-model';
import SearchIndex, { ISearchItem } from '../store/search-index';
import { IStore } from '../store/use-store';

const filterSearchResults = (searchResults: Fuse.FuseResult<ISearchItem>[]) => {
  const people: ISearchItem[] = [];
  const meetings: ISearchItem[] = [];
  const documents: ISearchItem[] = [];
  searchResults.forEach((searchResult) => {
    const result = searchResult.item;
    if (!searchResult.score || searchResult.score > 0.7) {
      return;
    }
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
  const [fuse, setFuse] = useState<Fuse<ISearchItem> | undefined>(undefined);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const searchIndex = new SearchIndex();
        await searchIndex.addData(props.store);

        const fuse = new Fuse(searchIndex.results, {
          includeScore: true,
          minMatchCharLength: 2,
          keys: ['text'],
        });
        setFuse(fuse);
      } catch (e) {
        console.log(e, '<<<<<<<<<<');
      }
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
  let results: Fuse.FuseResult<ISearchItem>[] = [];
  let filteredResults: any = [];
  try {
    results = searchQuery ? fuse.search(searchQuery) : [];
    filteredResults = filterSearchResults(results);
  } catch (e) {
    console.log(e, 'result');
  }
  return (
    <div className={classes.panel}>
      {filteredResults.documents.length > 0 && (
        <div className={classes.section}>
          <Typography className={classes.headingPadding} variant="body2">
            Documents
          </Typography>
          {filteredResults.documents.map((result: any) => (
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
        <div className={classes.section}>
          <Typography className={classes.headingPadding} variant="body2">
            Meetings
          </Typography>
          {filteredResults.meetings.map((result: any) => (
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
