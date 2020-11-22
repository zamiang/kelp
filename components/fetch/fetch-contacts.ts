import { person } from './fetch-people';

const getNotesForBiographies = (biographies: gapi.client.people.Biography[]) =>
  biographies
    .filter((bio) => bio.metadata?.primary)
    .map((bio) => bio.value)
    .join('<br />');

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

  const contactsByEmail: { [id: string]: person } = {};
  const contactsByPeopleId: { [id: string]: person } = {};

  people.result?.connections?.map((person) => {
    // TODO: Handle multiple email addresses
    const primaryEmailAddress =
      person?.emailAddresses &&
      person.emailAddresses[0] &&
      person.emailAddresses[0].value?.toLocaleLowerCase();
    const displayName = person?.names && person?.names[0]?.displayName;
    if (!primaryEmailAddress || !person.resourceName) {
      return;
    }
    const formattedContact = {
      id: person.resourceName,
      name: displayName || primaryEmailAddress || person.resourceName,
      isMissingProfile: person?.names ? false : true,
      emailAddress: primaryEmailAddress,
      imageUrl: person?.photos && person.photos[0].url ? person.photos[0].url : null,
      notes: person?.biographies ? getNotesForBiographies(person.biographies) : undefined,
    };
    contactsByPeopleId[person.resourceName] = formattedContact;
    person.emailAddresses?.map((email) => {
      if (email.value) {
        contactsByEmail[email.value.toLocaleLowerCase()] = formattedContact;
      }
    });
  });
  return { contactsByPeopleId, contactsByEmail };
};

export default fetchContacts;
