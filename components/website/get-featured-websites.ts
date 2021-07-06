import { differenceInDays, subDays } from 'date-fns';
import { flatten, uniqBy } from 'lodash';
import config from '../../constants/config';
import { IDocument, ISegment } from '../store/data-types';
import { IStore } from '../store/use-store';

export interface IFeaturedWebsite {
  documentId?: string;
  websiteId: string;
  document?: IDocument;
  meetings: ISegment[];
  websiteDatabaseId: string | null;
  isPinned: boolean;
  text?: string;
  date: Date;
}

const decay = 0.95;

const getValueForDate = (date: Date) => {
  const daysFromToday = differenceInDays(new Date(), date);
  if (daysFromToday < 1) {
    return 1;
  }
  return decay ** daysFromToday;
};

/**
 * Gets websites in the featured section by looking through meetings for the coming week
 * Finds meeetings documents associated with those meetings
 * It sorts in decending order so upcoming meetings are next
 */
export const getFeaturedWebsites = async (props: IStore) => {
  const currentDate = new Date();
  const filterTime = subDays(currentDate, config.NUMBER_OF_DAYS_BACK);

  // setup pin index
  const pinIndex: { [url: string]: boolean } = {};
  const pins = await props.websitePinStore.getAll();
  pins.map((p) => (pinIndex[p.id] = true));

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
      const link = `${item.link}`;
      if (urlCount[link]) {
        urlCount[link] = urlCount[link] + getValueForDate(item.time);
      } else {
        urlCount[link] = getValueForDate(item.time);
      }
      return {
        documentId: item.documentId,
        meetings: [] as any,
        nextMeetingStartsAt: undefined,
        websiteId: link,
        text: item.title,
        date: item.time,
        websiteDatabaseId: null,
        isPinned: pinIndex[link] ? true : false,
      } as IFeaturedWebsite;
    })
    .filter(Boolean) as IFeaturedWebsite[];

  const websiteVisits = filteredWebsites.map((item) => {
    if (urlCount[item.url]) {
      urlCount[item.url] = urlCount[item.url] + getValueForDate(item.visitedTime);
    } else {
      urlCount[item.url] = getValueForDate(item.visitedTime);
    }
    return {
      documentId: item.documentId,
      meetings: item.meetingId ? [item.meetingId] : ([] as any),
      nextMeetingStartsAt: undefined,
      websiteId: item.url,
      text: item.title,
      date: item.visitedTime,
      websiteDatabaseId: item.id,
      isPinned: pinIndex[item.url] ? true : false,
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

/**
 * Gets websites in the meeting
 * TODO: ensure this pulls from the description
 */
export const getWebsitesForMeeting = async (
  meeting: ISegment,
  store: IStore,
): Promise<IFeaturedWebsite[]> => {
  const similarMeetings = await store.timeDataStore.getSegmentsForName(meeting.summary || '');

  const segmentDocumentsForMeeting = flatten(
    await Promise.all(
      similarMeetings.map(async (m) => {
        const result2 = await store.segmentDocumentStore.getAllForSegment(m);
        return result2 ? result2.filter((s) => s.isPersonAttendee) : [];
      }),
    ),
  );

  // For documents edited by the current user that may not be associated with a meeting
  const filteredWebsites = flatten(
    await Promise.all(
      similarMeetings.map((m) =>
        store.websitesStore.getAllForSegment(
          m,
          store.domainBlocklistStore,
          store.websiteBlocklistStore,
        ),
      ),
    ),
  );

  // setup pin index
  const pinIndex: { [url: string]: boolean } = {};
  const pins = await store.websitePinStore.getAll();
  pins.map((p) => (pinIndex[p.id] = true));

  const urlCount: { [url: string]: number } = {};

  const currentUserDocuments = (
    await Promise.all(
      segmentDocumentsForMeeting.map(async (item) => {
        if (!item.documentId) {
          return null;
        }
        const document = await store.documentDataStore.getById(item.documentId);
        if (!document || !document.link) {
          return;
        }
        const link = `${document.link}`;
        if (urlCount[link]) {
          urlCount[link] = urlCount[link] + getValueForDate(item.date);
        } else {
          urlCount[link] = getValueForDate(item.date);
        }
        return {
          documentId: item.documentId,
          meetings: [meeting],
          nextMeetingStartsAt: undefined,
          websiteId: link,
          websiteDatabaseId: undefined as any,
          text: document.name,
          date: item.date,
          isPinned: pinIndex[link] ? true : false,
        } as IFeaturedWebsite;
      }),
    )
  ).filter(Boolean) as IFeaturedWebsite[];

  const websiteVisits = filteredWebsites.map((item) => {
    if (urlCount[item.url]) {
      urlCount[item.url] = urlCount[item.url] + getValueForDate(item.visitedTime);
    } else {
      urlCount[item.url] = getValueForDate(item.visitedTime);
    }
    return {
      documentId: item.documentId,
      meetings: [meeting],
      nextMeetingStartsAt: undefined,
      websiteId: item.url,
      websiteDatabaseId: item.id,
      text: item.title,
      date: item.visitedTime,
      isPinned: pinIndex[item.url] ? true : false,
    } as IFeaturedWebsite;
  });

  const concattedWebsitesAndDocuments = uniqBy(
    currentUserDocuments.concat(websiteVisits).sort((a, b) => (a.date > b.date ? -1 : 1)),
    'websiteId',
  );
  return concattedWebsitesAndDocuments.sort((a, b) =>
    urlCount[a.websiteId] > urlCount[b.websiteId] ? -1 : 1,
  ) as any;
};
