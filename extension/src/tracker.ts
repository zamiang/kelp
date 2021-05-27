import { IStore } from '../../components/store/use-store';
import constants from '../../constants/config';

const secIdleInterval = 5000;

const tick = (site: string, startAt: Date, store: IStore, title?: string) => {
  const url = new URL(site);
  const domain = url.host;
  const pathname = url.pathname;

  return store.websitesStore.trackVisit({
    startAt,
    domain,
    pathname,
    url: url.href,
    title,
  });
};

export const doTick = (store: IStore) => {
  console.log(store, 'dotick');
  chrome.idle.queryState(secIdleInterval, (state) => {
    chrome.windows.getLastFocused({ populate: true }, (window) => {
      if (chrome.runtime.lastError) {
        console.log(chrome.runtime.lastError.message);
      }

      if (!window) {
        return;
      }

      const tab = window.tabs?.filter((t) => t.highlighted)[0];
      if (tab && window.focused) {
        console.log(tab.favIconUrl, tab.title);
        const lastVisitedUrl = tab.url;
        const domain = new URL(lastVisitedUrl || '').host;
        const isDomainAllowed =
          constants.ALLOWED_DOMAINS.filter((d) => d.indexOf(domain) > -1).length > 0;
        if (lastVisitedUrl && isDomainAllowed) {
          console.log(state === 'active', 'is active??');
          void tick(lastVisitedUrl, new Date(), store, tab.title);
        }
      }
    });
  });
};
