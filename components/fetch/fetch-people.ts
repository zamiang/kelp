export interface person {
  id: string;
  name: string;
  emailAddress?: string;
  imageUrl?: string | null;
}

const batchFetchPeople = async (
  peopleIds: string[],
  addPeopleToStore: (people: person[]) => void,
) => {
  if (peopleIds.length < 1) {
    return { people: [] };
  }

  // for debugging
  // const allPersonFields =
  ('addresses,ageRanges,biographies,birthdays,calendarUrls,clientData,coverPhotos,emailAddresses,events,externalIds,genders,imClients,interests,locales,locations,memberships,metadata,miscKeywords,names,nicknames,occupations,organizations,phoneNumbers,photos,relations,sipAddresses,skills,urls,userDefined');
  const usedPersonFields = 'names,nicknames,emailAddresses,photos';

  const people = await gapi.client.people.people.getBatchGet({
    personFields: usedPersonFields,
    resourceNames: peopleIds,
  });
  // NOTE: unsure why, but this rarely returns anything beyond email address
  const formattedPeople = people.result?.responses?.map((person) => {
    const emailAddress =
      person.person?.emailAddresses &&
      person.person.emailAddresses[0] &&
      person.person.emailAddresses[0].value;
    const displayName = person.person?.names && person?.person?.names[0]?.displayName;
    return {
      id: person.requestedResourceName!,
      name: displayName || emailAddress || person.requestedResourceName!,
      emailAddress,
      imageUrl:
        person.person?.photos && person.person.photos[0].url ? person.person.photos[0].url : null,
    };
  });

  if (formattedPeople) {
    addPeopleToStore(formattedPeople);
  }

  return { people: formattedPeople };
};

export default batchFetchPeople;
