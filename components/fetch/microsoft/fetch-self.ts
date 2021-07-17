import { AccountInfo, IPublicClientApplication } from '@azure/msal-browser';
import { IPerson } from '../../store/data-types';

const formatPerson = (person: AccountInfo, googleSelf?: IPerson): IPerson => ({
  id: person.username,
  name: person.name || person.username,
  emailAddresses: googleSelf?.emailAddresses
    ? googleSelf?.emailAddresses.concat(person.username)
    : [person.username],
  googleIds: googleSelf?.googleIds || [],
  isCurrentUser: 1,
  isInContacts: true,
  dateAdded: googleSelf?.dateAdded || new Date(),
});

export const fetchMicrosoftSelf = (
  msal: IPublicClientApplication,
  googleSelf?: IPerson,
): IPerson => {
  const self = msal.getActiveAccount();
  return formatPerson(self!, googleSelf);
};
