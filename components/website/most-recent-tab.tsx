import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import React, { useEffect, useState } from 'react';

const PREFIX = 'MostRecentTab';

const classes = {
  tab: `${PREFIX}-tab`,
  text: `${PREFIX}-text`,
  textContainer: `${PREFIX}-textContainer`,
  imageContainer: `${PREFIX}-imageContainer`,
};

const Root = styled('div')(({ theme }) => ({
  [`& .${classes.tab}`]: {
    padding: theme.spacing(1),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingBottom: theme.spacing(0.5),
    borderRadius: 50,
    background: theme.palette.background.paper,
    marginBottom: theme.spacing(6),
    display: 'flex',
    opacity: 1,
    transition: 'opacity 0.3s',
    '&:hover': { opacity: 0.7 },
  },
  [`& .${classes.text}`]: { color: theme.palette.text.primary },
  [`& .${classes.imageContainer}`]: {
    marginRight: theme.spacing(1),
    display: 'inline-block',
    verticalAlign: 'top',
    marginTop: 1,
  },
  [`& .${classes.textContainer}`]: {
    display: 'inline-block',
    verticalAlign: 'top',
    maxWidth: 140,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}));

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
    <Root>
      <div className={classes.tab}>
        <div className={classes.imageContainer}>
          <Link href={tab.url}>
            <img style={{ display: 'block' }} src={tab.favIconUrl} height="18" width="18" />
          </Link>
        </div>
        <div className={classes.textContainer}>
          <Link href={tab.url} underline="hover">
            <Typography noWrap variant="body2" className={classes.text}>
              {tab.title}
            </Typography>
          </Link>
        </div>
      </div>
    </Root>
  );
};
