import React, { useEffect, useState } from 'react';
import { googleAPIRefs } from '../../components/store/use-gapi';
import logo from './logo.svg';
import './app.css';
/*
import db from '../../components/store/db';
import getStore from '../../components/store/use-homepage-store';

const init = async () => {
  console.log('starting');
  const store = await getStore(await db('extension-test'));
  console.log(store);
};

(chrome as any).scripting.executeScript({
  function: init,
});
*/

const API_KEY = 'AIzaSyCEe5HmzHPg8mjJ_bfQmjEUncaqWlRXGx0';

const onGAPILoad = (onSuccess: () => void) => {
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
        onSuccess();
      });
    } catch (e) {
      console.error(e);
    }
  };
  gapi.load('client', loadLibraries as any);
};

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    onGAPILoad(() => setIsLoading(false));
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <img src={logo} className="app-logo" alt="logo" />
        <b>Loading: </b>
        {isLoading}
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="app-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
};

export default App;
