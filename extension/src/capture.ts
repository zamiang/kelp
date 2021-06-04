import { cleanupUrl } from '../../components/shared/cleanup-url';
import { getOrCreateStore } from './background';

const capturePage = async () => {
  const store = await getOrCreateStore();
  chrome.tabs.captureVisibleTab(
    null as any,
    {
      format: 'jpeg',
      quality: 50,
    },
    (image) => {
      void store.websiteImageStore.saveWebsiteImage(
        cleanupUrl(window.location.href),
        image,
        new Date(),
      );
    },
  );
};

setTimeout(() => void capturePage(), 3000);
