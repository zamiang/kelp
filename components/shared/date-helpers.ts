import { getWeek as dateFnsGetWeek } from 'date-fns';
import config from '../../constants/config';

export const getWeek = (date: Date) =>
  dateFnsGetWeek(date, { weekStartsOn: Number(config.WEEK_STARTS_ON) as any });
