import PromisePool from '@supercharge/promise-pool';
import { differenceInCalendarDays } from 'date-fns';
import { last } from 'lodash';
import config from '../../constants/config';

const isRefetchEnabled = false;
const driveFileFields =
  'id, name, mimeType, webViewLink, owners, shared, starred, iconLink, trashed, modifiedByMe, viewedByMe, viewedByMeTime, sharedWithMeTime, createdTime';

export const getModifiedTimeProxy = (file: gapi.client.drive.File) =>
  last(
    [file.sharedWithMeTime, file.createdTime, file.viewedByMeTime]
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

const fetchDriveFilePage = (pageToken?: string) =>
  new Promise((resolve) => {
    const options = {
      includeItemsFromAllDrives: true,
      includeTeamDriveItems: true,
      supportsAllDrives: true,
      supportsTeamDrives: true,
      orderBy: 'modifiedTime desc',
      pageSize: 100, // ideally we don't refetch after this
      fields: `nextPageToken, files(${driveFileFields})`,
    } as any;
    if (pageToken) {
      options.pageToken = pageToken;
    }
    const request = gapi.client.drive.files.list(options);
    request.execute(resolve);
  });

const fetchAllDriveFiles = async (results: gapi.client.drive.File[], nextPageToken?: string) => {
  const currentDate = new Date();
  const driveResponse: any = await fetchDriveFilePage(nextPageToken);
  const newResults = results.concat(driveResponse.result.files);
  const sortedResults = newResults.map((file) => getModifiedTimeProxy(file)).sort();
  const oldestDate = sortedResults[0];
  if (isRefetchEnabled) {
    const isWithinTimeWindow =
      differenceInCalendarDays(currentDate, oldestDate!) < config.NUMBER_OF_DAYS_BACK;

    if (driveResponse.nextPageToken && isWithinTimeWindow) {
      await fetchAllDriveFiles(newResults, driveResponse.nextPageToken);
    }
  }
  return newResults;
};

const fetchDriveFiles = async () => {
  const results = await fetchAllDriveFiles([]);
  return results.filter((file: gapi.client.drive.File) => isFileWithinTimeWindow(file));
};

export const fetchDriveFilesById = async (ids: string[]) => {
  const { results, errors } = await PromisePool.withConcurrency(5)
    .for(ids)
    .process(async (id) => {
      const file = await gapi.client.drive.files.get({
        fileId: id,
        fields: driveFileFields,
      });
      return file.result;
    });
  console.log(results, errors, 'fetch drive files');
  return results;
};

export default fetchDriveFiles;
