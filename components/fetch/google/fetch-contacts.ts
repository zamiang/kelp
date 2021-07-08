import ErrorTracking from '../../error-tracking/error-tracking';
import { IPerson } from '../../store/data-types';
import { formatPerson, usedPersonFields } from './fetch-people';

/**
 * There is no way to lookup contacts via the Google Contacts API,
 * so here we make our own lookups by ID and email
 *
 * We do not want to add all contacts to the store, just ones with recent activity
 */
const fetchContacts = async (authToken: string) => {
  const params = {
    personFields: usedPersonFields,
    resourceName: 'people/me',
    sortOrder: 'LAST_MODIFIED_DESCENDING',
    pageSize: '300',
  };
  // Ref: gapi.client.people.people.connections.list();
  const peopleResponse = await fetch(
    `https://content-people.googleapis.com/v1/people/me/connections?${new URLSearchParams(
      params,
    ).toString()}`,
    {
      headers: {
        authorization: `Bearer ${authToken}`,
      },
    },
  );
  const peopleBody = await peopleResponse.json();
  if (!peopleResponse.ok) {
    ErrorTracking.logErrorInfo(JSON.stringify(params));
    ErrorTracking.logErrorInRollbar(peopleResponse.statusText);
  }

  const results = peopleBody?.connections?.map((person: gapi.client.people.Person) =>
    formatPerson(person, person.resourceName),
  );
  return results?.filter(Boolean) as IPerson[];
};

export default fetchContacts;
