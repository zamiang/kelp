import { subDays } from 'date-fns';
export default {
  AUTH0_DOMAIN: process.env.AUTH0_DOMAIN || 'localhost:3000',
  AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID || 'asdfsdf',
  AUTH0_REDIRECT_URI: process.env.AUTH0_REDIRECT_URI || 'https://foo.bar',
  DOMAIN: 'https://www.kelp.nyc',
  SHOULD_FILTER_OUT_FILES_MODIFIED_BEFORE_NUMBER_OF_DAYS_BACK: true,
  SHOULD_FILTER_OUT_FILES_VIEWED_BY_ME_BEFORE_NUMBER_OF_DAYS_BACK: true,
  SHOULD_FILTER_OUT_NOT_ATTENDING_EVENTS: true,
  NUMBER_OF_DAYS_BACK: 7,
  PROJECT_PLAN_LINK:
    'https://paper.dropbox.com/doc/PRD-Kelp--A4JorXdRzV~85B02WO_LKxvxAQ-BYyp9SN4nRnibg3Rl20th',
  startDate: subDays(new Date(), 7),
};
