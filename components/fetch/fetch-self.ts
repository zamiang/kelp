import { formatGooglePeopleResponse, usedPersonFields } from './fetch-people';

export const fetchSelf = async (authToken: string) => {
  const params = {
    personFields: usedPersonFields,
  };
  const personResponse = await fetch(
    `https://content-people.googleapis.com/v1/people/me?${new URLSearchParams(params).toString()}`,
    {
      headers: {
        authorization: `Bearer ${authToken}`,
      },
    },
  );
  const person = (await personResponse.json()) as gapi.client.people.Person;
  return formatGooglePeopleResponse(person, person.resourceName);
};
