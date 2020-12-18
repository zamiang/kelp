import { ISegment } from '../store/time-store';

const documentCreateScope = 'https://www.googleapis.com/auth/drive.file';

const addScope = async () => {
  const grantedScopes = gapi.auth2.getAuthInstance().currentUser.get().getGrantedScopes();
  if (grantedScopes.includes(documentCreateScope + ' ')) {
    return;
  }

  const option = new gapi.auth2.SigninOptionsBuilder();
  option.setScope(documentCreateScope);

  const googleUser = gapi.auth2.getAuthInstance().currentUser.get();
  try {
    await googleUser.grant(option);
  } catch (e) {
    alert(e);
  }
};

export const createDocument = async (meeting: ISegment) => {
  await addScope();

  const file = {
    mimeType: 'application/vnd.google-apps.document',
    name: `Meeting Notes for ${meeting.summary} on ${meeting.start}`,
    source: 'asfd',
  };
  // https://developers.google.com/drive/api/v3/integrate-open#node.js
  const document = await gapi.client.drive.files.create({
    fields: 'id, name, mimeType, modifiedTime, size',
    resource: file,
  });
  gapi.client.drive.files.export;
  await gapi.client.drive.drives.update({});

  const id = document.result.id;
  if (!id) {
    return alert(`no id for ${JSON.stringify(document)}`);
  }
  return document;
};
