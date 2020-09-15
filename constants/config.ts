import { subDays } from 'date-fns';

export default {
  AUTH0_DOMAIN: process.env.NEXT_PUBLIC_AUTH0_DOMAIN || 'test.auth0.com',
  AUTH0_CLIENT_ID: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID || 'test-client-id',
  AUTH0_REDIRECT_URI:
    process.env.NEXT_PUBLIC_AUTH0_REDIRECT_URI || 'http://localhost:3000/dashboard',
  GOOGLE_SCOPES:
    'email profile https://www.googleapis.com/auth/drive.file openid https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/calendar.events.readonly https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/userinfo.email https://mail.google.com/ https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/docs https://www.googleapis.com/auth/contacts.readonly https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/drive.activity.readonly https://www.googleapis.com/auth/contacts https://www.googleapis.com/auth/drive',
  GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  SHOULD_FILTER_OUT_FILES_MODIFIED_BEFORE_NUMBER_OF_DAYS_BACK: true,
  SHOULD_FILTER_OUT_FILES_VIEWED_BY_ME_BEFORE_NUMBER_OF_DAYS_BACK: true,
  SHOULD_FILTER_OUT_NOT_ATTENDING_EVENTS: true,
  NUMBER_OF_DAYS_BACK: 7,

  PROJECT_PLAN_LINK:
    'https://paper.dropbox.com/doc/PRD-Kelp--A4JorXdRzV~85B02WO_LKxvxAQ-BYyp9SN4nRnibg3Rl20th',
  startDate: subDays(new Date(), 7),
  YELLOW_BACKGROUND: '#deff2a', // TODO: Add to theme somehow?
};
