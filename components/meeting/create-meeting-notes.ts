import { format } from 'date-fns';
import { ISegment } from '../store/time-store';
import { IStore } from '../store/use-store';

const documentCreateScope = 'https://www.googleapis.com/auth/drive.file';
const contentType = 'text/html';
const boundary = '-------314159265358979323846';
const delimiter = `\r\n--${boundary}\r\n`;
const closeDelim = `\r\n--${boundary}--`;

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

const getCreateDocumentRequestBody = (
  meeting: ISegment,
  personDataStore: IStore['personDataStore'],
) => {
  const attendees = meeting.formattedAttendees
    .map((attendee) => {
      const person = personDataStore.getPersonById(attendee.personId);
      const name = person?.name || person?.emailAddresses;
      return `<a href="https://www.kelp.nyc/dashboard?tab=people&slug=${person?.id}">${name}</a>`;
    })
    .join(', ');
  const start = `${format(meeting.start, 'EEEE, MMMM d')} at ${format(meeting.start, 'p')}`;
  const data = `
    <h1>${meeting.summary}</h1>
    <b>Time</b>: <i>${start}</i><br />
    <b>Attending</b>: ${attendees}<br />
    <br />
    <h2>Notes<h2>`;
  const metadata = {
    mimeType: 'application/vnd.google-apps.document',
    name: `Meeting Notes for ${meeting.summary} on ${start}`,
  };

  return `${delimiter}Content-Type: application/json\r\n\r\n${JSON.stringify(
    metadata,
  )}${delimiter}Content-Type: ${contentType}\r\n\r\n${data}${closeDelim}`;
};

// Based on: https://developers.google.com/drive/api/v3/integrate-open#node.js
export const createDocument = async (
  meeting: ISegment,
  personDataStore: IStore['personDataStore'],
) => {
  await addScope();

  const body = getCreateDocumentRequestBody(meeting, personDataStore);
  const document = await gapi.client.request({
    path: '/upload/drive/v3/files',
    method: 'POST',
    params: { uploadType: 'multipart' },
    headers: {
      'Content-Type': `multipart/related; boundary="${boundary}"`,
    },
    body,
  });

  const id = document.result.id;
  if (!id) {
    return alert(`no id for ${JSON.stringify(document)}`);
  }
  return document;
};
