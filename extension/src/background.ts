import { cleanupUrl } from '../../components/shared/cleanup-url';
import db from '../../components/store/db';
import setupStore, { IStore, setupStoreNoFetch } from '../../components/store/use-store';
import config from '../../constants/config';

let store: IStore;
const notificationAlarmName = 'notification';
const refreshAlarmName = 'refresh';
const timeToWaitBeforeTracking = 60 * 1000;
const timeToWaitBeforeCapture = 8 * 1000;

const storeTrackedVisit = (site: string, startAt: Date, store: IStore, title?: string) => {
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

const trackVisit = (store: IStore, tab: chrome.tabs.Tab) => {
  if (tab) {
    const currentUrl = cleanupUrl(tab.url || '');
    const isDomainAllowed =
      config.BLOCKED_DOMAINS.filter((d) => currentUrl.indexOf(d) > -1).length < 1;
    if (currentUrl && isDomainAllowed) {
      // remove query params and hash
      void storeTrackedVisit(currentUrl, new Date(), store, tab.title);
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
  const s = setupStoreNoFetch(d);
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
  const s = setupStore(d, 'oauth-token', 'scope');
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
      quality: 1,
    },
    (image) => {
      const cleanedUrl = cleanupUrl(url);

      if (cleanedUrl && image) {
        const saveImage = async () => {
          const s = await getOrCreateStore();
          if (s) {
            await s.websiteImageStore.saveWebsiteImage(cleanedUrl, image, new Date());
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
  void chrome.tabs.create({ url: '/dashboard.html' });
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

  setTimeout(() => {
    const checkTab = async () => {
      const queryOptions = { active: true, currentWindow: true };
      chrome.tabs.query(queryOptions, (result: chrome.tabs.Tab[]) => {
        const tab = result[0];
        if (tab && tab.url && tab.id == highlightInfo.tabIds[0]) {
          try {
            captureVisibleTab(tab.url);
          } catch (e) {
            console.error(e);
          }
        }
      });
    };
    void checkTab();
  }, timeToWaitBeforeCapture);
});

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.meetingId) {
    void chrome.tabs.create({ url: `/dashboard.html#/meetings/${request.meetingId}` });
    sendResponse({ success: true });
    return true;
  }
});
