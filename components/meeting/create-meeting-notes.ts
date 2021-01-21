import { format } from 'date-fns';
import { uniqBy } from 'lodash';
import { IFormattedDriveActivity } from '../fetch/fetch-drive-activity';
import { ISegment } from '../store/time-store';
import { IStore } from '../store/use-store';

const documentCreateScope = 'https://www.googleapis.com/auth/drive.file';
const contentType = 'text/html';
const boundary = '-------314159265358979323846';
const delimiter = `\r\n--${boundary}\r\n`;
const closeDelim = `\r\n--${boundary}--`;

const addScope = async (): Promise<boolean> => {
  if (!gapi.auth2) {
    alert('You are either in test mode or should reauthenticate');
    return false;
  }
  const grantedScopes = gapi.auth2.getAuthInstance().currentUser.get().getGrantedScopes();
  if (grantedScopes.includes(documentCreateScope + ' ')) {
    return true;
  }

  const option = new gapi.auth2.SigninOptionsBuilder();
  option.setScope(documentCreateScope);

  const googleUser = gapi.auth2.getAuthInstance().currentUser.get();
  try {
    await googleUser.grant(option);
    return true;
  } catch (e) {
    alert(e);
    return false;
  }
};

const getCreateDocumentRequestBody = (
  meeting: ISegment,
  documents: IFormattedDriveActivity[],
  personDataStore: IStore['personDataStore'],
  documentDataStore: IStore['documentDataStore'],
) => {
  const attendees = meeting.formattedAttendees
    .map((attendee) => {
      const person = personDataStore.getPersonById(attendee.personId);
      const name = person?.name || person?.emailAddresses;
      return `<a href="https://www.kelp.nyc/dashboard?tab=people&slug=${person?.id}">${name}</a>`;
    })
    .join(', ');
  const relatedDocuments = uniqBy(documents, 'link')
    .map((activity) => {
      const document = documentDataStore.getByLink(activity.link);
      return `<li><a href="${document?.link}">${document?.name}</a></li>`;
    })
    .join('');
  const start = `${format(meeting.start, 'EEEE, MMMM d')} at ${format(meeting.start, 'p')}`;
  const data = `
    <h1>${meeting.summary}</h1>
    <b>Time</b>: <i>${start}</i><br />
    <b>Attendees</b>: ${attendees}<br />
    ${
      relatedDocuments.length > 0
        ? `<b>Related Documents</b><br /><ul>${relatedDocuments}</ul><br />`
        : ''
    }
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
  driveActivity: IFormattedDriveActivity[],
  personDataStore: IStore['personDataStore'],
  documentDataStore: IStore['documentDataStore'],
) => {
  const isScopeAdded = await addScope();
  if (!isScopeAdded) {
    return;
  }

  const body = getCreateDocumentRequestBody(
    meeting,
    driveActivity,
    personDataStore,
    documentDataStore,
  );
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

  return document.result;
};
