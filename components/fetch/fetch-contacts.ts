import { person } from './fetch-people';

/**
 * There is no way to lookup contacts via the Google Contacts API,
 * so here we make our own lookups by ID and email
 *
 * We do not want to add all contacts to the store, just ones with recent activity
 */
const fetchContacts = async () => {
  const usedPersonFields = 'names,nicknames,emailAddresses,photos';

  const people = await gapi.client.people.people.connections.list({
    personFields: usedPersonFields,
    resourceName: 'people/me',
    sortOrder: 'LAST_MODIFIED_DESCENDING',
  });

  const contactsByEmail: { [id: string]: person } = {};
  const contactsByPeopleId: { [id: string]: person } = {};

  people.result?.connections?.map((person) => {
    // TODO: Handle multiple email addresses
    const emailAddress =
      person?.emailAddresses &&
      person.emailAddresses[0] &&
      person.emailAddresses[0].value?.toLocaleLowerCase();
    const displayName = person?.names && person?.names[0]?.displayName;
    if (!emailAddress || !person.resourceName) {
      return;
    }
    const formattedContact = {
      id: person.resourceName,
      name: displayName || emailAddress || person.resourceName,
      isMissingProfile: person?.names ? false : true,
      emailAddress,
      imageUrl: person?.photos && person.photos[0].url ? person.photos[0].url : null,
    };
    contactsByPeopleId[person.resourceName] = formattedContact;
    contactsByEmail[emailAddress] = formattedContact;
  });
  return { contactsByPeopleId, contactsByEmail };
};

export default fetchContacts;
