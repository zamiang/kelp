import { person } from './fetch-people';

export const fetchSelf = (): person => {
  const profile = gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile();
  return {
    id: profile.getId(),
    name: `${profile.getGivenName()} ${profile.getFamilyName()}`,
    emailAddresses: [profile.getEmail()],
    isInContacsts: true,
    imageUrl: profile.getImageUrl(),
  };
};
