import { ITopWebsite } from '../../store/data-types';

interface VisitedSite {
  title: string;
  url: string;
  duration: number;
  visitedAt: Date;
}

const formatSite = (site: chrome.history.VisitItem, index: number): ITopWebsite => ({
  id: site.id,
  url: site.,
  title: site.title,
  order: index,
  isCustom: false,
  isHidden: false,
});

export const fetchHistory = (): Promise<ITopWebsite[]> => {
  if (!window['chrome'] || !window['chrome']['topSites']) {
    return [] as any;
  }

  return new Promise((resolve) => {
    chrome.history.getVisits('https://www.google.com' as any, (sites) => {
      resolve(sites.map((site, index) => formatSite(site, index)));
    });
  });
};
