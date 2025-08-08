import { cleanupUrl } from '../../components/shared/cleanup-url';
import db from '../../components/store/db';
import { useStoreNoFetch } from '../../components/store/helpers/use-store-no-fetching';
import { IStore } from '../../components/store/use-store';
import config from '../../constants/config';

let store: IStore | null = null;
const notificationAlarmName = 'notification';
const refreshAlarmName = 'refresh';
const timeToWaitBeforeTracking = 20 * 1000;

const ensureStoreReady = async (maxRetries = 3): Promise<IStore | null> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const storeInstance = await getOrCreateStore();
      if (storeInstance && storeInstance.websiteStore) {
        return storeInstance;
      }
    } catch (error) {
      console.error(`Store initialization attempt ${i + 1} failed:`, error);
    }

    if (i < maxRetries - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
    }
  }
  console.error('Failed to initialize store after all retries');
  return null;
};

const storeTrackedVisit = async (
  site: string,
  startAt: Date,
  store: IStore,
  title?: string,
  description?: string,
  ogImage?: string,
) => {
  // Add null checks before accessing store properties
  if (!store || !store.websiteStore || !store.websiteVisitStore || !store.timeDataStore) {
    console.error('Store or required store components are not available');
    throw new Error('Store not properly initialized');
  }

  const url = new URL(site);
  const domain = url.host;
  const pathname = url.pathname;

  try {
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
  } catch (error) {
    console.error('Error tracking visit:', error);
    throw error;
  }
};

const trackVisit = async (storeInstance: IStore | null, tab: chrome.tabs.Tab) => {
  if (!tab) {
    return;
  }

  const currentUrl = cleanupUrl(tab.url || '');
  const isDomainAllowed =
    config.BLOCKED_DOMAINS.filter((d) => currentUrl.indexOf(d) > -1).length < 1;
  if (!currentUrl || !isDomainAllowed || !tab.id) {
    return;
  }

  // Ensure we have a valid store before proceeding
  const validStore = storeInstance || (await ensureStoreReady());
  if (!validStore) {
    console.error('Unable to get valid store for tracking visit');
    return;
  }

  // use `var` to avoid redeclaration of const error when re-running in the same tab
  const getMetaInformation = () => {
    const metaDescription = document.querySelector("meta[name='description']");
    const metaDescriptionContent = metaDescription?.getAttribute('content');
    const metaTwitterDescription = document.querySelector("meta[name='twitter:description']");
    const metaTwitterDescriptionContent = metaTwitterDescription?.getAttribute('content');
    const metaOgUrl = document.querySelector("meta[name='og:url']");
    const metaOgUrlContent = metaOgUrl?.getAttribute('content');
    const metaOgImage = document.querySelector("meta[name='og:image']");
    const metaOgImageContent = metaOgImage?.getAttribute('content');
    return {
      metaDescriptionContent,
      metaTwitterDescriptionContent,
      metaOgUrlContent,
      metaOgImageContent,
    };
  };

  type metaInformation = ReturnType<typeof getMetaInformation>;
  const results = await chrome.scripting.executeScript({
    target: { tabId: tab.id, allFrames: false },
    func: getMetaInformation,
  });

  if (!results) {
    console.log('error');
    // An error occurred at executing the script. You've probably not got
    // the permission to execute a content script for the current tab
    return;
  }

  const result = (results[0]?.result || {}) as metaInformation;
  try {
    await captureVisibleTab(result.metaOgUrlContent || currentUrl);
  } catch (e) {
    console.log(e, 'failure to capture tab');
  }

  return storeTrackedVisit(
    result.metaOgUrlContent || currentUrl,
    new Date(),
    validStore,
    tab.title,
    result.metaTwitterDescriptionContent || result.metaDescriptionContent || undefined,
    result.metaOgImageContent || undefined,
  );
};

const getOrCreateStore = async () => {
  if (store) {
    return store;
  }
  const d = await db('production');
  if (!d) {
    throw new Error('Unable to connect to the database');
  }

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
  const s = useStoreNoFetch(d, false);
  if (s) {
    store = s;
    return store;
  }
  return store;
};

const captureVisibleTab = async (url: string) => {
  const image = await chrome.tabs.captureVisibleTab(null as any, {
    format: 'jpeg',
    quality: 1,
  });

  if (url && image) {
    const saveImage = async () => {
      const s = await getOrCreateStore();
      if (s) {
        await s.websiteImageStore.saveWebsiteImage(url, image, new Date());
      }
    };
    void saveImage();
  }
};

const queryAndSendNotification = async () => {
  const val = await chrome.storage.sync.get([config.NOTIFICATIONS_KEY]);
  if (!val[config.NOTIFICATIONS_KEY]) {
    await chrome.storage.sync.set({ [config.NOTIFICATIONS_KEY]: 'enabled' });
  }

  const currentVal = await chrome.storage.sync.get([config.NOTIFICATIONS_KEY]);
  if (currentVal[config.NOTIFICATIONS_KEY] === 'disabled') {
    return;
  }

  // Ensure we have a valid store before proceeding
  const validStore = store || (await ensureStoreReady());
  if (!validStore || !validStore.timeDataStore) {
    console.error('Unable to get valid store for notifications');
    return;
  }

  const lastSentNotificationId = (await chrome.storage.sync.get([config.LAST_NOTIFICATION_KEY]))[
    config.LAST_NOTIFICATION_KEY
  ];

  try {
    const upNext = await validStore.timeDataStore.getUpNextSegment();

    if (upNext && upNext.id !== lastSentNotificationId) {
      chrome.notifications.create(upNext.id, {
        title: `${upNext.summary || 'Meeting notification'}`,
        message: 'Click to see documents for this meeting and suggestions',
        iconUrl: '/icon128.png',
        type: 'basic',
        requireInteraction: false,
        eventTime: upNext.start.valueOf(),
      });
      return chrome.storage.sync.set({ [config.LAST_NOTIFICATION_KEY]: upNext.id });
    } else {
      return chrome.notifications.getAll((items) => {
        if (items) for (const key in items) chrome.notifications.clear(key);
      });
    }
  } catch (error) {
    console.error('Error in notification query:', error);
  }
};

chrome.notifications.onClicked.addListener(
  () => void chrome.tabs.create({ url: `/dashboard.html` }),
);

const alarmListener = (alarm: chrome.alarms.Alarm) => void onAlarm(alarm);

const setupTimers = () => {
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

chrome.idle.onStateChanged.addListener((state) => {
  if (state === 'active') {
    void setupTimers();
    void getOrCreateStore();
  } else {
    void chrome.alarms.clearAll();
  }
});

chrome.tabs.onHighlighted.addListener((highlightInfo: chrome.tabs.TabHighlightInfo) => {
  setTimeout(() => {
    const checkTab = async () => {
      const queryOptions = { active: true, currentWindow: true };
      const tabs = await chrome.tabs.query(queryOptions);
      const tab = tabs[0];
      if (tab && tab.url && tab.id == highlightInfo.tabIds[0]) {
        try {
          await trackVisit(store, tab);
        } catch (e) {
          console.error(e);
        }
      }
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

chrome.action.onClicked.addListener(() => {
  void chrome.tabs.create({ url: '/dashboard.html' });
});
