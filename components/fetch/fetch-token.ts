import config from '../../constants/config';

// https://developers.google.com/identity/protocols/oauth2/javascript-implicit-flow#oauth-2.0-endpoints_4

// Google's OAuth 2.0 endpoint for requesting an access token
const oauth2Endpoint = 'https://accounts.google.com/o/oauth2/v2/auth';

// Parameters to pass to OAuth 2.0 endpoint.
const params: any = {
  client_id: config.GOOGLE_CLIENT_ID,
  redirect_uri: config.REDIRECT_URI,
  scope: config.GOOGLE_SCOPES.join(' '),
  state: 'dashboard',
  include_granted_scopes: 'true',
  response_type: 'token',
};

/*
 * Create form to request access token from Google's OAuth 2.0 server.
 */
const oauth2SignIn = async () => {
  // Create element to open OAuth 2.0 endpoint in new window.
  const form = document.createElement('form');
  form.setAttribute('method', 'GET'); // Send as a GET request.
  form.setAttribute('action', oauth2Endpoint);

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
  form.submit();
};

export const fetchToken = async () => {
  const fragmentString = location.hash.substring(1);

  // Parse query string to see if page request is coming from OAuth 2.0 server.
  const params: any = {};
  const regex = /([^&=]+)=([^&]*)/g;
  let m = null;
  while ((m = regex.exec(fragmentString))) {
    params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
  }
  if (Object.keys(params).length > 0) {
    localStorage.setItem('oauth2', JSON.stringify(params));
  } else {
    await oauth2SignIn();
  }
  return params.access_token;
};
