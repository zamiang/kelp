import { uniq } from 'lodash';
import { ICalendarEvent } from './fetch-calendar-events';
import { IFormattedDriveActivity } from './fetch-drive-activity';
import { formattedEmail } from './fetch-emails';
import FetchFirst from './fetch-first';
import { person } from './fetch-people';
import FetchSecond from './fetch-second';
import FetchThird from './fetch-third';

interface IReturnType {
  personList: person[];
  emailAddresses: string[];
  emails: formattedEmail[];
  calendarEvents: ICalendarEvent[];
  driveFiles: gapi.client.drive.File[];
  driveActivity: IFormattedDriveActivity[];
  isLoading: boolean;
  refetch: () => void;
  lastUpdated: Date;
}

const FetchAll = (accessToken: string): IReturnType => {
  const firstLayer = FetchFirst(accessToken);
  const googleDocIds = firstLayer.driveFiles.map((file) => file.id!);
  const secondLayer = FetchSecond({
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
  };
};

export default FetchAll;
