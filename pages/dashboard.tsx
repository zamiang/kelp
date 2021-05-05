import useMediaQuery from '@material-ui/core/useMediaQuery';
import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { DesktopDashboard } from '../components/desktop/desktop-dashboard';
import { fetchToken } from '../components/fetch/google/fetch-token';
import MobileDashboard from '../components/mobile/mobile-dashboard';
import Loading from '../components/shared/loading';
import db from '../components/store/db';
import getStore, { IStore, setupStoreNoFetch } from '../components/store/use-store';

export const drawerWidth = 240;
export const MOBILE_WIDTH = 700;

interface IProps {
  store: IStore;
}

const LoadingDashboardContainer = () => {
  const [database, setDatabase] = useState<any>(undefined);
  const [token, setToken] = useState<string | undefined>(undefined);
  const [scope, setScope] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setTimeout(() => {
          if (!database) {
            setError('A component of the web browser has crashed. Please restart your browser.');
          }
        }, 1000);
        const database = await db('production');
        setDatabase(database);
      } catch (e) {
        setError('A component of the web browser has crashed. Please restart your browser.');
      }
    };
    void fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const t = await fetchToken();
      setToken(t.accessToken);
      setScope(t.scope);
    };
    void fetchData();
  }, []);

  return (
    <React.Fragment>
      <Loading isOpen={!token || !database} message={error || 'Loading'} />
      {(process as any).browser && database && token && scope && (
        <LoadingStoreDashboardContainer
          database={database}
          googleOauthToken={token}
          scope={scope}
        />
      )}
    </React.Fragment>
  );
};

const LoadingStoreDashboardContainer = (props: {
  database: any;
  googleOauthToken: string;
  scope: string;
}) => {
  const store = getStore(props.database, props.googleOauthToken, props.scope);
  return (
    <div suppressHydrationWarning={true}>
      <Router basename="/dashboard">
        <DashboardContainer store={store} />
      </Router>
    </div>
  );
};

export const DashboardContainer = ({ store }: IProps) => {
  console.log('loading message', store.loadingMessage);
  const isMobile = useMediaQuery((theme: any) => theme.breakpoints.down('sm'));

  useEffect(() => {
    const interval = setInterval(store.refetch, 1000 * 60 * 30); // 30 minutes
    return () => clearInterval(interval);
  }, []);
  return (
    <div>
      <Head>
        <title>Dashboard - Kelp</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"
        />
      </Head>
      {isMobile ? <MobileDashboard store={store} /> : <DesktopDashboard store={store} />}
    </div>
  );
};

export default LoadingDashboardContainer;
