import { getWeek as dateFnsGetWeek, getDay } from 'date-fns';
import config from '../../constants/config';

export const getWeek = (date: Date) => {
  let week = dateFnsGetWeek(date, { weekStartsOn: Number(config.WEEK_STARTS_ON) as any });

  // On sunday, move to next week
  if (getDay(date) === 6) {
    week = week + 1;
  }
  return week;
};
