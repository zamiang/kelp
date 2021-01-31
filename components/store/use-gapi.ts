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
        const authInstance = gapi.auth2.getAuthInstance();
        authInstance.isSignedIn.listen((signedIn: boolean) => {
          setStatus(signedIn);
        });
        const isSignedIn = authInstance.isSignedIn.get();
        if (isSignedIn) {
          return setStatus(true);
        }
        // https://github.com/google/google-api-javascript-client/issues/342#issuecomment-601619334
        const isSafari = navigator.userAgent.includes('Safari');
        const result = await authInstance.signIn({
          scope: config.GOOGLE_SCOPES.join(' '),
          redirect_uri: config.REDIRECT_URI,
          ux_mode: isSafari ? 'popup' : 'redirect',
        });
        if (result) {
          setStatus(true);
        }
      } catch (error) {
        if (error == 'popup_blocked_by_browser') {
          alert('Please allow popups for Kelp.nyc');
        } else if (error.error == 'popup_blocked_by_browser') {
          alert('Please allow popups for Kelp.nyc');
        } else {
          console.error(error);
        }
      }
    };
    gapi.load('client:auth2', loadLibraries as any);
  }, []);

  return isLoaded;
};

export default useGAPI;
