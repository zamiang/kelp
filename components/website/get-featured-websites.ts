import { flatten, uniqBy } from 'lodash';
import config from '../../constants/config';
import { getValueForDate } from '../shared/order-by-count';
import { IDocument, ISegment, IWebsiteItem } from '../store/data-types';
import { IStore } from '../store/use-store';

export const fetchWebsitesForMeetingFiltered = async (
  meeting: ISegment,
  store: IStore,
  shouldShowAll: boolean,
  maxWebsites: number,
  setWebsites?: (websites: IFeaturedWebsite[]) => void,
  setExtraItemsCount?: (n: number) => void,
  isSubscribed?: boolean,
) => {
  const maxDisplay = maxWebsites * 10;
  const filteredWebsites = await getWebsitesForMeeting(meeting, store);

  if (setExtraItemsCount) {
    isSubscribed && setExtraItemsCount(filteredWebsites.length - maxWebsites);
  }
  const websites = shouldShowAll
    ? filteredWebsites.slice(0, maxDisplay)
    : filteredWebsites.slice(0, maxWebsites);
  if (setWebsites) {
    isSubscribed && setWebsites(websites);
  } else {
    return websites;
  }
};

export interface IFeaturedWebsite {
  documentId?: string;
  id: string;
  rawUrl: string;
  document?: IDocument;
  meetings: ISegment[];
  lastVisited: Date;
  visitCount: number;
}

export interface IWebsiteCacheItem extends IWebsiteItem {
  document?: IDocument;
  meetings: ISegment[];
  lastVisited: Date;
  visitCount: number;
}

export type IWebsiteCache = {
  [websiteId: string]: IWebsiteCacheItem;
};

// Gets websites in order of which are visited the most
export const getWebsitesCache = async (
  websiteVisitStore: IStore['websiteVisitStore'],
  websiteStore: IStore['websiteStore'],
  domainBlocklistStore: IStore['domainBlocklistStore'],
  websiteBlocklistStore: IStore['websiteBlocklistStore'],
) => {
  const websiteCache: { [websiteId: string]: IWebsiteCacheItem } = {};

  const websitesResult = await websiteStore.getAllFiltered(
    domainBlocklistStore,
    websiteBlocklistStore,
  );
  const websites = websitesResult.success ? websitesResult.data.data : [];

  const websiteVisitsResult = await websiteVisitStore.getAllFiltered(
    domainBlocklistStore,
    websiteBlocklistStore,
  );
  const websiteVisits = websiteVisitsResult.success ? websiteVisitsResult.data.data : [];

  // Initialize website cache with base data
  websites.forEach(
    (w) =>
      (websiteCache[w.id] = { ...w, meetings: [], visitCount: 0, lastVisited: config.startDate }),
  );

  // Group visits by website and date for proper aggregation
  const visitsByWebsite = new Map<
    string,
    Map<string, { visits: number; meetings: Set<string>; lastVisit: Date }>
  >();

  websiteVisits.forEach((visit) => {
    if (!websiteCache[visit.websiteId]) return;

    const dateKey = visit.visitedTime.toDateString();

    if (!visitsByWebsite.has(visit.websiteId)) {
      visitsByWebsite.set(visit.websiteId, new Map());
    }

    const websiteVisits = visitsByWebsite.get(visit.websiteId)!;

    if (!websiteVisits.has(dateKey)) {
      websiteVisits.set(dateKey, {
        visits: 0,
        meetings: new Set(),
        lastVisit: visit.visitedTime,
      });
    }

    const dayData = websiteVisits.get(dateKey)!;
    dayData.visits += 1;

    if (visit.segmentId) {
      dayData.meetings.add(visit.segmentId);
    }

    // Keep the latest visit time for this day
    if (visit.visitedTime > dayData.lastVisit) {
      dayData.lastVisit = visit.visitedTime;
    }
  });

  // Calculate aggregated scores and metadata for each website
  visitsByWebsite.forEach((dailyVisits, websiteId) => {
    if (!websiteCache[websiteId]) return;

    let totalScore = 0;
    let mostRecentVisit = config.startDate;
    const allMeetingIds = new Set<string>();
    const visitDays = dailyVisits.size;

    // Process each day's visits
    dailyVisits.forEach((dayData, dateKey) => {
      const visitDate = new Date(dateKey);

      // Apply decay function to daily visit count (not individual visits)
      const dailyScore = dayData.visits * getValueForDate(visitDate);
      totalScore += dailyScore;

      // Track most recent visit across all days
      if (dayData.lastVisit > mostRecentVisit) {
        mostRecentVisit = dayData.lastVisit;
      }

      // Collect all unique meeting IDs
      dayData.meetings.forEach((meetingId) => allMeetingIds.add(meetingId));
    });

    // Add frequency bonus for websites visited on multiple days
    if (visitDays > 1) {
      const consistencyBonus = Math.log(visitDays) * 0.1;
      totalScore *= 1 + consistencyBonus;
    }

    // Add recency bonus for very recent visits (within last 3 days)
    const daysSinceLastVisit = Math.floor(
      (new Date().getTime() - mostRecentVisit.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (daysSinceLastVisit <= 3) {
      const recencyBonus = (4 - daysSinceLastVisit) * 0.05; // 5-15% bonus
      totalScore *= 1 + recencyBonus;
    }

    // Update cache with aggregated data
    websiteCache[websiteId].visitCount = Math.round(totalScore * 100) / 100; // Round to 2 decimal places
    websiteCache[websiteId].lastVisited = mostRecentVisit;
    // For now, store empty array for meetings since we only have IDs and would need to fetch full ISegment objects
    // This is acceptable since the components don't actually use the meetings property directly
    websiteCache[websiteId].meetings = [];
  });

  return websiteCache;
};

/*
const getWebsitesForTags = async (store: IStore, tags: string[]) => {
  // likley will be slow
  const websites = await getFeaturedWebsites(store);
  if (tags.length < 1) {
    return [];
  }
  return websites.filter((item) => {
    if (item.cleanText) {
      for (const t of tags) {
        if (item.cleanText.includes(t)) {
          return true;
        }
      }
    }
    return false;
  });
};
*/

/**
 * Gets websites in the featured section by looking through meetings for the coming week
 * Finds meeetings documents associated with those meetings
 * It sorts in decending order so upcoming meetings are next

const getFeaturedWebsites = async (props: IStore) => {
  // For documents edited by the current user that may not be associated with a meeting
  const filteredWebsites = await props.websiteVisitStore.getAll(
    props.domainBlocklistStore,
    props.websiteBlocklistStore,
  );

  const urlCount: { [url: string]: number } = {};

  const websiteVisits = filteredWebsites.map((item) => {
    if (urlCount[item.websiteId]) {
      urlCount[item.websiteId] = urlCount[item.websiteId] + getValueForDate(item.visitedTime);
    } else {
      urlCount[item.websiteId] = getValueForDate(item.visitedTime);
    }
    return {
      meetings: item.segmentId ? [item.segmentId] : ([] as any),
      nextMeetingStartsAt: undefined,
      id: item.websiteId,
      rawUrl: item.url,
      lastVisited: item.visitedTime,
      visitCount: urlCount[item.websiteId],
    } as IFeaturedWebsite;
  });

  const websites = uniqBy(
    websiteVisits.sort((a, b) => (a.lastVisited > b.lastVisited ? -1 : 1)),
    'id',
  );

  return websites.sort((a, b) => (urlCount[a.id] > urlCount[b.id] ? -1 : 1));
};
*/

/**
 * Gets websites in the meeting
 * TODO: ensure this pulls from the description
 */
export const getWebsitesForMeeting = async (
  meeting: ISegment,
  store: IStore,
): Promise<IFeaturedWebsite[]> => {
  const similarMeetingsResult = await store.timeDataStore.getSegmentsForName(meeting.summary || '');
  const similarMeetings = similarMeetingsResult.success ? similarMeetingsResult.data : [];

  const segmentDocumentsForMeeting = flatten(
    await Promise.all(
      similarMeetings.map(async (m) => {
        const result2 = await store.segmentDocumentStore.getAllForSegment(m);
        return result2 ? result2.filter((s) => s.isPersonAttendee) : [];
      }),
    ),
  );

  // For documents edited by the current user that may not be associated with a meeting
  const filteredWebsitesResults = await Promise.all(
    similarMeetings.map((m) =>
      store.websiteVisitStore.getAllForSegment(
        m,
        store.domainBlocklistStore,
        store.websiteBlocklistStore,
      ),
    ),
  );

  const filteredWebsites = flatten(
    filteredWebsitesResults
      .filter((result) => result.success)
      .map((result) => (result.success ? result.data.data : [])),
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
        const link = document.link;
        if (urlCount[link]) {
          urlCount[link] = urlCount[link] + getValueForDate(item.date);
        } else {
          urlCount[link] = getValueForDate(item.date);
        }
        return {
          documentId: item.documentId,
          meetings: [meeting],
          nextMeetingStartsAt: undefined,
          id: link,
          rawUrl: link,
          lastVisited: item.date,
          isPinned: pinIndex[link] ? true : false,
          visitCount: urlCount[link],
        } as IFeaturedWebsite;
      }),
    )
  ).filter(Boolean) as IFeaturedWebsite[];

  const websiteVisits = filteredWebsites.map((item: any) => {
    if (urlCount[item.url]) {
      urlCount[item.url] = urlCount[item.url] + getValueForDate(item.visitedTime);
    } else {
      urlCount[item.url] = getValueForDate(item.visitedTime);
    }
    return {
      meetings: [meeting],
      nextMeetingStartsAt: undefined,
      id: item.websiteId,
      rawUrl: item.url,
      lastVisited: item.visitedTime,
      isPinned: pinIndex[item.url] ? true : false,
      visitCount: urlCount[item.url],
    } as IFeaturedWebsite;
  });

  const concattedWebsitesAndDocuments = uniqBy(
    currentUserDocuments
      .concat(websiteVisits)
      .sort((a, b) => (a.lastVisited > b.lastVisited ? -1 : 1)),
    'id',
  );
  return concattedWebsitesAndDocuments.sort((a, b) =>
    urlCount[a.id] > urlCount[b.id] ? -1 : 1,
  ) as any;
};
