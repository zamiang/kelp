import dynamic from 'next/dynamic';
import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import db from '../../components/store/db';
import getStore from '../../components/store/use-fake-store';
import { DashboardContainer } from '../dashboard/index';

export const drawerWidth = 240;
const TestDashboard = () => {
  const [store, setStore] = useState<any>(undefined);
  useEffect(() => {
    const fetchData = async () => {
      const store = await getStore(await db);
      setStore(store);
    };
    void fetchData();
  }, []);

  // TODO
  if (!store) {
    return null;
  }

  return (
    <React.Fragment>
      <Head>
        <title>Test Dashboard - Kelp</title>
      </Head>
      <DashboardContainer store={store} />
    </React.Fragment>
  );
};

export default dynamic(() => Promise.resolve(TestDashboard), {
  ssr: false,
});
