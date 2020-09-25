import { useEffect, useState } from 'react';
import config from '../../constants/config';
import useGAPI from './use-gapi';

/*
// user returned from Auth0
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

/**
 * Ideally would be able to get the google token from auth0
 *  const token = await getAccessTokenSilently({
 *   scope,
 *   connection,
 *  });
 *  setAccessToken(token);
 *  gapi.auth.setToken({
 *   access_token: token,
 *  });
 */

const useStore = () => {
  const gapiLoaded = useGAPI();
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      if (gapiLoaded.isLoaded) {
        /**
         * This works because the user is logged in with google and has authenticated the google app already via auth0
         * From https://gist.github.com/woloski/190f10d0d120318082a2
         */
        gapi.auth.authorize(
          {
            client_id: config.GOOGLE_CLIENT_ID,
            scope: config.GOOGLE_SCOPES.join(' '),
            immediate: true,
          },
          function (authResult) {
            if (authResult) {
              setAccessToken(authResult.access_token);
            }
          },
        );
      }
    })();
  }, [gapiLoaded.isLoaded, accessToken]);

  return accessToken;
};

export default useStore;
