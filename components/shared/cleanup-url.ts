export const cleanupUrl = (url: string) => {
  if (url.includes('news.ycombinator.com')) {
    return url;
  }
  if (url.includes('microsoft.com')) {
    return url;
  }
  if (url.includes('sharepoint.com')) {
    return url;
  }
  if (url.includes('azure.com')) {
    return url;
  }
  if (url.includes('notion.so')) {
    return url;
  }
  if (url.includes('jira')) {
    return url;
  }
  if (url.includes('atlassian.net')) {
    return url;
  }
  return url.split('?')[0].split('#')[0];
};
