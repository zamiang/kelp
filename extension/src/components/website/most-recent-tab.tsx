import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import React, { useEffect, useState } from 'react';
import '../../styles/components/website/most-recent-tab.css';

export const MostRecentTab = () => {
  const [tab, setTab] = useState<chrome.tabs.Tab | undefined>();

  useEffect(() => {
    chrome.tabs.query(
      {
        active: false,
      },
      (tabs) => {
        const tab = tabs
          .filter((t) => t.url && !t.url.includes('chrome://'))
          .reduce((previous: any, current: any) =>
            previous?.lastAccessed > current?.lastAccessed ? previous : current,
          );
        if (tab) {
          setTab(tab);
        }
      },
    );
  }, []);

  if (!tab) {
    return null;
  }

  return (
    <div className="most-recent-tab">
      <div className="most-recent-tab__tab">
        <div className="most-recent-tab__image-container">
          <Link href={tab.url}>
            <img className="most-recent-tab__favicon" src={tab.favIconUrl} height="18" width="18" />
          </Link>
        </div>
        <div className="most-recent-tab__text-container">
          <Link href={tab.url} underline="hover">
            <Typography noWrap variant="body2" className="most-recent-tab__text">
              {tab.title}
            </Typography>
          </Link>
        </div>
      </div>
    </div>
  );
};
