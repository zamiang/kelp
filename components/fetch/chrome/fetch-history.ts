import { flatten } from 'lodash';
import config from '../../../constants/config';
import { cleanupUrl } from '../../shared/cleanup-url';
import { IWebsite } from '../../store/data-types';

const formatSite = (site: chrome.history.HistoryItem): IWebsite => ({
  id: site.id,
  url: cleanupUrl(site.url!),
  rawUrl: site.url!,
  title: site.title!,
  visitedTime: site.lastVisitTime ? new Date(site.lastVisitTime) : new Date(),
  domain: new URL(site.url!).host,
});

const fetchHistory = (domain: string): Promise<IWebsite[]> =>
  new Promise((resolve) => {
    chrome.history.search(
      {
        text: domain,
        startTime: config.startDate.valueOf(),
      },
      (sites) => {
        resolve(
          sites
            .filter((site) => {
              const currentUrl = site.url;
              if (currentUrl) {
                const isDomainAllowed =
                  config.BLOCKED_DOMAINS.filter((d) => site.url && site.url.indexOf(d) > -1)
                    .length < 1;
                return isDomainAllowed && site.url && site.title;
              }
              return false;
            })
            .map((site) => formatSite(site)),
        );
      },
    );
  });

export const fetchAllHistory = async (): Promise<IWebsite[]> => {
  const websites = await Promise.all(config.ALLOWED_DOMAINS.map((d) => fetchHistory(d)));
  return flatten(websites);
};
