import { subDays } from 'date-fns';

const scopes = [
  'https://www.googleapis.com/auth/calendar.events.owned.readonly',
  'https://www.googleapis.com/auth/contacts.readonly', // not sure about this one
  'https://www.googleapis.com/auth/gmail.readonly', // cannot use the 'q' parameter
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
  'https://www.googleapis.com/auth/drive.activity.readonly',
];

export default {
  AUTH0_DOMAIN: process.env.NEXT_PUBLIC_AUTH0_DOMAIN || 'test.auth0.com',
  AUTH0_CLIENT_ID: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID || 'test-client-id',
  AUTH0_REDIRECT_URI:
    process.env.NEXT_PUBLIC_AUTH0_REDIRECT_URI || 'http://localhost:3000/dashboard',
  GOOGLE_SCOPES: scopes,
  GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  SHOULD_FILTER_OUT_FILES_MODIFIED_BEFORE_NUMBER_OF_DAYS_BACK: true,
  SHOULD_FILTER_OUT_FILES_VIEWED_BY_ME_BEFORE_NUMBER_OF_DAYS_BACK: true,
  SHOULD_FILTER_OUT_NOT_ATTENDING_EVENTS: true,
  NUMBER_OF_DAYS_BACK: 7,
  WEEK_STARTS_ON: 0,
  PROJECT_PLAN_LINK:
    'https://paper.dropbox.com/doc/PRD-Kelp--A4JorXdRzV~85B02WO_LKxvxAQ-BYyp9SN4nRnibg3Rl20th',
  startDate: subDays(new Date(), 7),
  YELLOW_BACKGROUND: '#deff2a', // TODO: Add to theme somehow?
  ORANGE_BACKGROUND: '#ffd12a',
};
