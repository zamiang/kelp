import { format } from 'date-fns';
import { capitalize } from 'lodash';
import { IPerson } from '../store/models/person-model';
import { ISegmentDocument } from '../store/models/segment-document-model';
import { getPastTense } from './past-tense';

export const getTooltipText = (segmentDocument: ISegmentDocument, person?: IPerson) => {
  const name = person?.name || person?.emailAddresses;
  const personText = person ? ` by ${name}` : '';
  return `${capitalize(getPastTense(segmentDocument.reason))}${personText} on ${format(
    new Date(segmentDocument.date),
    "MMM do 'at' hh:mm a",
  )}`;
};
