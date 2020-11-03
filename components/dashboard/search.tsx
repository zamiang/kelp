import Typography from '@material-ui/core/Typography';
import { useRouter } from 'next/router';
import React from 'react';
import panelStyles from '../../components/shared/panel-styles';
import { IStorePopper } from '../../pages/dashboard/index';
import DocumentSearchResult from '../docs/document-search-result';
import MeetingSearchResult from '../meeting/meeting-search-result';
import PersonSearchResult from '../person/person-search-result';
import { IDoc } from '../store/doc-store';
import { IPerson } from '../store/person-store';
import { ISegment } from '../store/time-store';

interface ISearchItem {
  text: string;
  type: 'segment' | 'document' | 'person';
  item: IPerson | ISegment | IDoc;
}

const buildSearchIndex = (store: {
  docDataStore: IStorePopper['docDataStore'];
  driveActivityStore: IStorePopper['driveActivityStore'];
  timeDataStore: IStorePopper['timeDataStore'];
  personDataStore: IStorePopper['personDataStore'];
}) => {
  const searchIndex = [] as ISearchItem[];
  // Docs
  store.docDataStore.getDocs().map((doc) => {
    if (doc && doc.name) {
      searchIndex.push({
        text: doc.name.toLowerCase(),
        type: 'document',
        item: doc,
      });
    }
  });
  // Meetings
  store.timeDataStore.getSegments().map((segment) => {
    if (segment.summary) {
      searchIndex.push({
        text: segment.summary.toLowerCase(),
        type: 'segment',
        item: segment,
      });
    }
  });
  // People
  store.personDataStore.getPeople().map((person) => {
    // TODO: Remove need to do indexof
    if (person && person.name.indexOf('person') < 0 && person.name.indexOf('@') < 0) {
      searchIndex.push({
        text: person.name.toLowerCase(),
        type: 'person',
        item: person,
      });
    }
  });
  return searchIndex;
};

const renderSearchResults = (searchResults: ISearchItem[], openPopper: any) =>
  searchResults.map((result) => {
    switch (result.type) {
      case 'document':
        return (
          <DocumentSearchResult
            doc={result.item as IDoc}
            selectedDocumentId={null}
            openPopper={openPopper}
          />
        );
      case 'person':
        return <PersonSearchResult person={result.item as IPerson} selectedPersonId={null} />;
      case 'segment':
        return <MeetingSearchResult meeting={result.item as ISegment} selectedMeetingId={null} />;
    }
  });

const Search = (props: IStorePopper) => {
  const classes = panelStyles();
  const router = useRouter();
  const searchIndex = buildSearchIndex(props);
  const searchQuery = (router.query.query as string).toLowerCase();
  const results = searchIndex.filter((item) => item.text.includes(searchQuery));
  return (
    <div className={classes.panel}>
      <div className={classes.section}>
        <div className={classes.rowNoBorder}>
          <Typography variant="caption" className={classes.title}>
            Search Results for: {searchQuery}
          </Typography>
          {renderSearchResults(results || [])}
        </div>
      </div>
    </div>
  );
};

export default Search;
