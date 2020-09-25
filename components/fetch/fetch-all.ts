import { uniq } from 'lodash';
import { ICalendarEvent } from './fetch-calendar-events';
import { IFormattedDriveActivity } from './fetch-drive-activity';
import { formattedEmail } from './fetch-emails';
import FetchFirst from './fetch-first';
import { person } from './fetch-people';
import FetchSecond from './fetch-second';
import FetchThird from './fetch-third';

interface IReturnType {
  readonly personList: person[];
  readonly emailAddresses: string[];
  readonly emails: formattedEmail[];
  readonly calendarEvents: ICalendarEvent[];
  readonly driveFiles: gapi.client.drive.File[];
  readonly driveActivity: IFormattedDriveActivity[];
  readonly isLoading: boolean;
  readonly refetch: () => void;
  readonly lastUpdated: Date;
  readonly error: Error | undefined;
}

const FetchAll = (accessToken: string): IReturnType => {
  const firstLayer = FetchFirst(accessToken);
  const googleDocIds = firstLayer.driveFiles.map((file) => file.id!);
  const secondLayer = FetchSecond({
    isLoading: firstLayer.isLoading,
    googleDocIds,
  });
  const peopleIds = uniq(
    secondLayer.driveActivity.map((activity) => activity.actorPersonId).filter((id) => !!id),
  ) as string[];
  const thirdLayer = FetchThird({
    peopleIds,
    emailAddresses: firstLayer.emailAddresses,
  });

  return {
    ...firstLayer,
    ...secondLayer,
    ...thirdLayer,
    refetch: async () => {
      await firstLayer.refetchCalendarEvents();
      await firstLayer.refetchDriveFiles();
      await secondLayer.refetchDriveActivity();
      await thirdLayer.refetchPersonList();
    },
    isLoading: firstLayer.isLoading && secondLayer.isLoading && thirdLayer.isLoading,
    error: firstLayer.error || secondLayer.error || thirdLayer.error,
  };
};

export default FetchAll;
