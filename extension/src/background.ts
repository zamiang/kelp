import { cleanupUrl } from '../../components/shared/cleanup-url';
import db from '../../components/store/db';
import { useStoreNoFetch } from '../../components/store/helpers/use-store-no-fetching';
import { IStore } from '../../components/store/use-store';
import config from '../../constants/config';

let store: IStore | null = null;
const refreshAlarmName = 'refresh';
const timeToWaitBeforeTracking = 12 * 1000;

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

// Helper function to extract Open Graph data using content script
const extractOpenGraphData = async (
  tabId: number,
): Promise<{
  title?: string;
  description?: string;
  image?: string;
} | null> => {
  try {
    const response = await chrome.tabs.sendMessage(tabId, { action: 'extractOpenGraph' });
    if (response && response.success) {
      return {
        title: response.data.title,
        description: response.data.description,
        image: response.data.image,
      };
    }
  } catch (error) {
    console.log('Content script not available or failed to extract data:', error);
  }
  return null;
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

  try {
    await captureVisibleTab(currentUrl);
  } catch (e) {
    console.log(e, 'failure to capture tab');
  }

  // Try to extract Open Graph data using content script
  const ogData = await extractOpenGraphData(tab.id);

  if (ogData) {
    const title = ogData.title || tab.title;
    const description = ogData.description;
    const imageUrl = ogData.image;
    return storeTrackedVisit(currentUrl, new Date(), validStore, title, description, imageUrl);
  } else {
    // Fallback to just using tab title if content script fails
    return storeTrackedVisit(currentUrl, new Date(), validStore, tab.title);
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
  const image = await chrome.tabs.captureVisibleTab({
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

const alarmListener = (alarm: chrome.alarms.Alarm): void => void onAlarm(alarm);

const setupTimers = () => {
  chrome.alarms.onAlarm.removeListener(alarmListener);
  chrome.alarms.onAlarm.addListener(alarmListener);
  return setAlarm();
};

const setAlarm = () => {
  void chrome.alarms.clearAll();
  chrome.alarms.create(refreshAlarmName, { periodInMinutes: 60 });
};

const onAlarm = (alarm: chrome.alarms.Alarm) => {
  switch (alarm.name) {
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

chrome.tabs.onHighlighted.addListener((highlightInfo): void => {
  setTimeout((): void => {
    const checkTab = async (): Promise<void> => {
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

chrome.action.onClicked.addListener((): void => {
  void chrome.tabs.create({ url: '/dashboard.html' });
});
