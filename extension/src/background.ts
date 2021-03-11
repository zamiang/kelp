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

// chrome.runtime.onInstalled.addListener(() => {
//  const url = chrome.runtime.getURL('https://www.kelp.nyc');
//  return chrome.tabs.create({ url });
//});

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
