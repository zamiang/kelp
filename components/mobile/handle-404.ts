import { useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

const Handle404 = () => {
  const history = useHistory();
  const newURL = `https://www.kelp.nyc/dashboard${useLocation().pathname}`;
  useEffect(() => {
    if (chrome && chrome.tabs) {
      chrome.tabs.create({ url: newURL });
    } else {
      history.push(`/home`);
    }
  }, [newURL]);

  return null;
};

export default Handle404;
