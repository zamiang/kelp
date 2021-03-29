import dynamic from 'next/dynamic';
import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Loading from '../components/shared/loading';
import db from '../components/store/db';
import getStore from '../components/store/use-fake-store';
import { DashboardContainer } from './dashboard';

export const drawerWidth = 240;

const LoadingStoreDashboardContainer = (props: { database: any }) => {
  const store = getStore(props.database);
  return (
    <div suppressHydrationWarning={true}>
      <Router basename="/test-dashboard">
        <DashboardContainer store={store} />
      </Router>
    </div>
  );
};

const TestDashboard = () => {
  const [database, setDatabase] = useState<any>(undefined);

  useEffect(() => {
    const fetchData = async () => {
      setDatabase(await db('test'));
    };
    void fetchData();
  }, []);

  return (
    <div suppressHydrationWarning={true}>
      <Head>
        <title>Test Dashboard - Kelp</title>
      </Head>
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"
      />
      <Loading isOpen={!database} message="Loading" />
      {(process as any).browser && database && (
        <LoadingStoreDashboardContainer database={database} />
      )}
    </div>
  );
};

export default dynamic(() => Promise.resolve(TestDashboard), {
  ssr: false,
});
