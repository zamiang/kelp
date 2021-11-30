import { addDays, subDays } from 'date-fns';

// NOTE: Update in webpack.config.js
const scopes = [
  'https://www.googleapis.com/auth/calendar.events.readonly',
  'https://www.googleapis.com/auth/contacts.readonly',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
];

const NUMBER_OF_DAYS_BACK = 30;
const NUMBER_OF_DAYS_FORWARD = 14;

export default {
  THEME: 'THEME',
  THEME_COOL: 'cool',
  THEME_DARK: 'dark',
  THEME_LIGHT: 'light',
  THEME_NB: 'nb',
  THEME_COOL_COLOR: '#bcebff',
  THEME_DARK_COLOR: '#262736',
  THEME_LIGHT_COLOR: '#193202',
  THEME_NB_COLOR: 'rgb(233,224,209)',
  THEME_NB_HIGHLIGHT_COLOR: 'rgb(84,198,183)',
  THEME_COOL_HIGHLIGHT_COLOR: '#0025E7',
  THEME_DARK_HIGHLIGHT_COLOR: '#BB89FC',
  THEME_LIGHT_HIGHLIGHT_COLOR: '#EBFF02',
  IS_ONBOARDING_COMPLETED: 'IS_ONBOARDING_COMPLETED_V2',
  GOOGLE_ENABLED: 'IS_GOOGLE_ENABLED',
  GOOGLE_SCOPES: scopes,
  GOOGLE_CLIENT_ID_CHROME:
    '296254551365-v8olgrucl4t2b1oa22fnr1r23390umvl.apps.googleusercontent.com',
  GOOGLE_CLIENT_ID_NOT_CHROME:
    '296254551365-7bblc0lmtpghkbhqbm135h95fvj7n7sa.apps.googleusercontent.com',
  GOOGLE_CALENDAR_FILTER: ['declined'], // Could be ['needsAction', 'declined']
  SHOULD_FILTER_OUT_NOT_ATTENDING_EVENTS: true,
  NUMBER_OF_DAYS_BACK,
  WEEK_STARTS_ON: 0,
  MEETING_PREP_NOTIFICATION_EARLY_MINUTES: 10,
  ATTENDEE_MAX: 10, // for 'show more'
  ICON_SIZE: 20,
  MAX_MEETING_ATTENDEE_TO_COUNT_AN_INTERACTION: 10,
  startDate: subDays(new Date(), NUMBER_OF_DAYS_BACK),
  endDate: addDays(new Date(), NUMBER_OF_DAYS_FORWARD),
  NOTIFICATIONS_KEY: 'KELP_NOTIFICATION_SETTING',
  LAST_NOTIFICATION_KEY: 'KELP_LAST_NOTIFICATION_ID',
  LAST_UPDATED: 'KELP_LAST_UPDATED',
  LAST_UPDATED_USER_ID: 'KELP_LAST_UPDATED_USER_ID',
  ALLOWED_DOMAINS: [
    'docs.google.com',
    'slides.google.com',
    'sheets.google.com',
    'figma.com',
    'notion.so',
    'miro.com',
    'github.com',
    'jira.com',
    'loom.com',
    'basecamp.com',
    'microsoft.com', // not sure about them
    'miro.com',
    'basecamp.com',
    'dribbble.com',
    'amplitude.com',
    'gitlab.com',
    'evernote.com',
    'linkedin.com',
    'trello.com',
    'invisionapp.com',
    'roamresearch.com',
    'obsidian.md',
    'clickup.com',
    'asana.com',
    'hypercontext.com',
    'soapboxhq.com',
    'almanac.io',
  ],
  BLOCKED_DOMAINS: [
    'onkkkcfnlbkoialleldfbgodakajfpnl', // extension url
    'www.google.com',
    'calendar.google.com',
    'chrome://',
    'meet.google.com',
    'file:///',
    'twitter.com/home',
  ],
};
