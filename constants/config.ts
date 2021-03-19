import { addDays, subDays } from 'date-fns';

// NOTE: Update in webpack.config.js
const scopes = [
  'https://www.googleapis.com/auth/calendar.events.readonly',
  'https://www.googleapis.com/auth/contacts.readonly',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
  'https://www.googleapis.com/auth/drive.activity.readonly',
  'https://www.googleapis.com/auth/drive.file',
];

const NUMBER_OF_DAYS_BACK = 30;
const NUMBER_OF_DAYS_FORWARD = 14;

export default {
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  REDIRECT_URI: process.env.NEXT_PUBLIC_REDIRECT_URI || 'http://localhost:3000/dashboard',
  GOOGLE_SCOPES: scopes,
  GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  SHOULD_FILTER_OUT_NOT_ATTENDING_EVENTS: true,
  NUMBER_OF_DAYS_BACK,
  WEEK_STARTS_ON: 0,
  MEETING_PREP_NOTIFICATION_EARLY_MINUTES: 10,
  ATTENDEE_MAX: 10, // for 'show more'
  IS_GMAIL_ENABLED: false,
  GOOGLE_CALENDAR_FILTER: ['declined'], // Could be ['needsAction', 'declined']
  MAX_MEETING_ATTENDEE_TO_COUNT_AN_INTERACTION: 10,
  startDate: subDays(new Date(), NUMBER_OF_DAYS_BACK),
  endDate: addDays(new Date(), NUMBER_OF_DAYS_FORWARD),
  kelpNotificationsKey: 'kelpNotificationsDisabled',
  YELLOW_BACKGROUND: '#deff2a', //'#deff2a', // TODO: Add to theme somehow?
  ORANGE_BACKGROUND: '#fff9e1', // '#ffd12a',
  PURPLE_BACKGROUND: '#722aff',
  PINK_BACKGROUND: '#ffe2f5', //#ff2ab4',
  BLUE_BACKGROUND: '#E5F7FF', // '#2aceff',
};
