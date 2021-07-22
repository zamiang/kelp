import config from '../../../constants/config';
import ErrorTracking from '../../error-tracking/error-tracking';
import { IPerson } from '../../store/data-types';
import { deleteDatabase } from '../../store/db';
import { formatPerson, usedPersonFields } from './fetch-people';

export const fetchSelf = async (authToken: string): Promise<IPerson | null> => {
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
    ErrorTracking.logErrorInfo(JSON.stringify(params));
    ErrorTracking.logErrorInRollbar(personResponse.statusText);

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
    const lastUpdatedUserId = localStorage.getItem(config.LAST_UPDATED_USER_ID);
    if (!lastUpdatedUserId && person.resourceName) {
      localStorage.setItem(config.LAST_UPDATED_USER_ID, person.resourceName);
    } else if (person.resourceName && lastUpdatedUserId !== person.resourceName) {
      try {
        await deleteDatabase('production');
      } catch (e) {
        alert(JSON.stringify(e));
      }
      localStorage.setItem(config.LAST_UPDATED_USER_ID, person.resourceName);
      window.location.reload();
    }
  }

  return formatPerson(person, person.resourceName) as IPerson;
};
