import { differenceInDays } from 'date-fns';

/**
 * Decay factor for time-based scoring
 * Items lose 5% of their value per day
 */
const DECAY_FACTOR = 0.95;

/**
 * Calculate the decay value for a given date
 * More recent dates have higher values (max 1.0 for today)
 *
 * @param date - The date to calculate value for
 * @returns A value between 0 and 1, with 1 being today
 */
export const getValueForDate = (date: Date | undefined | null): number => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return 0;
  }

  const daysFromToday = differenceInDays(new Date(), date);

  // Today or future dates get full value
  if (daysFromToday < 1) {
    return 1;
  }

  // Apply exponential decay for past dates
  return Math.pow(DECAY_FACTOR, daysFromToday);
};

/**
 * Order items by their accumulated time-decayed count
 *
 * This function groups items by a specified ID key, accumulates their
 * time-weighted scores based on a date field, and returns unique items
 * sorted by their total score in descending order.
 *
 * For items with the same ID:
 * - Scores are accumulated from all occurrences
 * - The most recent item (by date) is kept as the representative
 *
 * @param items - Array of items to sort
 * @param idKey - The property name to use as the unique identifier
 * @param dateKey - The property name containing the date for decay calculation
 * @returns Array of unique items sorted by accumulated score (highest first)
 *
 * @example
 * const websites = orderByCount(websiteVisits, 'websiteId', 'visitedTime');
 */
export const orderByCount = <T extends Record<string, any>>(
  items: T[],
  idKey: keyof T,
  dateKey: keyof T,
): T[] => {
  // Handle edge cases
  if (!items || items.length === 0) {
    return [];
  }

  // Track items and their accumulated scores
  const itemsById = new Map<string, T>();
  const scoreById = new Map<string, number>();
  const latestDateById = new Map<string, Date>();

  // Process each item
  items.forEach((item) => {
    const id = String(item[idKey]);
    const date = item[dateKey] as Date | undefined;

    // Skip items without valid IDs
    if (!id || id === 'undefined' || id === 'null') {
      return;
    }

    // Calculate the time-decayed value for this occurrence
    const value = getValueForDate(date);

    // Accumulate the score
    const currentScore = scoreById.get(id) || 0;
    scoreById.set(id, currentScore + value);

    // Keep the most recent item as the representative
    const currentLatestDate = latestDateById.get(id);
    const shouldUpdate =
      !currentLatestDate || (date && (!currentLatestDate || date > currentLatestDate));

    if (shouldUpdate) {
      itemsById.set(id, item);
      if (date) {
        latestDateById.set(id, date);
      }
    } else if (!itemsById.has(id)) {
      // If we don't have a date to compare, at least keep one item
      itemsById.set(id, item);
    }
  });

  // Sort items by their accumulated scores
  const sortedIds = Array.from(scoreById.keys()).sort((a, b) => {
    const scoreA = scoreById.get(a) || 0;
    const scoreB = scoreById.get(b) || 0;

    // Sort by score (descending)
    if (scoreA !== scoreB) {
      return scoreB - scoreA;
    }

    // For equal scores, sort by most recent date (if available)
    const dateA = latestDateById.get(a);
    const dateB = latestDateById.get(b);

    if (dateA && dateB) {
      return dateB.getTime() - dateA.getTime();
    }

    // Fallback to ID for stable sorting
    return a.localeCompare(b);
  });

  // Return the sorted items
  return sortedIds.map((id) => itemsById.get(id)).filter((item): item is T => item !== undefined);
};

/**
 * Order items by their accumulated time-decayed count with additional options
 *
 * @param items - Array of items to sort
 * @param idKey - The property name to use as the unique identifier
 * @param dateKey - The property name containing the date for decay calculation
 * @param options - Additional options for sorting
 * @returns Array of unique items sorted by accumulated score
 */
export const orderByCountWithOptions = <T extends Record<string, any>>(
  items: T[],
  idKey: keyof T,
  dateKey: keyof T,
  options?: {
    ascending?: boolean;
    mergeArrays?: (keyof T)[];
    keepAll?: boolean;
  },
): T[] | { item: T; score: number }[] => {
  const sorted = orderByCount(items, idKey, dateKey);

  if (options?.ascending) {
    sorted.reverse();
  }

  if (options?.keepAll) {
    // Return items with their scores for debugging/analysis
    const scoreById = new Map<string, number>();

    items.forEach((item) => {
      const id = String(item[idKey]);
      const date = item[dateKey] as Date | undefined;
      const value = getValueForDate(date);
      const currentScore = scoreById.get(id) || 0;
      scoreById.set(id, currentScore + value);
    });

    return sorted.map((item) => ({
      item,
      score: scoreById.get(String(item[idKey])) || 0,
    }));
  }

  return sorted;
};
