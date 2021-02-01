import React, { useEffect, useState } from 'react';
import { DocumentsForToday } from '../../components/dashboard/documents';
import db from '../../components/store/db';
import { googleAPIRefs } from '../../components/store/use-gapi';
import getStore from '../../components/store/use-store';
import { Loading } from '../../pages/dashboard/index';
import './app.css';

const API_KEY = 'AIzaSyCEe5HmzHPg8mjJ_bfQmjEUncaqWlRXGx0';

const onGAPILoad = (setToken: (token: string) => void) => {
  const loadLibraries = async () => {
    try {
      await gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: googleAPIRefs,
      });
      chrome.identity.getAuthToken({ interactive: true }, (token) => {
        gapi.auth.setToken({
          access_token: token,
        } as any);

        setToken(token);
      });
    } catch (e) {
      console.error(e);
    }
  };
  gapi.load('client', loadLibraries as any);
};

const Info = (props: { database: any }) => {
  const store = getStore(props.database);
  return <DocumentsForToday {...store} selectedDocumentId={null} isSmall={true} />;
};

const App = () => {
  const [token, setToken] = useState<string | null>(null);
  const [database, setDatabase] = useState<any>(undefined);

  useEffect(() => {
    onGAPILoad(setToken);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setDatabase(await db('production'));
    };
    void fetchData();
  }, []);
  return (
    <div className="app">
      <header className="app-header">
        <Loading isOpen={!token || !database} message="Loading" />
        {token && database && <Info database={database} />}
      </header>
    </div>
  );
};

export default App;
