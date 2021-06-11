import { subDays } from 'date-fns';
import { uniqBy } from 'lodash';
import config from '../../constants/config';
import { IDocument, ISegment } from '../store/data-types';
import { IStore } from '../store/use-store';

export interface IFeaturedWebsite {
  documentId?: string;
  websiteId: string;
  document?: IDocument;
  meetings: ISegment[];
  text?: string;
  date: Date;
}

/**
 * Gets websites in the featured section by looking through meetings for the coming week
 * Finds meeetings documents associated with those meetings
 * It sorts in decending order so upcoming meetings are next
 */
export const getFeaturedWebsites = async (props: IStore) => {
  const currentDate = new Date();
  const filterTime = subDays(currentDate, config.NUMBER_OF_DAYS_BACK);

  // For documents edited by the current user that may not be associated with a meeting
  const driveActivity = await props.driveActivityStore.getCurrentUserDriveActivity();
  const filteredWebsites = await props.websitesStore.getAll(
    props.domainBlocklistStore,
    props.websiteBlocklistStore,
  );

  const filteredDriveActivity = driveActivity.filter((item) => item.time > filterTime);

  const urlCount: { [url: string]: number } = {};

  const currentUserDocuments = filteredDriveActivity
    .map((item) => {
      if (!item.documentId) {
        return null;
      }
      if (urlCount[item.link]) {
        urlCount[item.link] = urlCount[item.link] + 1;
      } else {
        urlCount[item.link] = 1;
      }
      return {
        documentId: item.id,
        meetings: [] as any,
        nextMeetingStartsAt: undefined,
        websiteId: item.link,
        text: item.title,
        date: item.time,
      } as IFeaturedWebsite;
    })
    .filter(Boolean) as IFeaturedWebsite[];

  const websiteVisits = filteredWebsites.map((item) => {
    if (urlCount[item.url]) {
      urlCount[item.url] = urlCount[item.url] + 1;
    } else {
      urlCount[item.url] = 1;
    }
    return {
      documentId: item.documentId,
      meetings: item.meetingId ? [item.meetingId] : ([] as any),
      nextMeetingStartsAt: undefined,
      websiteId: item.url,
      text: item.title,
      date: item.visitedTime,
    } as IFeaturedWebsite;
  });

  const concattedWebsitesAndDocuments = uniqBy(
    currentUserDocuments.concat(websiteVisits).sort((a, b) => (a.date > b.date ? -1 : 1)),
    'websiteId',
  );

  return concattedWebsitesAndDocuments.sort((a, b) =>
    urlCount[a.websiteId] > urlCount[b.websiteId] ? -1 : 1,
  );
};
