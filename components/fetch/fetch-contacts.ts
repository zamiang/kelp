import RollbarErrorTracking from '../error-tracking/rollbar';
import { formatGmailAddress, person, usedPersonFields } from './fetch-people';

const getNotesForBiographies = (biographies: gapi.client.people.Biography[]) =>
  biographies
    .filter((bio) => bio.metadata?.primary)
    .map((bio) => bio.value)
    .join('<br />');

type ExcludesFalse = <T>(x: T | false) => x is T;

export const formatContact = (person: gapi.client.people.Person) => {
  const emailAddresses =
    (person?.emailAddresses
      ?.map((address) => (address.value ? formatGmailAddress(address.value) : undefined))
      .filter((Boolean as any) as ExcludesFalse) as string[]) || [];
  const displayName = person?.names && person?.names[0]?.displayName;
  if (!emailAddresses[0] || !person.resourceName) {
    return;
  }
  const formattedContact = {
    id: person.resourceName,
    name: displayName || emailAddresses[0] || person.resourceName,
    isInContacts: person.names ? true : false,
    googleId: person.resourceName || undefined,
    emailAddresses,
    imageUrl: person?.photos && person.photos[0].url ? person.photos[0].url : null,
    notes: person?.biographies ? getNotesForBiographies(person.biographies) : undefined,
  };
  return formattedContact;
};

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
    RollbarErrorTracking.logErrorInfo(JSON.stringify(params));
    RollbarErrorTracking.logErrorInRollbar(peopleResponse.statusText);
  }

  const results = peopleBody?.connections?.map((person: gapi.client.people.Person) =>
    formatContact(person),
  );
  return results?.filter(Boolean) as person[];
};

export default fetchContacts;
