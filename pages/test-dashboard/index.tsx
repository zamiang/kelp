import React from 'react';
import useStore from '../../components/store/use-fake-store';
import { DashboardContainer } from '../dashboard/index';

export const drawerWidth = 240;
const TestDashboard = () => {
  const store = useStore();
  return (
    <React.Fragment>
      <DashboardContainer store={store} />
    </React.Fragment>
  );
};

export default TestDashboard;
