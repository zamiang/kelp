import { ITopWebsite } from '../../store/data-types';

interface MostVisitedSite {
  title: string;
  url: string;
}

const formatSite = (site: MostVisitedSite, index: number): ITopWebsite => ({
  id: site.url,
  url: site.url,
  title: site.title,
  order: index,
  isCustom: false,
  isHidden: false,
});

export const fetchTopSites = (): Promise<ITopWebsite[]> => {
  if (!window['chrome'] || !window['chrome']['topSites']) {
    return [] as any;
  }

  return new Promise((resolve) => {
    chrome.topSites.get((sites) => {
      resolve(sites.map((site, index) => formatSite(site, index)));
    });
  });
};
