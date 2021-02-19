chrome.tabs.onUpdated.addListener((_tabId, _changeInfo, tab) => {
  console.log(tab);
});
// https://developer.chrome.com/docs/extensions/reference/browserAction/#method-setBadgeText
// chrome.browserAction.setBadgeText({ text: '2' });
