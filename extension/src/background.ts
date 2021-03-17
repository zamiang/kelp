import db from '../../components/store/db';
import { IStore, setupStoreNoFetch } from '../../components/store/use-store';

let store: IStore;

const setup = async () => {
  const d = await db('production');
  store = setupStoreNoFetch(d);
};

const queryAndSendNotification = async () => {
  if (!store) {
    await setup();
  }
  const upNext = await store.timeDataStore.getUpNextSegment();
  console.log(upNext, '<<<<<<<<<<<<<<<<<<<');
  if (upNext) {
    chrome.runtime.sendMessage('', {
      type: 'notification',
      options: {
        title: `Prepare for: ${upNext.summary || 'Meeting notification'}`,
        message: 'test!',
        iconUrl: '/icon128.png',
        type: 'basic',
      },
    });
  }
};

setInterval(() => void queryAndSendNotification(), 1000 * 30);

chrome.runtime.onMessage.addListener((data) => {
  if (data.type === 'notification') {
    chrome.notifications.create('', data.options);
  }
});

chrome.runtime.onInstalled.addListener(() =>
  chrome.tabs.create({ url: 'https://www.kelp.nyc/about' }),
);

/*
import db from '../../components/store/db';
import { IStore, setupStoreNoFetch } from '../../components/store/use-store';
import config from '../../constants/config';
let store: IStore | undefined;

const createStore = async (token: string) => {
  const database = await db('production');
  store = setupStoreNoFetch(database, token, config.GOOGLE_SCOPES.join(' '));
  return store;
};

const setupStore = () => {
  if (store) {
    return store;
  }
  chrome.identity.getAuthToken({ interactive: true }, (token) => {
    if (chrome.runtime.lastError) {
      return null;
    } else {
      void createStore(token);
    }
  });
};

chrome.omnibox.onInputStarted.addListener(() => {
  console.log('setup: ');
  void setupStore();
});

// chrome.omnibox.setDefaultSuggestion({
//  description: 'Search for a person or document',
// });

// This event is fired each time the user updates the text in the omnibox,
// as long as the extension's keyword mode is still active.
chrome.omnibox.onInputChanged.addListener((text, suggest) => {
  console.log('inputchanged', text);
  const s = setupStore();
  try {
    if (s) {
      suggest([
        { content: ' one', description: 'the first one' },
        { content: ' number two', description: 'the second entry' },
      ]);
    }
  } catch (e) {
    console.log(e, '<<<<<<<<<<<');
  }
});

chrome.omnibox.onInputEntered.addListener((text) => {
  console.log(text, '<<<<<<<<<<<<');
  // chrome.tabs.update({ url });
});
*/
