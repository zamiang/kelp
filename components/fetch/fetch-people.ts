import { chunk, flatten, uniq } from 'lodash';

export interface person {
  id: string;
  name: string;
  isInContacts: boolean;
  googleId?: string;
  emailAddresses: string[];
  notes?: string;
  imageUrl?: string | null;
}

type ExcludesFalse = <T>(x: T | false) => x is T;

const shouldFormatGmailAddress = true;

export const formatGmailAddress = (email: string) => {
  if (shouldFormatGmailAddress && email.includes('@gmail.com')) {
    const splitEmail = email.split('@');
    return `${splitEmail[0].replaceAll('.', '')}@${splitEmail[1]}`.toLocaleLowerCase();
  }
  return email.toLocaleLowerCase();
};

const formatGooglePeopleResponse = (
  person: gapi.client.people.PersonResponse['person'],
  requestedResourceName?: string | null,
): person => {
  const emailAddresses =
    (person?.emailAddresses
      ?.map((address) => (address.value ? formatGmailAddress(address.value) : undefined))
      .filter((Boolean as any) as ExcludesFalse) as string[]) || [];
  const displayName = person?.names && person?.names[0]?.displayName;
  return {
    id: requestedResourceName!,
    name: displayName || emailAddresses[0] || requestedResourceName!,
    googleId: requestedResourceName || undefined,
    isInContacts: person && person.names ? true : false,
    notes: person?.biographies?.map((b) => b.value).join('<br />'),
    emailAddresses,
    imageUrl: person?.photos && person.photos[0].url ? person.photos[0].url : null,
  };
};

export const batchFetchPeople = async (peopleIds: string[]) => {
  if (peopleIds.length < 1) {
    return [];
  }

  const uniquePeopleIdsChunks = chunk(uniq(peopleIds), 49);

  // for debugging
  // const allPersonFields = 'addresses,ageRanges,biographies,birthdays,calendarUrls,clientData,coverPhotos,emailAddresses,events,externalIds,genders,imClients,interests,locales,locations,memberships,metadata,miscKeywords,names,nicknames,occupations,organizations,phoneNumbers,photos,relations,sipAddresses,skills,urls,userDefined';
  const usedPersonFields = 'names,nicknames,emailAddresses,photos,externalIds';

  const people = await Promise.all(
    uniquePeopleIdsChunks.map(async (uniquePeopleIds) =>
      gapi.client.people.people.getBatchGet({
        personFields: usedPersonFields,
        resourceNames: uniquePeopleIds,
      }),
    ),
  );

  // NOTE: This returns very little unless the person is in the user's contacts
  const flattenedPeople = flatten(people.map((r) => r.result.responses));

  const formattedPeople = flattenedPeople
    .filter(Boolean)
    .map((personResponse) =>
      formatGooglePeopleResponse(personResponse!.person, personResponse!.requestedResourceName),
    );

  return formattedPeople;
};
