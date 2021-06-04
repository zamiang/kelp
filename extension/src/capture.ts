const capturePage = async () => {
  chrome.runtime.sendMessage({ message: 'capture', url: window.location.href });
};

setTimeout(() => void capturePage(), 3000);
