import { chunk, flatten, uniq } from 'lodash';
import RollbarErrorTracking from '../error-tracking/rollbar';

export const usedPersonFields = 'names,nicknames,emailAddresses,photos,biographies';

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

const shouldFormatGmailAddress = false;

export const formatGmailAddress = (email: string) => {
  // Not sure if this is a good idea - seems to work ok with Cityblock and no-dot
  if (shouldFormatGmailAddress && email.includes('@gmail.com')) {
    const splitEmail = email.split('@');
    return `${splitEmail[0].replaceAll('.', '')}@${splitEmail[1]}`.toLocaleLowerCase();
  }
  return email.toLocaleLowerCase();
};

export const formatGooglePeopleResponse = (
  person?: gapi.client.people.Person,
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

export const fetchPerson = async (personId: string, authToken: string) => {
  const params = {
    personFields: usedPersonFields,
  };

  const personResponse = await fetch(
    `https://people.googleapis.com/v1/${personId}?${new URLSearchParams(params).toString()}`,
    {
      headers: {
        authorization: `Bearer ${authToken}`,
      },
    },
  );
  const result = await personResponse.json();
  if (!personResponse.ok) {
    RollbarErrorTracking.logErrorInfo(JSON.stringify(params));
    RollbarErrorTracking.logErrorInRollbar(personResponse.statusText);
  }
  return result as gapi.client.people.Person;
};

export const batchFetchPeople = async (peopleIds: string[], authToken: string, limit: any) => {
  if (peopleIds.length < 1) {
    return [];
  }

  const uniquePeopleIdsChunks = chunk(uniq(peopleIds), 49);

  const results = await Promise.all(
    uniquePeopleIdsChunks.map(async (uniquePeopleIds) => {
      const searchParams = new URLSearchParams({
        personFields: usedPersonFields,
      });
      uniquePeopleIds.forEach((id) => searchParams.append('resourceNames', id));

      const personResponse = await limit(
        async () =>
          await fetch(
            `https://people.googleapis.com/v1/people:batchGet?${searchParams.toString()}`,
            {
              headers: {
                authorization: `Bearer ${authToken}`,
              },
            },
          ),
      );
      const result = await personResponse.json();

      return result;
    }),
  );

  // NOTE: This returns very little unless the person is in the user's contacts
  const flattenedPeople = flatten(results.map((r) => r.responses));
  const formattedPeople = flattenedPeople
    .filter(Boolean)
    .map((personResponse) =>
      formatGooglePeopleResponse(personResponse.person, personResponse.requestedResourceName),
    );

  return formattedPeople;
};
