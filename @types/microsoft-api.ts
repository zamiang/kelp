export interface MicrosoftCalendarEvent {
  id: string;
  subject: string;
  body?: {
    contentType: string;
    content: string;
  };
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees?: Array<{
    emailAddress: {
      address: string;
      name?: string;
    };
    type: string;
    status?: {
      response: string;
      time?: string;
    };
  }>;
  location?: {
    displayName?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      countryOrRegion?: string;
      postalCode?: string;
    };
  };
  webLink?: string;
  createdDateTime?: string;
  lastModifiedDateTime?: string;
  organizer?: {
    emailAddress: {
      address: string;
      name?: string;
    };
  };
}

export interface MicrosoftUser {
  id: string;
  displayName?: string;
  givenName?: string;
  surname?: string;
  userPrincipalName?: string;
  mail?: string;
  jobTitle?: string;
  officeLocation?: string;
}

export interface MicrosoftDriveItem {
  id: string;
  name: string;
  size?: number;
  createdDateTime: string;
  lastModifiedDateTime: string;
  webUrl?: string;
  downloadUrl?: string;
  file?: {
    mimeType: string;
    hashes?: {
      sha1Hash?: string;
    };
  };
  folder?: {
    childCount: number;
  };
  createdBy?: {
    user: {
      displayName?: string;
      email?: string;
    };
  };
  lastModifiedBy?: {
    user: {
      displayName?: string;
      email?: string;
    };
  };
}

export interface MicrosoftAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  refresh_token?: string;
  id_token?: string;
}

export interface MicrosoftCalendarListResponse {
  value: MicrosoftCalendarEvent[];
  '@odata.nextLink'?: string;
}

export interface MicrosoftDriveListResponse {
  value: MicrosoftDriveItem[];
  '@odata.nextLink'?: string;
}
