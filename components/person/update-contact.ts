import { userPersonFields } from '../fetch/fetch-contacts';
import { IPerson } from '../store/person-store';

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

export const updateContactNotes = async (googleId: string, note: string, person: IPerson) => {
  await addScope();

  const currentPerson = await gapi.client.people.people.get({
    personFields: userPersonFields,
    resourceName: googleId,
  });

  const etag = currentPerson?.result?.etag;
  if (!etag) {
    return alert('no etag');
  }

  await gapi.client.people.people.updateContact({
    updatePersonFields: 'biographies',
    resource: {
      etag,
      biographies: [
        {
          value: note,
        },
      ],
    },
    resourceName: currentPerson.result.resourceName!,
  });
  person.notes = note;
};
