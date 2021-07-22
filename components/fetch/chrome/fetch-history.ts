import { flatten } from 'lodash';
import constants from '../../../constants/config';
import { cleanupUrl } from '../../shared/cleanup-url';
import { IWebsite } from '../../store/data-types';

const formatSite = (site: chrome.history.HistoryItem): IWebsite => ({
  id: site.id,
  url: cleanupUrl(site.url!),
  rawUrl: site.url!,
  title: site.title!,
  visitedTime: site.lastVisitTime ? new Date(site.lastVisitTime) : new Date(),
  domain: new URL(site.url!).host,
  isHidden: false,
});

const fetchHistory = (domain: string): Promise<IWebsite[]> =>
  new Promise((resolve) => {
    chrome.history.search(
      {
        text: domain,
        startTime: constants.startDate.valueOf(),
      },
      (sites) => {
        resolve(
          sites
            .filter((site) => {
              const isDomainAllowed =
                constants.BLOCKED_DOMAINS.filter((d) => site.url && site.url.indexOf(d) > -1)
                  .length < 1;
              return isDomainAllowed && site.url && site.title;
            })
            .map((site) => formatSite(site)),
        );
      },
    );
  });

export const fetchAllHistory = async (): Promise<IWebsite[]> => {
  const websites = await Promise.all(constants.ALLOWED_DOMAINS.map((d) => fetchHistory(d)));
  return flatten(websites);
};
