import { useEffect, useState } from 'react';
import config from '../../constants/config';

const googleAPIRefs = [
  'https://www.googleapis.com/discovery/v1/apis/people/v1/rest',
  'https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest',
  'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
  'https://www.googleapis.com/discovery/v1/apis/driveactivity/v2/rest',
  'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
];

// https://github.com/google/google-api-javascript-client/blob/master/samples/authSample.html
const useGAPI = () => {
  const [isLoaded, setStatus] = useState(false);

  useEffect(() => {
    const loadLibraries = async () => {
      await gapi.client.init({
        discoveryDocs: googleAPIRefs,
        clientId: config.GOOGLE_CLIENT_ID,
        scope: config.GOOGLE_SCOPES.join(' '),
      });
      try {
        const isSignedIn = gapi.auth2.getAuthInstance().isSignedIn.get();
        if (isSignedIn) {
          return setStatus(isSignedIn);
        }
        const result = await gapi.auth2.getAuthInstance().signIn({
          scope: config.GOOGLE_SCOPES.join(' '),
          redirect_uri: config.AUTH0_REDIRECT_URI,
        });
        if (result) {
          setStatus(true);
        }
      } catch (error) {
        if (error) {
          if (error == 'popup_blocked_by_browser') {
            alert('Please allow popups for Kelp');
          } else {
            alert(JSON.stringify(error));
          }
          // Unsure if logging out is helpful
          // return logout();
        }
      }
    };
    gapi.load('client:auth2', loadLibraries as any);
  }, []);

  return isLoaded;
};

export default useGAPI;
