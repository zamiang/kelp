import { subDays } from 'date-fns';
export default {
  DOMAIN: 'https://www.kelp.nyc',
  SHOULD_FILTER_OUT_FILES_MODIFIED_BEFORE_NUMBER_OF_DAYS_BACK: true,
  SHOULD_FILTER_OUT_FILES_VIEWED_BY_ME_BEFORE_NUMBER_OF_DAYS_BACK: true,
  SHOULD_FILTER_OUT_NOT_ATTENDING_EVENTS: true,
  NUMBER_OF_DAYS_BACK: 7,
  startDate: subDays(new Date(), 7),
};
