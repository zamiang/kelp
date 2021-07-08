import config from '../../../constants/config';

// https://developers.google.com/identity/protocols/oauth2/javascript-implicit-flow#oauth-2.0-endpoints_4

// Google's OAuth 2.0 endpoint for requesting an access token
const oauth2Endpoint = 'https://accounts.google.com/o/oauth2/v2/auth';

// Parameters to pass to OAuth 2.0 endpoint.
const getParams = (): any => ({
  client_id: config.GOOGLE_CLIENT_ID,
  redirect_uri: config.REDIRECT_URI,
  scope: config.GOOGLE_SCOPES.join(' '),
  state: window.location.pathname,
  include_granted_scopes: 'true',
  response_type: 'token',
});

export const addScope = async (grantedScopes: string, newScope: string): Promise<boolean> => {
  // NOTE: May need to add a space after newScope is to distinguish between general vs specific scopes ie: people vs people/readonly
  if (grantedScopes.includes(newScope)) {
    return true;
  }
  // TODO: handle custom state
  oauth2SignIn(newScope);
  // oauth2SignIn thing will redirect
  return false;
};

/*
 * Create form to request access token from Google's OAuth 2.0 server.
 */
const oauth2SignIn = (additionalScope?: string) => {
  // NOTE: this needs to be a form: https://stackoverflow.com/questions/48925165/cors-issue-with-google-oauth2-for-server-side-webapps
  // Detect safari and include chrome and firefox on iOS since they use safari as a renderer
  // const isSafari = () => navigator.vendor.match(/apple/i); // && !navigator.userAgent.match(/crios/i) && !navigator.userAgent.match(/fxios/i);

  // Create element to open OAuth 2.0 endpoint in new window.
  const form = document.createElement('form');
  form.setAttribute('method', 'GET'); // Send as a GET request.
  form.setAttribute('action', oauth2Endpoint);
  const params = getParams();
  if (additionalScope) {
    params.scope = `${params.scope} ${additionalScope}`;
  }

  // Add form parameters as hidden input values.
  for (const p in params) {
    const input = document.createElement('input');
    input.setAttribute('type', 'hidden');
    input.setAttribute('name', p);
    input.setAttribute('value', params[p]);
    form.appendChild(input);
  }
  // Add form to page and submit it to open the OAuth 2.0 endpoint.
  document.body.appendChild(form);
  return form.submit();
};
