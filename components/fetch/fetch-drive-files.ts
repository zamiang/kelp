import { differenceInCalendarDays } from 'date-fns';
import config from '../../components/config';

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
      'nextPageToken, files(id, name, mimeType, webViewLink, owners, shared, starred, iconLink, trashed, modifiedTime, modifiedByMe, viewedByMe, viewedByMeTime)',
  });

  return driveResponse && driveResponse.result && driveResponse.result.files
    ? driveResponse.result.files.filter(
        (file) =>
          !file.trashed &&
          file.modifiedTime &&
          (!config.SHOULD_FILTER_OUT_FILES_MODIFIED_BEFORE_NUMBER_OF_DAYS_BACK ||
            differenceInCalendarDays(new Date(), new Date(file.modifiedTime)) <
              config.NUMBER_OF_DAYS_BACK) &&
          (!config.SHOULD_FILTER_OUT_FILES_VIEWED_BY_ME_BEFORE_NUMBER_OF_DAYS_BACK ||
            (file.viewedByMeTime &&
              differenceInCalendarDays(new Date(), new Date(file.viewedByMeTime)) <
                config.NUMBER_OF_DAYS_BACK)),
      )
    : [];
};

export default fetchDriveFiles;
