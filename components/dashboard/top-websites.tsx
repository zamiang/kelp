import React, { useEffect, useState } from 'react';
import panelStyles from '../shared/panel-styles';
import { IWebsite } from '../store/data-types';
import { IStore } from '../store/use-store';
import { WebsiteRow } from '../website/website-row';

const WebsiteItem = (props: { website: IWebsite; index: number; store: IStore }) => (
  <div key={props.website.id}>
    <WebsiteRow website={props.website} store={props.store} />
  </div>
);

const WebsitesMemo = React.memo(function QuoteList({ websites, store }: any) {
  return websites.map((website: IWebsite, index: number) => (
    <WebsiteItem key={website.id} website={website} index={index} store={store} />
  ));
});

const TopWebsiteList = (props: { store: IStore }) => {
  const [topWebsites, setTopWebsites] = useState<IWebsite[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const ws = await props.store.websitesStore.getAll();
      setTopWebsites(ws);
    };
    void fetchData();
  }, [props.store.isLoading, props.store.lastUpdated]);

  return (
    <React.Fragment>
      <div style={{ marginBottom: 12 }}>
        <WebsitesMemo websites={topWebsites} store={props.store} />
      </div>
    </React.Fragment>
  );
};

export const TopWebsites = (props: { store: IStore }) => {
  const classes = panelStyles();
  return (
    <div className={classes.panel}>
      <TopWebsiteList store={props.store} />
    </div>
  );
};
