import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const Handle404 = () => {
  const newURL = `https://www.kelp.nyc/dashboard${useLocation().pathname}`;
  useEffect(() => {
    chrome.tabs.create({ url: newURL });
  }, [newURL]);

  return null;
};

export default Handle404;
