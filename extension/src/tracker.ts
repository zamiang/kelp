import { cleanupUrl } from '../../components/shared/cleanup-url';
import { IStore } from '../../components/store/use-store';
import constants from '../../constants/config';

const secIdleInterval = 60 * 1000;
let lastVisitedUrl: string | undefined;

const tick = (site: string, startAt: Date, store: IStore, title?: string) => {
  const url = new URL(site);
  const domain = url.host;
  const pathname = url.pathname;

  return store.websitesStore.trackVisit(
    {
      startAt,
      domain,
      pathname,
      url: url.href,
      title,
    },
    store.timeDataStore,
  );
};

export const doTick = (store: IStore) => {
  chrome.idle.queryState(secIdleInterval, (state) => {
    if (state !== 'active') {
      return;
    }
    chrome.windows.getLastFocused({ populate: true }, (window) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
      }

      if (!window) {
        return;
      }

      const tab = window.tabs?.filter((t) => t.highlighted)[0];
      if (tab && window.focused) {
        const currentUrl = cleanupUrl(tab.url || '');
        const domain = new URL(currentUrl || '').host;
        if (currentUrl !== lastVisitedUrl) {
          lastVisitedUrl = currentUrl;
          return;
        }

        const isDomainAllowed =
          constants.BLOCKED_DOMAINS.filter((d) => d.indexOf(domain) > -1).length < 1;
        if (currentUrl && isDomainAllowed) {
          // remove query params and hash
          void tick(currentUrl, new Date(), store, tab.title);
        }
      }
    });
  });
};
