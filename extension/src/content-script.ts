// Content script to extract Open Graph and meta data from web pages
// This runs in the context of each web page and can access the DOM

interface OpenGraphData {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  siteName?: string;
  type?: string;
}

const extractOpenGraphData = (): OpenGraphData => {
  const ogData: OpenGraphData = {};

  // Helper function to get meta content by property or name
  const getMetaContent = (selector: string): string | undefined => {
    const element = document.querySelector(selector) as HTMLMetaElement;
    return element?.content;
  };

  // Extract Open Graph data
  ogData.title =
    getMetaContent('meta[property="og:title"]') ||
    getMetaContent('meta[name="twitter:title"]') ||
    document.title;

  ogData.description =
    getMetaContent('meta[property="og:description"]') ||
    getMetaContent('meta[name="twitter:description"]') ||
    getMetaContent('meta[name="description"]');

  ogData.image =
    getMetaContent('meta[property="og:image"]') ||
    getMetaContent('meta[name="twitter:image"]') ||
    getMetaContent('meta[name="twitter:image:src"]');

  ogData.url = getMetaContent('meta[property="og:url"]') || window.location.href;

  ogData.siteName =
    getMetaContent('meta[property="og:site_name"]') ||
    getMetaContent('meta[name="application-name"]');

  ogData.type = getMetaContent('meta[property="og:type"]');

  return ogData;
};

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'extractOpenGraph') {
    try {
      const ogData = extractOpenGraphData();
      sendResponse({ success: true, data: ogData });
    } catch (error) {
      console.error('Error extracting Open Graph data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      sendResponse({ success: false, error: errorMessage });
    }
  }
  return true; // Keep the message channel open for async response
});

// Also extract data immediately when the script loads (for pages that are already loaded)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // Page is ready, data can be extracted if needed
  });
}
