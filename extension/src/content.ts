// This file is injected as a content script
console.log('Hello from content script!');

console.log(chrome.runtime.getURL('popup.js'));
