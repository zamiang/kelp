export const cleanupUrl = (url: string) => {
  if (url.includes('news.ycombinator.com')) {
    return url;
  }
  return url.split('?')[0].split('#')[0];
};
