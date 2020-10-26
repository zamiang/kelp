import { userPersonFields } from '../fetch/fetch-contacts';

export const updateContactNotes = async (googleId: string, note: string) => {
  const currentPerson = await gapi.client.people.people.get({
    personFields: userPersonFields,
    resourceName: googleId,
  });

  const etag = currentPerson?.result?.etag;
  if (!etag) {
    return alert('no etag');
  }

  const person = await gapi.client.people.people.updateContact({
    updatePersonFields: 'biographies',
    resource: {
      metadata: {
        sources: [
          {
            etag,
          },
        ],
      },
      biographies: [
        {
          value: note,
        },
      ],
    },
    resourceName: googleId,
  });
  console.log('person', person);
  return person;
};
