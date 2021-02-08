import { userPersonFields } from '../fetch/fetch-contacts';

const contactEditScope = 'https://www.googleapis.com/auth/contacts';

const addScope = async () => {
  const grantedScopes = gapi.auth2.getAuthInstance().currentUser.get().getGrantedScopes();
  if (grantedScopes.includes(contactEditScope + ' ')) {
    return;
  }

  const option = new gapi.auth2.SigninOptionsBuilder();
  option.setScope(contactEditScope);

  const googleUser = gapi.auth2.getAuthInstance().currentUser.get();
  try {
    await googleUser.grant(option);
  } catch (e) {
    alert(e);
  }
};

export const updateContactNotes = async (googleId: string, note: string) => {
  await addScope();

  const person = await gapi.client.people.people.get({
    personFields: userPersonFields,
    resourceName: googleId,
    sources: 'READ_SOURCE_TYPE_CONTACT',
  });

  const etag = person?.result?.etag;
  if (!etag) {
    return alert('no etag');
  }
  let response;
  try {
    response = await gapi.client.people.people.updateContact({
      updatePersonFields: 'biographies',
      resource: {
        etag,
        biographies: [
          {
            value: note,
          },
        ],
      },
      resourceName: person.result.resourceName!,
    });
  } catch (e) {
    alert(JSON.stringify(e));
  }
  return response;
};
