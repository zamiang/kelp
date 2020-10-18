import { person } from './fetch-people';

export const fetchSelf = (): person => {
  const profile = gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile();
  return {
    id: profile.getId(),
    name: `${profile.getGivenName()} ${profile.getFamilyName()}`,
    emailAddress: profile.getEmail(),
    isMissingProfile: false,
    imageUrl: profile.getImageUrl(),
  };
};
