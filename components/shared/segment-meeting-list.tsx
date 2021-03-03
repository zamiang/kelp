import Typography from '@material-ui/core/Typography';
import { uniqBy } from 'lodash';
import React, { useEffect, useState } from 'react';
import { Meeting } from '../../components/shared/meeting-list';
import { IPerson } from '../store/models/person-model';
import { ISegmentDocument } from '../store/models/segment-document-model';
import { ISegment } from '../store/models/segment-model';
import { IStore } from '../store/use-store';

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
        const result = await props.personStore.getPersonById(props.segmentDocument.personId);
        setPerson(result);
      }
    };
    void fetchData();
  }, [props.segmentDocument.personId]);

  if (!meeting) {
    return null;
  }

  const personText = person ? ` by ${person?.name || person?.emailAddresses}` : '';
  const belowText = `${props.segmentDocument.reason}${personText}`;
  //const tooltipText = `${capitalize(props.segmentDocument.reason)}${personText} on ${format(new Date(props.segmentDocument.date),"MMM do 'at' hh:mm a",)}`;

  return (
    <Meeting
      key={props.segmentDocument.id}
      personStore={props.personStore}
      meeting={meeting}
      info={belowText}
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
