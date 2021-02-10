import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { IFormattedDriveActivity } from '../fetch/fetch-drive-activity';
import SmallPersonRow from '../person/person-row-small';
import AppBar from '../shared/elevate-app-bar';
import useExpandStyles from '../shared/expand-styles';
import SegmentMeetingList from '../shared/segment-meeting-list';
import { getPeopleSortedByCount } from '../store/helpers';
import { IDocument } from '../store/models/document-model';
import { IPerson } from '../store/models/person-model';
import { ISegmentDocument } from '../store/models/segment-document-model';
import { IStore } from '../store/use-store';

const ExpandedDocument = (props: { store: IStore; documentId?: string; close?: () => void }) => {
  const classes = useExpandStyles();
  const { slug }: any = useParams();
  const documentId = props.documentId || slug;
  const [document, setDocument] = useState<IDocument | undefined>(undefined);
  const [driveActivity, setDriveActivity] = useState<IFormattedDriveActivity[]>([]);
  const [people, setPeople] = useState<IPerson[]>([]);
  const [peopleStats, setPeopleStats] = useState<any>({});
  const [segmentDocuments, setSegmentDocuments] = useState<ISegmentDocument[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (documentId) {
        const result = await props.store.documentDataStore.getByLink(documentId);
        setDocument(result);
      }
    };
    void fetchData();
  }, [props.store.isLoading, documentId]);

  useEffect(() => {
    const fetchData = async () => {
      if (documentId) {
        const result = await props.store.driveActivityStore.getDriveActivityForDocument(documentId);
        setDriveActivity(result);
      }
    };
    void fetchData();
  }, [props.store.isLoading, documentId]);

  useEffect(() => {
    const fetchData = async () => {
      if (documentId) {
        const result = await props.store.segmentDocumentStore.getAllForDocumentId(documentId);
        setSegmentDocuments(result.filter((r) => !!r.segmentId));
      }
    };
    void fetchData();
  }, [props.store.isLoading, documentId]);

  useEffect(() => {
    const fetchData = async () => {
      if (driveActivity.length > 0) {
        const people = await getPeopleSortedByCount(
          driveActivity.map((a) => a.actorPersonId).filter(Boolean) as any,
          props.store.personDataStore,
        );
        setPeople(people.sortedPeople.slice(0, 5));
        setPeopleStats(people.peopleStats);
      }
    };
    void fetchData();
  }, [driveActivity.length]);

  if (!document) {
    return null;
  }

  return (
    <React.Fragment>
      <AppBar onClose={props.close} externalLink={document.link} />
      <div className={classes.topContainer}>
        <Typography variant="h5" color="textPrimary" gutterBottom className={classes.title}>
          {document.name || '(no title)'}
        </Typography>
        {document.updatedAt && (
          <React.Fragment>Modified: {format(document.updatedAt, 'EEEE, MMMM d p')}</React.Fragment>
        )}
      </div>
      <Divider />
      <div className={classes.container}>
        {people.length > 0 && (
          <React.Fragment>
            <Typography variant="h6" className={classes.triGroupHeading}>
              Key Contributors
            </Typography>
            <div className={classes.list}>
              {people.map(
                (person: IPerson) =>
                  person &&
                  peopleStats[person.id] && (
                    <SmallPersonRow
                      key={person.id}
                      person={person}
                      info={`${peopleStats[person.id][person.id]} events`}
                    />
                  ),
              )}
            </div>
          </React.Fragment>
        )}
        <Typography variant="h6" className={classes.smallHeading}>
          Meetings
        </Typography>
        <SegmentMeetingList
          segmentDocuments={segmentDocuments}
          timeStore={props.store.timeDataStore}
          personStore={props.store.personDataStore}
        />
      </div>
    </React.Fragment>
  );
};

export default ExpandedDocument;
