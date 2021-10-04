import { cleanupUrl } from '../../components/shared/cleanup-url';
import db from '../../components/store/db';
import setupStore, { IStore, useStoreNoFetch } from '../../components/store/use-store';
import config from '../../constants/config';

let store: IStore;
const notificationAlarmName = 'notification';
const refreshAlarmName = 'refresh';
const timeToWaitBeforeTracking = 20 * 1000;

const storeTrackedVisit = async (
  site: string,
  startAt: Date,
  store: IStore,
  title?: string,
  description?: string,
  ogImage?: string,
) => {
  const url = new URL(site);
  const domain = url.host;
  const pathname = url.pathname;

  await store.websiteStore.trackVisit({
    domain,
    pathname,
    url: url.href,
    title,
    description,
    ogImage,
  });
  return store.websiteVisitStore.trackVisit(
    {
      startAt,
      url: url.href,
      domain,
    },
    store.timeDataStore,
  );
};

const trackVisit = (store: IStore, tab: chrome.tabs.Tab) => {
  if (tab) {
    const currentUrl = cleanupUrl(tab.url || '');
    const isDomainAllowed =
      config.BLOCKED_DOMAINS.filter((d) => currentUrl.indexOf(d) > -1).length < 1;
    if (currentUrl && isDomainAllowed && tab.id) {
      const code = `
      const metaDescription = document.querySelector("meta[name='description']");
        const metaDescriptionContent = metaDescription?.getAttribute("content");
        const metaTwitterDescription = document.querySelector("meta[name='twitter:description']");
        const metaTwitterDescriptionContent = metaTwitterDescription?.getAttribute("content");
        const metaOgUrl = document.querySelector("meta[name='og:url']");
        const metaOgUrlContent = metaOgUrl?.getAttribute("content");
        const metaOgImage = document.querySelector("meta[name='og:image']");
        const metaOgImageContent = metaOgUrl?.getAttribute("content");
        ({
          metaDescriptionContent, metaTwitterDescriptionContent, metaOgUrlContent, metaOgImageContent
        });`;
      void chrome.tabs.executeScript(
        tab.id,
        {
          code,
        },
        (results) => {
          if (!results) {
            console.log('error');
            // An error occurred at executing the script. You've probably not got
            // the permission to execute a content script for the current tab
            return;
          }
          const result = results[0] || ({} as any);
          captureVisibleTab(result.metaOgUrlContent || currentUrl);
          return void storeTrackedVisit(
            result.metaOgUrlContent || currentUrl,
            new Date(),
            store,
            tab.title,
            result.metaTwitterDescriptionContent || result.metaDescriptionContent,
            result.metaOgImageContent,
          );
          // Now, do something with result.title and result.description
        },
      );
    }
  }
};

const getOrCreateStore = async () => {
  if (store) {
    return store;
  }
  const d = await db('production');
  if (!d) {
    throw new Error('Unable to connect to the database');
  }
  // eslint-disable-next-line
  const s = useStoreNoFetch(d, true);
  if (s) {
    store = s;
    return store;
  }
};

const fetchDataAndCreateStore = async () => {
  if (store) {
    return store;
  }

  const d = await db('production');
  if (!d) {
    throw new Error('unable to connect');
  }
  const s = setupStore(false, d, 'oauth-token', 'scope');
  if (s) {
    store = s;
    return store;
  }
  return store;
};

const captureVisibleTab = (url: string) => {
  chrome.tabs.captureVisibleTab(
    null as any,
    {
      format: 'jpeg',
      quality: 5,
    },
    (image) => {
      if (url && image) {
        const saveImage = async () => {
          const s = await getOrCreateStore();
          if (s) {
            await s.websiteImageStore.saveWebsiteImage(url, image, new Date());
          }
        };
        void saveImage();
      }
    },
  );
};

const queryAndSendNotification = async () => {
  if (!localStorage.getItem(config.NOTIFICATIONS_KEY)) {
    localStorage.setItem(config.NOTIFICATIONS_KEY, 'enabled');
  }

  const isEnabled = localStorage.getItem(config.NOTIFICATIONS_KEY) !== 'disabled';
  if (!isEnabled) {
    return;
  }

  if (!store) {
    await getOrCreateStore();
  }

  const lastSentNotificationId = localStorage.getItem(config.LAST_NOTIFICATION_KEY);
  const upNext = await store.timeDataStore.getUpNextSegment();

  if (upNext && upNext.id !== lastSentNotificationId) {
    chrome.notifications.create(upNext.id, {
      title: `${upNext.summary || 'Meeting notification'}`,
      message: 'Click to see documents for this meeting and suggestions',
      iconUrl: '/icon128.png',
      type: 'basic',
      requireInteraction: false,
      eventTime: upNext.start.valueOf(),
    });
    localStorage.setItem(config.LAST_NOTIFICATION_KEY, upNext.id);
  } else {
    chrome.notifications.getAll((items) => {
      if (items) for (const key in items) chrome.notifications.clear(key);
    });
  }
};

chrome.notifications.onClicked.addListener(
  () => void chrome.tabs.create({ url: `/dashboard.html` }),
);

const alarmListener = (alarm: chrome.alarms.Alarm) => void onAlarm(alarm);

const setupTimers = async () => {
  chrome.alarms.onAlarm.removeListener(alarmListener);
  chrome.alarms.onAlarm.addListener(alarmListener);
  return setAlarm();
};

const setAlarm = () => {
  void chrome.alarms.clearAll();
  chrome.alarms.create(notificationAlarmName, { periodInMinutes: 1 });
  chrome.alarms.create(refreshAlarmName, { periodInMinutes: 60 });
};

const onAlarm = (alarm: chrome.alarms.Alarm) => {
  switch (alarm.name) {
    case notificationAlarmName: {
      return queryAndSendNotification();
    }
    case refreshAlarmName: {
      return fetchDataAndCreateStore();
    }
  }
};

chrome.runtime.onInstalled.addListener(() => {
  void setupTimers();
  void getOrCreateStore();
});

chrome.runtime.onSuspendCanceled.addListener(() => {
  void setupTimers();
  void getOrCreateStore();
});

chrome.tabs.onHighlighted.addListener((highlightInfo: chrome.tabs.TabHighlightInfo) => {
  setTimeout(() => {
    const checkTab = async () => {
      const queryOptions = { active: true, currentWindow: true };
      chrome.tabs.query(queryOptions, (result: chrome.tabs.Tab[]) => {
        const tab = result[0];
        if (tab && tab.url && tab.id == highlightInfo.tabIds[0]) {
          try {
            trackVisit(store, tab);
          } catch (e) {
            console.error(e);
          }
        }
      });
    };
    void checkTab();
  }, timeToWaitBeforeTracking);
});

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.meetingId) {
    void chrome.tabs.create({ url: `/dashboard.html#/meetings/${request.meetingId}` });
    sendResponse({ success: true });
    return true;
  }
});

chrome.browserAction.onClicked.addListener(() => {
  void chrome.tabs.create({ url: '/dashboard.html' });
});
