import { differenceInCalendarDays } from 'date-fns';
import { last } from 'lodash';
import config from '../../constants/config';

const currentDate = new Date();

const isFileWithinTimeWindow = (file: gapi.client.drive.File) => {
  const modifiedTimeProxy = file.sharedWithMeTime || file.createdTime || file.viewedByMeTime;
  return (
    !file.trashed &&
    modifiedTimeProxy &&
    (!config.SHOULD_FILTER_OUT_FILES_MODIFIED_BEFORE_NUMBER_OF_DAYS_BACK ||
      differenceInCalendarDays(currentDate, new Date(modifiedTimeProxy)) <
        config.NUMBER_OF_DAYS_BACK) &&
    (!config.SHOULD_FILTER_OUT_FILES_VIEWED_BY_ME_BEFORE_NUMBER_OF_DAYS_BACK ||
      (file.viewedByMeTime &&
        differenceInCalendarDays(currentDate, new Date(file.viewedByMeTime)) <
          config.NUMBER_OF_DAYS_BACK))
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
      pageSize: 30,
      fields:
        'nextPageToken, files(id, name, mimeType, webViewLink, owners, shared, starred, iconLink, trashed, modifiedByMe, viewedByMe, viewedByMeTime, sharedWithMeTime)',
    } as any;
    if (pageToken) {
      options.pageToken = pageToken;
    }
    const request = gapi.client.drive.files.list(options);
    request.execute(resolve);
  });

const fetchAllDriveFiles = async (results: gapi.client.drive.File[], nextPageToken?: string) => {
  const driveResponse: any = await fetchDriveFilePage(nextPageToken);
  const newResults = results.concat(driveResponse.result.files);
  const isWithinTimeWindow = isFileWithinTimeWindow(last(newResults)!);
  if (driveResponse.nextPageToken && isWithinTimeWindow) {
    await fetchAllDriveFiles(newResults, driveResponse.nextPageToken);
  }
  return newResults;
};

const fetchDriveFiles = async () => {
  const results = await fetchAllDriveFiles([]);
  return results.filter((file: gapi.client.drive.File) => isFileWithinTimeWindow(file));
};

export default fetchDriveFiles;
