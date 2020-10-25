import Typography from '@material-ui/core/Typography';
import { useRouter } from 'next/router';
import React from 'react';
import panelStyles from '../../components/shared/panel-styles';
import DocumentRow from '../docs/document-row';
import MeetingRow from '../meeting/meeting-row';
import PersonRow from '../person/person-row';
import { IDoc } from '../store/doc-store';
import { IPerson } from '../store/person-store';
import { ISegment } from '../store/time-store';
import { IStore } from '../store/use-store';

interface ISearchItem {
  text: string;
  type: 'segment' | 'document' | 'person';
  item: IPerson | ISegment | IDoc;
}

const buildSearchIndex = (store: {
  docDataStore: IStore['docDataStore'];
  driveActivityStore: IStore['driveActivityStore'];
  timeDataStore: IStore['timeDataStore'];
  personDataStore: IStore['personDataStore'];
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

const renderSearchResults = (searchResults: ISearchItem[]) =>
  searchResults.map((result) => {
    switch (result.type) {
      case 'document':
        return <DocumentRow doc={result.item as IDoc} selectedDocumentId={null} />;
      case 'person':
        return <PersonRow person={result.item as IPerson} selectedPersonId={null} />;
      case 'segment':
        return (
          <MeetingRow
            meeting={result.item as ISegment}
            selectedMeetingId={null}
            shouldRenderCurrentTime={false}
            currentTime={new Date()}
          />
        );
    }
  });

const Search = (props: IStore) => {
  const styles = panelStyles();
  const router = useRouter();
  const searchIndex = buildSearchIndex(props);
  const searchQuery = (router.query.query as string).toLowerCase();
  const results = searchIndex.filter((item) => item.text.includes(searchQuery));
  return (
    <React.Fragment>
      <Typography className={styles.title}>Search Results for: {searchQuery}</Typography>
      {renderSearchResults(results || [])}
    </React.Fragment>
  );
};

export default Search;
