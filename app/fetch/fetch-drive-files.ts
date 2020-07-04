import { differenceInCalendarDays } from 'date-fns';
import { NUMBER_OF_DAYS_BACK } from './fetch-first';

const fetchDriveFiles = async () => {
  // Does not allow filtering by modified time OR deleted
  const driveResponse = await gapi.client.drive.files.list({
    includeItemsFromAllDrives: true,
    includeTeamDriveItems: true,
    supportsAllDrives: true,
    supportsTeamDrives: true,
    orderBy: 'modifiedTime desc',
    pageSize: 30,
    fields:
      'nextPageToken, files(id, name, webViewLink, owners, shared, starred, trashed, modifiedTime)',
  });

  return driveResponse && driveResponse.result && driveResponse.result.files
    ? driveResponse.result.files.filter(
        (file) =>
          !file.trashed &&
          file.modifiedTime &&
          differenceInCalendarDays(new Date(), new Date(file.modifiedTime)) < NUMBER_OF_DAYS_BACK,
      )
    : [];
};

export default fetchDriveFiles;
