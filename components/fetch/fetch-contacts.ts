import { person } from './fetch-people';

const getNotesForBiographies = (biographies: gapi.client.people.Biography[]) =>
  biographies
    .filter((bio) => bio.metadata?.primary)
    .map((bio) => bio.value)
    .join('<br />');

type ExcludesFalse = <T>(x: T | false) => x is T;

export const userPersonFields = 'names,nicknames,emailAddresses,photos,biographies'; // NOTE: Google Contacts has a field called 'notes' that edits the 'biographies' field
/**
 * There is no way to lookup contacts via the Google Contacts API,
 * so here we make our own lookups by ID and email
 *
 * We do not want to add all contacts to the store, just ones with recent activity
 */
const fetchContacts = async () => {
  const people = await gapi.client.people.people.connections.list({
    personFields: userPersonFields,
    resourceName: 'people/me',
    sortOrder: 'LAST_MODIFIED_DESCENDING',
  });

  const results = people.result?.connections?.map((person) => {
    const emailAddresses =
      (person?.emailAddresses
        ?.map((address) => address.value?.toLocaleLowerCase())
        .filter((Boolean as any) as ExcludesFalse) as string[]) || [];
    const displayName = person?.names && person?.names[0]?.displayName;
    if (!emailAddresses[0] || !person.resourceName) {
      return;
    }
    const formattedContact = {
      id: person.resourceName,
      name: displayName || emailAddresses[0] || person.resourceName,
      isInContacts: person.names ? true : false,
      emailAddresses,
      imageUrl: person?.photos && person.photos[0].url ? person.photos[0].url : null,
      notes: person?.biographies ? getNotesForBiographies(person.biographies) : undefined,
    };
    return formattedContact;
  });
  return results?.filter(Boolean) as person[];
};

export default fetchContacts;
