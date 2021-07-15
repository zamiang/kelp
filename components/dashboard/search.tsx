import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Fuse from 'fuse.js';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Meeting } from '../../components/shared/meeting-list';
import DocumentRow from '../documents/document-row';
import PersonRow from '../person/person-row';
import { IDocument, IPerson, ISegment, IWebsite } from '../store/data-types';
import { uncommonPunctuation } from '../store/models/tfidf-model';
import SearchIndex, { ISearchItem } from '../store/search-index';
import { IStore } from '../store/use-store';
import { WebsiteRow } from '../website/website-row';

const filterSearchResults = (searchResults: Fuse.FuseResult<ISearchItem>[]) => {
  const people: ISearchItem[] = [];
  const meetings: ISearchItem[] = [];
  const documents: ISearchItem[] = [];
  const websites: ISearchItem[] = [];
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
      case 'website':
        return websites.push(result);
    }
  });
  return {
    people,
    meetings,
    documents,
    websites,
  };
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

const Search = (props: { store: IStore }) => {
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
        {filteredResults.documents.length > 0 && (
          <div className={classes.panel}>
            <Typography className={classes.heading} variant="h6">
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
        {filteredResults.websites.length > 0 && (
          <div className={classes.panel}>
            <Typography className={classes.heading} variant="h6">
              Websites
            </Typography>
            {filteredResults.websites.map((result: any) => (
              <WebsiteRow
                store={props.store}
                key={result.item.id}
                website={result.item as IWebsite}
              />
            ))}
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
              <Meeting
                key={result.item.id}
                meeting={result.item as ISegment}
                personStore={props.store['personDataStore']}
                isSmall={false}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
