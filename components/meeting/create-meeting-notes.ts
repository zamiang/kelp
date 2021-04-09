import { format } from 'date-fns';
import { addScope } from '../fetch/google/fetch-token';
import { ISegment } from '../store/data-types';
import { IStore } from '../store/use-store';

const documentCreateScope = 'https://www.googleapis.com/auth/drive.file';
const contentType = 'text/html';
const boundary = '-------314159265358979323846';
const delimiter = `\r\n--${boundary}\r\n`;
const closeDelim = `\r\n--${boundary}--`;

const getCreateDocumentRequestBody = async (
  meeting: ISegment,
  documentIds: string[],
  personDataStore: IStore['personDataStore'],
  documentDataStore: IStore['documentDataStore'],
  attendeeDataStore: IStore['attendeeDataStore'],
) => {
  const attendees = await attendeeDataStore.getAllForSegmentId(meeting.id);
  const attendeesText = await Promise.all(
    attendees.map(async (attendee) => {
      if (attendee.personId) {
        const person = await personDataStore.getById(attendee.personId);
        const name = person?.name || person?.emailAddresses;
        return `<a href="https://www.kelp.nyc/dashboard/people/${encodeURIComponent(
          person?.id || '',
        )}">${name}</a>`;
      }
    }),
  );

  const relatedDocuments = await Promise.all(
    documentIds.map(async (id) => {
      const document = await documentDataStore.getById(id);
      return `<li><a href="${document?.link}">${document?.name}</a></li>`;
    }),
  );

  const start = `${format(meeting.start, 'EEEE, MMMM d')} at ${format(meeting.start, 'p')}`;
  const data = `
    <h1>${meeting.summary}</h1>
    <b>Time</b>: <i>${start}</i><br />
    <b>Attendees</b>: ${attendeesText.join(', ')}<br />
    ${
      relatedDocuments.length > 0
        ? `<b>Related Documents</b><br /><ul>${relatedDocuments.join('')}</ul><br />`
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
const createDocument = async (
  meeting: ISegment,
  documentIds: string[],
  personDataStore: IStore['personDataStore'],
  documentDataStore: IStore['documentDataStore'],
  attendeeDataStore: IStore['attendeeDataStore'],
  scope: string,
  authToken: string,
) => {
  const isScopeAdded = await addScope(scope, documentCreateScope);
  if (!isScopeAdded) {
    return;
  }

  const body = await getCreateDocumentRequestBody(
    meeting,
    documentIds,
    personDataStore,
    documentDataStore,
    attendeeDataStore,
  );

  const documentResponse = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
    {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/related; boundary="${boundary}"`,
        authorization: `Bearer ${authToken}`,
      },
      body,
    },
  );
  const result = await documentResponse.json();
  const id = result.id;
  if (!id) {
    console.error(result);
    return;
  }

  return result;
};

export const createMeetingNotes = async (
  meeting: ISegment,
  documentIds: string[],
  setMeetingNotesLoading: (isLoading: boolean) => void,
  personDataStore: IStore['personDataStore'],
  documentDataStore: IStore['documentDataStore'],
  attendeeDataStore: IStore['attendeeDataStore'],
  refetch: () => void,
  scope: string,
  authToken: string,
) => {
  setMeetingNotesLoading(true);
  const document = await createDocument(
    meeting,
    documentIds,
    personDataStore,
    documentDataStore,
    attendeeDataStore,
    scope,
    authToken,
  );

  setMeetingNotesLoading(false);
  const documentShareUrl = document ? `https://docs.google.com/document/d/${document.id}` : null;
  if (documentShareUrl) {
    window.open(documentShareUrl, '_blank');
  }

  refetch();
};
