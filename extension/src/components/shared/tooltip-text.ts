import { format } from 'date-fns';
import { capitalize } from 'lodash';
import { IPerson, ISegmentDocument } from '../store/data-types';
import { getPastTense } from './past-tense';

export const getTooltipText = (segmentDocument: ISegmentDocument, person?: IPerson) => {
  const name = person?.name || person?.emailAddresses;
  const personText = person ? ` by ${name}` : '';
  return `${capitalize(getPastTense(segmentDocument.reason))}${personText} on ${format(
    new Date(segmentDocument.date),
    "MMM do 'at' hh:mm a",
  )}`;
};
