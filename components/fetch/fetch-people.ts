export interface person {
  id: string;
  name: string;
  isMissingProfile: boolean;
  emailAddress?: string;
  notes?: string;
  imageUrl?: string | null;
}

export const formatGooglePeopleResponse = (
  person: gapi.client.people.PersonResponse['person'],
  requestedResourceName?: string | null,
) => {
  const emailAddress =
    person?.emailAddresses && person.emailAddresses[0] && person.emailAddresses[0].value;
  const displayName = person?.names && person?.names[0]?.displayName;
  return {
    id: requestedResourceName!,
    name: displayName || emailAddress || requestedResourceName!,
    isMissingProfile: person?.names ? false : true,
    notes: person?.biographies?.map((b) => b.value).join('<br />'),
    emailAddress,
    imageUrl: person?.photos && person.photos[0].url ? person.photos[0].url : null,
  };
};

export const batchFetchPeople = async (
  peopleIds: string[],
  addPeopleToStore: (people: person[]) => void,
) => {
  if (peopleIds.length < 1) {
    return { people: [] };
  }

  // for debugging
  // const allPersonFields = 'addresses,ageRanges,biographies,birthdays,calendarUrls,clientData,coverPhotos,emailAddresses,events,externalIds,genders,imClients,interests,locales,locations,memberships,metadata,miscKeywords,names,nicknames,occupations,organizations,phoneNumbers,photos,relations,sipAddresses,skills,urls,userDefined';
  const usedPersonFields = 'names,nicknames,emailAddresses,photos,externalIds';

  const people = await gapi.client.people.people.getBatchGet({
    personFields: usedPersonFields,
    resourceNames: peopleIds,
  });

  // NOTE: This returns very little unless the person is in the user's contacts
  const formattedPeople = people.result?.responses?.map((personResponse) =>
    formatGooglePeopleResponse(personResponse.person, personResponse.requestedResourceName),
  );

  if (formattedPeople) {
    addPeopleToStore(formattedPeople);
  }

  return { people: formattedPeople };
};
