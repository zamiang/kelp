import Typography from '@mui/material/Typography';
import { uniqBy } from 'lodash';
import React, { useEffect, useState } from 'react';
import { Meeting } from '../../components/shared/meeting-list';
import { IPerson, ISegment, ISegmentDocument } from '../store/data-types';
import { IStore } from '../store/use-store';
import { getTooltipText } from './tooltip-text';

const SegmentDocumentItem = (props: {
  personStore: IStore['personDataStore'];
  timeStore: IStore['timeDataStore'];
  segmentDocument: ISegmentDocument;
}) => {
  const [meeting, setMeeting] = useState<ISegment | undefined>(undefined);
  const [person, setPerson] = useState<IPerson | undefined>(undefined);

  useEffect(() => {
    const fetchData = async () => {
      if (props.segmentDocument.segmentId) {
        const result = await props.timeStore.getById(props.segmentDocument.segmentId);
        setMeeting(result);
      }
    };
    void fetchData();
  }, [props.segmentDocument.documentId]);

  useEffect(() => {
    const fetchData = async () => {
      if (props.segmentDocument.personId) {
        const result = await props.personStore.getById(props.segmentDocument.personId);
        setPerson(result);
      }
    };
    void fetchData();
  }, [props.segmentDocument.personId]);

  if (!meeting) {
    return null;
  }

  const belowText = getTooltipText(props.segmentDocument, person);
  return (
    <Meeting
      key={props.segmentDocument.id}
      personStore={props.personStore}
      meeting={meeting}
      info={belowText}
      isSmall={true}
    />
  );
};

const SegmentMeetingList = (props: {
  segmentDocuments: ISegmentDocument[];
  personStore: IStore['personDataStore'];
  timeStore: IStore['timeDataStore'];
}) => {
  const segmentDocuments = uniqBy(
    props.segmentDocuments.sort((a, b) => (a.date > b.date ? -1 : 1)),
    'documentId',
  );
  if (segmentDocuments.length < 1) {
    return <Typography variant="caption">None</Typography>;
  }
  return (
    <div>
      {segmentDocuments.map((segmentDocument) => (
        <SegmentDocumentItem
          key={segmentDocument.id}
          personStore={props.personStore}
          segmentDocument={segmentDocument}
          timeStore={props.timeStore}
        />
      ))}
    </div>
  );
};

export default SegmentMeetingList;
