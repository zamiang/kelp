// This file is injected as a content script
console.log('Hello from content script!');

console.log(chrome.runtime.getURL('popup.js'));
content.js:1 chrome-extension://gbfdenngcdfndmphcbgmglinnfoegenj/popup.js