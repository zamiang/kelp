import { differenceInCalendarDays } from 'date-fns';
import { last } from 'lodash';
import config from '../../../constants/config';
import ErrorTracking from '../../error-tracking/error-tracking';
import { IDocument } from '../../store/data-types';

const isRefetchEnabled = false;
const driveFileFields =
  'id, name, mimeType, webViewLink, owners, shared, starred, iconLink, trashed, modifiedByMe, modifiedTime, viewedByMe, viewedByMeTime, sharedWithMeTime, createdTime';

const getModifiedTimeProxy = (file: gapi.client.drive.File) =>
  last(
    [file?.modifiedTime, file?.sharedWithMeTime, file?.createdTime, file?.viewedByMeTime]
      .filter(Boolean)
      .map((d) => new Date(d!))
      .sort(),
  );

const isFileWithinTimeWindow = (file: gapi.client.drive.File) => {
  const currentDate = new Date();
  const modifiedTimeProxy = getModifiedTimeProxy(file);
  return (
    file &&
    !file.trashed &&
    modifiedTimeProxy &&
    differenceInCalendarDays(currentDate, modifiedTimeProxy) < config.NUMBER_OF_DAYS_BACK
  );
};

// TODO: handle one person w/ multiple email addresses
const formatGoogleDoc = (googleDoc?: gapi.client.drive.File): IDocument | null => {
  if (!googleDoc?.id) {
    return null;
  }

  const modifiedTimeProxy = getModifiedTimeProxy(googleDoc);
  return {
    id: googleDoc.id,
    name: googleDoc.name,
    viewedByMe: googleDoc.viewedByMe,
    viewedByMeAt: googleDoc.viewedByMeTime ? new Date(googleDoc.viewedByMeTime) : undefined,
    link: (googleDoc.webViewLink || '').replace('?usp=drivesdk', ''),
    iconLink: googleDoc.iconLink,
    mimeType: googleDoc.mimeType as any,
    isStarred: !!googleDoc.starred,
    isShared: !!googleDoc.shared,
    updatedAt: modifiedTimeProxy ? new Date(modifiedTimeProxy) : undefined,
  };
};

const fetchDriveFilePage = async (googleOauthToken: string, pageToken?: string) => {
  const params = {
    includeItemsFromAllDrives: true,
    includeTeamDriveItems: true,
    supportsAllDrives: true,
    supportsTeamDrives: true,
    orderBy: 'modifiedTime desc',
    pageSize: 100, // ideally we don't refetch after this
    fields: `nextPageToken, files(${driveFileFields})`,
  } as any;
  if (pageToken) {
    params.pageToken = pageToken;
  }
  // gapi.client.drive.files.list(options);
  const driveResponse = await fetch(
    `https://content.googleapis.com/drive/v3/files?${new URLSearchParams(params).toString()}`,
    {
      headers: {
        authorization: `Bearer ${googleOauthToken}`,
      },
    },
  );
  const body = await driveResponse.json();
  if (!driveResponse.ok) {
    ErrorTracking.logErrorInfo(JSON.stringify(params));
    ErrorTracking.logError(driveResponse.statusText);
  }

  return body;
};

const fetchAllDriveFiles = async (
  googleOauthToken: string,
  results: gapi.client.drive.File[],
  nextPageToken?: string,
) => {
  const currentDate = new Date();
  const driveResponse: any = await fetchDriveFilePage(googleOauthToken, nextPageToken);
  const newResults = results.concat(driveResponse.files);
  const sortedResults = newResults.map((file) => getModifiedTimeProxy(file)).sort();
  const oldestDate = sortedResults[0];
  if (isRefetchEnabled) {
    const isWithinTimeWindow =
      differenceInCalendarDays(currentDate, oldestDate!) < config.NUMBER_OF_DAYS_BACK;

    if (driveResponse.nextPageToken && isWithinTimeWindow) {
      await fetchAllDriveFiles(googleOauthToken, newResults, driveResponse.nextPageToken);
    }
  }
  return newResults;
};

const fetchDriveFiles = async (googleOauthToken: string) => {
  const results = await fetchAllDriveFiles(googleOauthToken, []);
  return results
    .filter((file: gapi.client.drive.File) => isFileWithinTimeWindow(file))
    .map((document) => formatGoogleDoc(document));
};

export const fetchDriveFilesById = async (ids: string[], authToken: string, limit: any) => {
  const params = {
    fields: driveFileFields,
  };
  const searchParams = new URLSearchParams(params).toString();
  const idsToRefetch: string[] = [];
  const results = await Promise.all(
    ids.map(async (id) => {
      const fileResponse = await limit(async () =>
        fetch(`https://www.googleapis.com/drive/v3/files/${id}?${searchParams}`, {
          headers: {
            authorization: `Bearer ${authToken}`,
          },
        }),
      );
      if (!fileResponse.ok) {
        ErrorTracking.logErrorInfo(JSON.stringify(params));
        ErrorTracking.logError(fileResponse.statusText);
      }

      if (fileResponse.status === 200) {
        const file = await fileResponse.json();
        return file;
      } else if (fileResponse.status === 429) {
        idsToRefetch.push(id);
      }
    }),
  );
  return results.map((document) => formatGoogleDoc(document));
};

export default fetchDriveFiles;
