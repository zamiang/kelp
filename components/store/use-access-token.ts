import { useAuth0 } from '@auth0/auth0-react';
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
 * // https://github.com/auth0/auth0-react/blob/master/EXAMPLES.md#4-create-a-useapi-hook-for-accessing-protected-apis-with-an-access-token
 */

const useStore = () => {
  const gapiLoaded = useGAPI();
  const { logout } = useAuth0();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    void (async () => {
      if (gapiLoaded.isLoaded && !isLoading) {
        /**
         * This works because the user is logged in with google and has authenticated the google app already via auth0
         * From https://gist.github.com/woloski/190f10d0d120318082a2
         */
        setIsLoading(true);
        gapi.auth.authorize(
          {
            client_id: config.GOOGLE_CLIENT_ID,
            scope: config.GOOGLE_SCOPES.join(' '),
            // Does not work well in Safari
            // immediate: true,
          },
          function (authResult) {
            if (authResult.error) {
              if (authResult.error == 'popup_blocked_by_browser') {
                alert('Please allow popups for Kelp');
              } else {
                alert(JSON.stringify(authResult.error));
              }
              // Unsure if logging out is helpful
              logout();
            }
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
