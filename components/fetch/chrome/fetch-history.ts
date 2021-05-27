import { flatten } from 'lodash';
import constants from '../../../constants/config';
import { IWebsite } from '../../store/data-types';

const formatSite = (site: chrome.history.HistoryItem): IWebsite => ({
  id: site.id,
  url: site.url!,
  title: site.title!,
  visitedTime: site.lastVisitTime ? new Date(site.lastVisitTime) : new Date(),
  domain: new URL(site.url!).host,
  isHidden: false,
});

export const fetchHistory = (domain: string): Promise<IWebsite[]> => {
  if (!window['chrome'] || !window['chrome']['topSites']) {
    return [] as any;
  }

  return new Promise((resolve) => {
    chrome.history.search(domain as any, (sites) => {
      resolve(sites.filter((site) => site.url && site.title).map((site) => formatSite(site)));
    });
  });
};

export const fetchAllHistory = async (): Promise<IWebsite[]> => {
  const websites = await Promise.all(constants.ALLOWED_DOMAINS.map((d) => fetchHistory(d)));
  return flatten(websites);
};
