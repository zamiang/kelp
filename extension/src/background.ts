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
  if (upNext) {
    chrome.notifications.create(upNext.id, {
      title: `Prepare for: ${upNext.summary || 'Meeting notification'}`,
      message: 'test!',
      iconUrl: '/icon128.png',
      type: 'basic',
    });
  }
};

setInterval(() => void queryAndSendNotification(), 1000 * 30);

chrome.runtime.onInstalled.addListener(() =>
  chrome.tabs.create({ url: 'https://www.kelp.nyc/about' }),
);

/*
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
