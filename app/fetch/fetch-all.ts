import FetchFirst, { ICalendarEvent, IFormattedDriveActivity, person } from './fetch-first';
import FetchSecond, { formattedEmail } from './fetch-second';

interface IReturnType {
  personList: person[];
  emailList: string[];
  emails: formattedEmail[];
  calendarEvents?: ICalendarEvent[];
  driveFiles?: gapi.client.drive.File[];
  driveActivity: IFormattedDriveActivity[];
  isLoading: boolean;
}

const FetchAll = (accessToken: string): IReturnType => {
  const firstLayer = FetchFirst(accessToken);
  const secondLayer = FetchSecond({
    personList: firstLayer.personList,
    emailList: firstLayer.emailList,
  });

  return {
    ...firstLayer,
    ...secondLayer,
    isLoading: firstLayer.isLoading && secondLayer.isLoading,
  };
};

export default FetchAll;
