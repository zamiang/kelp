import { fetchPerson } from '../fetch/fetch-people';
import { addScope } from '../fetch/fetch-token';

const contactEditScope = 'https://www.googleapis.com/auth/contacts';

export const updateContactNotes = async (
  googleId: string,
  note: string,
  scope: string,
  accessToken: string,
) => {
  const isScopeAdded = await addScope(scope, contactEditScope);
  if (!isScopeAdded) {
    return;
  }

  const person = await fetchPerson(googleId, accessToken);
  const etag = person.etag;
  if (!etag) {
    return alert('no etag');
  }
  const params = {
    updatePersonFields: 'biographies',
  };
  const body = {
    etag,
    biographies: [
      {
        value: note,
      },
    ],
  };

  try {
    const response = await fetch(
      `https://people.googleapis.com/v1/${person.resourceName}:updateContact?${new URLSearchParams(
        params,
      ).toString()}`,
      {
        method: 'PATCH',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      },
    );
    const result = await response.json();
    return result as gapi.client.people.Person;
  } catch (e) {
    alert(JSON.stringify(e));
  }
};
