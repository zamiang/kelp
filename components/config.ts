import { subDays } from 'date-fns';
export default {
  DOMAIN: 'https://www.kelp.nyc',
  SHOULD_FILTER_OUT_FILES_MODIFIED_BEFORE_NUMBER_OF_DAYS_BACK: true,
  SHOULD_FILTER_OUT_FILES_VIEWED_BY_ME_BEFORE_NUMBER_OF_DAYS_BACK: true,
  SHOULD_FILTER_OUT_NOT_ATTENDING_EVENTS: true,
  NUMBER_OF_DAYS_BACK: 7,
  PROJECT_PLAN_LINK:
    'https://paper.dropbox.com/doc/PRD-Kelp--A4JorXdRzV~85B02WO_LKxvxAQ-BYyp9SN4nRnibg3Rl20th',
  startDate: subDays(new Date(), 7),
};
