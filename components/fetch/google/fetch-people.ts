import { chunk, flatten, uniq } from 'lodash';
import RollbarErrorTracking from '../../error-tracking/rollbar';
import { IPerson } from '../../store/data-types';

export const usedPersonFields = 'names,nicknames,emailAddresses,photos,biographies';
const getNotesForBiographies = (biographies: gapi.client.people.Biography[]) =>
  biographies
    .filter((bio) => bio.metadata?.primary)
    .map((bio) => bio.value)
    .join('<br />');

const formatName = (personName?: string, id?: string) => {
  const name = personName || id;
  if (name && name.includes('people/')) {
    return 'Unknown contributor';
  }
  return name!;
};

export const formatPerson = (
  person?: gapi.client.people.Person,
  requestedResourceName?: string | null,
): IPerson | null => {
  if (!person || !requestedResourceName) {
    return null;
  }
  const emailAddresses =
    (person?.emailAddresses
      ?.map((address) => (address.value ? formatGmailAddress(address.value) : undefined))
      .filter(Boolean as any as ExcludesFalse) as string[]) || [];
  const displayName = person?.names && person?.names[0]?.displayName;
  const id = requestedResourceName;
  let name = displayName || emailAddresses[0] || requestedResourceName;
  name = formatName(name, id);

  return {
    id,
    name,
    googleIds: requestedResourceName ? [requestedResourceName] : [],
    isInContacts: person.names ? true : false,
    isCurrentUser: 0,
    notes: person.biographies ? getNotesForBiographies(person.biographies) : undefined,
    emailAddresses,
    dateAdded: new Date(),
    etag: person.etag,
    imageUrl: person.photos && person.photos[0].url ? person.photos[0].url : undefined,
  };
};

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
  return formatPerson(result as gapi.client.people.Person);
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
      formatPerson(personResponse.person, personResponse.requestedResourceName),
    )
    .filter(Boolean);

  return formattedPeople as IPerson[];
};
