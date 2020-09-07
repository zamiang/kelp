import { useAuth0 } from '@auth0/auth0-react';
import { useEffect, useState } from 'react';
import config from '../config';
import useGAPI from './use-gapi';

/*
interface IOauth0User {
  email: string;
  email_verified: boolean;
  family_name: string;
  given_name: string;
  locale: 'en';
  name: string;
  nickname: string;
  picture: string; // https://lh3.googleusercontent.com/a-/AOh14GjBtaHxjkknpCtJIUVD_Xr8NBSq4mHTlbXAT7Mtjg
  sub: string; // 'google-oauth2|100884430802346698066';
  updated_at: string; // '2020-09-06T21:32:43.712Z';
}
 */

const useStore = () => {
  const { getAccessTokenSilently } = useAuth0();
  const gapiLoaded = useGAPI();
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      if (gapiLoaded.isLoaded) {
        /*
        // NOTE: Unsure why I can't get the access token from here
        const token = await getAccessTokenSilently({
          // audience: 'https://www.googleapis.com/',
          // google-oauth2
          scope: GOOGLE_SCOPES,
        });
        */
        // NOTE: I have no idea why this works
        // From https://gist.github.com/woloski/190f10d0d120318082a2
        gapi.auth.authorize(
          { client_id: config.GOOGLE_CLIENT_ID, scope: config.GOOGLE_SCOPES, immediate: true },
          function (authResult) {
            if (authResult) {
              setAccessToken(authResult.access_token);
            }
          },
        );
      }
    })();
  }, [getAccessTokenSilently, gapiLoaded.isLoaded, accessToken]);

  return accessToken;
};

export default useStore;
