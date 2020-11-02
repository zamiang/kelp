import Head from 'next/head';
import React from 'react';
import useStore from '../../components/store/use-fake-store';
import { DashboardContainer } from '../dashboard/index';

export const drawerWidth = 240;
const TestDashboard = () => {
  const store = useStore();
  return (
    <React.Fragment>
      <Head>
        <title>Test Dashboard - Kelp</title>
      </Head>
      <DashboardContainer store={store} />
    </React.Fragment>
  );
};

export default TestDashboard;
