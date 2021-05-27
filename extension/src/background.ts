import db from '../../components/store/db';
import setupStore, { IStore, setupStoreNoFetch } from '../../components/store/use-store';
import config from '../../constants/config';
import { trackerStart, trackerStop } from './tracker';

let store: IStore;
const notificationAlarmName = 'notification';
const refreshAlarmName = 'refresh';

const getOrCreateStore = async () => {
  if (store) {
    return store;
  }
  const d = await db('production');
  store = setupStoreNoFetch(d);
  return store;
};

const fetchDataAndCreateStore = async () => {
  const d = await db('production');
  store = setupStore(d, 'oauth-token', 'scope');
  return store;
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

chrome.notifications.onClicked.addListener(() => chrome.tabs.create({ url: `/dashboard.html` }));

const alarmListener = (alarm: chrome.alarms.Alarm) => void onAlarm(alarm);

const setupTimers = async () => {
  chrome.alarms.onAlarm.removeListener(alarmListener);
  chrome.alarms.onAlarm.addListener(alarmListener);
  return setAlarm();
};

const setAlarm = () => {
  chrome.alarms.clearAll();
  chrome.alarms.create(notificationAlarmName, { periodInMinutes: 1 });
  chrome.alarms.create(refreshAlarmName, { periodInMinutes: 60 });
};

const onAlarm = (alarm: chrome.alarms.Alarm) => {
  if (alarm.name === notificationAlarmName) {
    return queryAndSendNotification();
  } else if (alarm.name === refreshAlarmName) {
    return fetchDataAndCreateStore();
  }
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.tabs.create({ url: '/dashboard.html' });
  void setupTimers();
  void getOrCreateStore();
});

chrome.runtime.onSuspendCanceled.addListener(() => {
  void setupTimers();
  void getOrCreateStore();
});

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.meetingId) {
    chrome.tabs.create({ url: `/dashboard.html#/meetings/${request.meetingId}` });
    sendResponse({ success: true });
  }
  if (request.shouldRun) {
    trackerStart();
    sendResponse({ result: 'started' });
  }

  if (request.shouldStop) {
    trackerStop();
    sendResponse({ result: 'stopped' });
  }
});

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
