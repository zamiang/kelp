import { useAuth0 } from '@auth0/auth0-react';
import config from '../../constants/config';

export const connection = 'google-oauth2';

export const useLoginWithRedirect = () => {
  const { loginWithRedirect } = useAuth0();
  return () =>
    loginWithRedirect({
      connection,
      connection_scope: config.GOOGLE_SCOPES.join(', '),
    });
};
