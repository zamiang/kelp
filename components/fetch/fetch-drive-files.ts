import PromisePool from '@supercharge/promise-pool';
import { differenceInCalendarDays } from 'date-fns';
import { last } from 'lodash';
import config from '../../constants/config';

const isRefetchEnabled = false;
const driveFileFields =
  'id, name, mimeType, webViewLink, owners, shared, starred, iconLink, trashed, modifiedByMe, viewedByMe, viewedByMeTime, sharedWithMeTime, createdTime';

export const getModifiedTimeProxy = (file: gapi.client.drive.File) =>
  last(
    [file?.sharedWithMeTime, file?.createdTime, file?.viewedByMeTime]
      .filter(Boolean)
      .map((d) => new Date(d!))
      .sort(),
  );

const isFileWithinTimeWindow = (file: gapi.client.drive.File) => {
  const currentDate = new Date();
  const modifiedTimeProxy = getModifiedTimeProxy(file);
  return (
    !file.trashed &&
    modifiedTimeProxy &&
    differenceInCalendarDays(currentDate, modifiedTimeProxy) < config.NUMBER_OF_DAYS_BACK
  );
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
  return results.filter((file: gapi.client.drive.File) => isFileWithinTimeWindow(file));
};

export const fetchDriveFilesById = async (ids: string[], authToken: string) => {
  const params = {
    fields: driveFileFields,
  };
  const searchParams = new URLSearchParams(params).toString();
  const { results } = await PromisePool.withConcurrency(3)
    .for(ids)
    .process(async (id) => {
      const fileResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files/${id}?${searchParams}`,
        {
          headers: {
            authorization: `Bearer ${authToken}`,
          },
        },
      );
      const file = await fileResponse.json();
      return file;
    });
  return results;
};

export default fetchDriveFiles;
