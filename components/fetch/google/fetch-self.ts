import RollbarErrorTracking from '../../error-tracking/rollbar';
import { deleteDatabase } from '../../store/db';
import { formatGooglePeopleResponse, usedPersonFields } from './fetch-people';

export const fetchSelf = async (authToken: string) => {
  const params = {
    personFields: usedPersonFields,
  };
  const personResponse = await fetch(
    `https://content-people.googleapis.com/v1/people/me?${new URLSearchParams(params).toString()}`,
    {
      headers: {
        authorization: `Bearer ${authToken}`,
      },
    },
  );
  if (!personResponse.ok) {
    RollbarErrorTracking.logErrorInfo(JSON.stringify(params));
    RollbarErrorTracking.logErrorInRollbar(personResponse.statusText);

    if (personResponse.status === 401) {
      // Reload if the current user fetch fails
      window.location.pathname = '/dashboard';
    }
  }

  const person = (await personResponse.json()) as gapi.client.people.Person;

  // Handle multiple google accounts.
  // We store the google id used when fetching the current user and then compare
  // that to what we get in subsequent fetches.
  // NOTE: This doesn't appear to work very well. Perhaps things that are being saved while deleting the db?
  if (typeof localStorage === 'object') {
    const lastUpdatedUserId = localStorage.getItem('kelpLastUpdatedUserId');
    if (!lastUpdatedUserId && person.resourceName) {
      localStorage.setItem('kelpLastUpdatedUserId', person.resourceName);
    } else if (person.resourceName && lastUpdatedUserId !== person.resourceName) {
      try {
        await deleteDatabase('production');
      } catch (e) {
        alert(JSON.stringify(e));
      }
      localStorage.setItem('kelpLastUpdatedUserId', person.resourceName);
      window.location.reload();
    }
  }

  return formatGooglePeopleResponse(person, person.resourceName);
};
