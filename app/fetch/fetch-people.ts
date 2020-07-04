export interface person {
  id: string;
  name: string;
  emailAddress: string;
  imageUrl?: string | null;
}

const batchFetchPeople = async (
  peopleIds: string[],
  addPeopleToStore: (people: person[]) => void,
) => {
  if (peopleIds.length < 1) {
    return { people: [] };
  }
  const people = await gapi.client.people.people.getBatchGet({
    personFields: 'names,nicknames,emailAddresses,photos',
    resourceNames: peopleIds,
  });
  const formattedPeople =
    people.result &&
    people.result.responses &&
    people.result.responses.map((person) => ({
      id: person.requestedResourceName || 'unknown',
      name:
        person.person && person.person.names && person.person.names[0].displayName
          ? person.person.names[0].displayName
          : 'unknown',
      emailAddress:
        person.person &&
        person.person.emailAddresses &&
        person.person.emailAddresses[0] &&
        person.person.emailAddresses[0].value
          ? person.person.emailAddresses[0].value
          : 'unknown',
      imageUrl:
        person.person &&
        person.person.photos &&
        person.person.photos[0] &&
        person.person.photos[0].url
          ? person.person.photos[0].url
          : null,
    }));
  if (formattedPeople) {
    addPeopleToStore(formattedPeople);
  }

  return { people: formattedPeople };
};

export default batchFetchPeople;
