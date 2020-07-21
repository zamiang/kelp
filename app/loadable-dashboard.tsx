import loadable from '@loadable/component';
import React from 'react';
import Loading from './shared/loading';

const LoadableComponent = loadable(() => import('./dashboard-container'), {
  fallback: <Loading />,
});

const LoadableDashboard = () => <LoadableComponent />;

export default LoadableDashboard;
