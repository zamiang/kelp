import { differenceInDays } from 'date-fns';

const decay = 0.95;

export const getValueForDate = (date: Date) => {
  const daysFromToday = differenceInDays(new Date(), date);
  if (daysFromToday < 1) {
    return 1;
  }
  return decay ** daysFromToday;
};

export const orderByCount = (items: any[], idKey: string, dateKey: string) => {
  const itemsById: { [key: string]: any } = {};
  const count: { [key: string]: number } = {};
  items.forEach((item) => {
    itemsById[item[idKey]] = item;

    if (count[item[idKey]]) {
      count[item[idKey]] = count[item[idKey]] + getValueForDate(item[dateKey]);
    } else {
      count[item[idKey]] = getValueForDate(item[dateKey]);
    }
  });
  const orderedKeys = Object.keys(count).sort((a, b) => count[b] - count[a]);
  return orderedKeys.map((k) => itemsById[k]);
};
