import db from '../../components/store/db';
import { IStore, setupStoreNoFetch } from '../../components/store/use-store';
import config from '../../constants/config';

let store: IStore;
const alarmName = 'autostart';

const getOrCreateStore = async () => {
  if (store) {
    return store;
  }
  const d = await db('production');
  store = setupStoreNoFetch(d);
  return store;
};

const queryAndSendNotification = async () => {
  if (!localStorage.getItem(config.kelpNotificationsKey)) {
    localStorage.setItem(config.kelpNotificationsKey, 'true');
  }

  const isEnabled = localStorage.getItem(config.kelpNotificationsKey) === 'true';
  if (!isEnabled) {
    return;
  }

  if (!store) {
    await getOrCreateStore();
  }

  const upNext = await store.timeDataStore.getUpNextSegment();

  if (upNext) {
    chrome.notifications.create(upNext.id, {
      title: `${upNext.summary || 'Meeting notification'}`,
      message: 'Click to see documents for this meeting and suggestions',
      iconUrl: '/icon128.png',
      type: 'basic',
      requireInteraction: false,
      eventTime: upNext.start.valueOf(),
    });
  } else {
    chrome.notifications.getAll((items) => {
      if (items) for (const key in items) chrome.notifications.clear(key);
    });
  }
};

chrome.notifications.onClicked.addListener(() => chrome.tabs.create({ url: `/dashboard.html` }));

const setupTimers = async () => {
  chrome.alarms.onAlarm.addListener((alarm) => void onAlarm(alarm));
  return setAlarm();
};

const setAlarm = () => {
  chrome.alarms.clearAll();
  return chrome.alarms.create(alarmName, { periodInMinutes: 1 });
};

const onAlarm = (alarm: chrome.alarms.Alarm) => {
  if (alarm.name !== alarmName) {
    return;
  }

  return queryAndSendNotification();
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.tabs.create({ url: 'https://www.kelp.nyc/about' });
  void setupTimers();
});

chrome.runtime.onSuspendCanceled.addListener(() => {
  void setupTimers();
});

void setupTimers();

/*
const suggestResults = async (
  text: string,
  suggest: (items: chrome.omnibox.SuggestResult[]) => void,
) => {
  console.log('inputchanged', text);

  const store = await getOrCreateStore();
  if (store) {
    suggest([
      { content: ' one', description: 'the first one' },
      { content: ' number two', description: 'the second entry' },
    ]);
  }
};

chrome.omnibox.setDefaultSuggestion({
  description: 'Search for a person or document',
});

// This event is fired each time the user updates the text in the omnibox,
// as long as the extension's keyword mode is still active.
chrome.omnibox.onInputChanged.addListener((text, suggest) => void suggestResults(text, suggest));

chrome.omnibox.onInputEntered.addListener((text) => {
  console.log(text, '<<<<<<<<<<<<');
});
*/
