import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getWebsitesCache } from '../../../components/website/get-featured-websites';
import { IWebsiteItem, IWebsiteVisit } from '../../../extension/src/components/store/data-types';
import config from '../../../constants/config';

// Mock the order-by-count module
vi.mock('../../../components/shared/order-by-count', () => ({
  getValueForDate: (date: Date) => {
    const daysFromToday = Math.floor(
      (new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (daysFromToday < 1) return 1;
    return Math.pow(0.95, daysFromToday);
  },
}));

describe('getWebsitesCache', () => {
  let mockWebsiteStore: any;
  let mockWebsiteVisitStore: any;
  let mockDomainBlocklistStore: any;
  let mockWebsiteBlocklistStore: any;

  beforeEach(() => {
    // Mock stores with successful responses
    mockWebsiteStore = {
      getAllFiltered: vi.fn().mockResolvedValue({
        success: true,
        data: {
          data: [
            {
              id: 'github.com/test-repo',
              domain: 'github.com',
              title: 'Test Repository',
              rawUrl: 'https://github.com/test-repo',
              tags: 'test repository code',
            } as IWebsiteItem,
            {
              id: 'docs.google.com/document1',
              domain: 'docs.google.com',
              title: 'Project Document',
              rawUrl: 'https://docs.google.com/document1',
              tags: 'project document',
            } as IWebsiteItem,
          ],
        },
      }),
    };

    mockWebsiteVisitStore = {
      getAllFiltered: vi.fn().mockResolvedValue({
        success: true,
        data: {
          data: [] as IWebsiteVisit[],
        },
      }),
    };

    mockDomainBlocklistStore = {
      getAll: vi.fn().mockResolvedValue([]),
    };

    mockWebsiteBlocklistStore = {
      getAll: vi.fn().mockResolvedValue([]),
    };
  });

  it('should initialize websites with zero visit count when no visits exist', async () => {
    const result = await getWebsitesCache(
      mockWebsiteVisitStore,
      mockWebsiteStore,
      mockDomainBlocklistStore,
      mockWebsiteBlocklistStore,
    );

    expect(result).toHaveProperty('github.com/test-repo');
    expect(result).toHaveProperty('docs.google.com/document1');

    expect(result['github.com/test-repo'].visitCount).toBe(0);
    expect(result['github.com/test-repo'].meetings).toEqual([]);
    expect(result['github.com/test-repo'].lastVisited).toEqual(config.startDate);
  });

  it('should properly aggregate visits by date and calculate scores', async () => {
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000);

    // Mock website visits with multiple visits on same day and different days
    mockWebsiteVisitStore.getAllFiltered.mockResolvedValue({
      success: true,
      data: {
        data: [
          // Multiple visits to same site on same day (should count as 1 day with multiple visits)
          {
            id: 'visit1',
            websiteId: 'github.com/test-repo',
            url: 'https://github.com/test-repo',
            domain: 'github.com',
            visitedTime: today,
            segmentId: 'meeting1',
          } as IWebsiteVisit,
          {
            id: 'visit2',
            websiteId: 'github.com/test-repo',
            url: 'https://github.com/test-repo',
            domain: 'github.com',
            visitedTime: new Date(today.getTime() + 60000), // 1 minute later same day
            segmentId: 'meeting1',
          } as IWebsiteVisit,
          // Visit on different day
          {
            id: 'visit3',
            websiteId: 'github.com/test-repo',
            url: 'https://github.com/test-repo',
            domain: 'github.com',
            visitedTime: yesterday,
            segmentId: 'meeting2',
          } as IWebsiteVisit,
          // Visit to different website
          {
            id: 'visit4',
            websiteId: 'docs.google.com/document1',
            url: 'https://docs.google.com/document1',
            domain: 'docs.google.com',
            visitedTime: twoDaysAgo,
            segmentId: 'meeting3',
          } as IWebsiteVisit,
        ],
      },
    });

    const result = await getWebsitesCache(
      mockWebsiteVisitStore,
      mockWebsiteStore,
      mockDomainBlocklistStore,
      mockWebsiteBlocklistStore,
    );

    // GitHub repo should have higher score due to:
    // 1. More recent visits
    // 2. Multiple days of visits (consistency bonus)
    // 3. Multiple visits per day
    expect(result['github.com/test-repo'].visitCount).toBeGreaterThan(0);
    expect(result['github.com/test-repo'].visitCount).toBeGreaterThan(
      result['docs.google.com/document1'].visitCount,
    );

    // Should track the most recent visit
    expect(result['github.com/test-repo'].lastVisited.getTime()).toBeGreaterThan(
      today.getTime() - 1000, // Within 1 second of today (accounting for the +60000ms visit)
    );

    // Meetings are stored as empty array since we only track meeting IDs internally
    // and don't fetch full ISegment objects for performance reasons
    expect(result['github.com/test-repo'].meetings).toEqual([]);
    expect(result['docs.google.com/document1'].meetings).toEqual([]);
  });

  it('should apply recency bonus for very recent visits', async () => {
    const today = new Date();
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    mockWebsiteVisitStore.getAllFiltered.mockResolvedValue({
      success: true,
      data: {
        data: [
          // Recent visit (should get recency bonus)
          {
            id: 'visit1',
            websiteId: 'github.com/test-repo',
            url: 'https://github.com/test-repo',
            domain: 'github.com',
            visitedTime: today,
          } as IWebsiteVisit,
          // Older visit (no recency bonus)
          {
            id: 'visit2',
            websiteId: 'docs.google.com/document1',
            url: 'https://docs.google.com/document1',
            domain: 'docs.google.com',
            visitedTime: oneWeekAgo,
          } as IWebsiteVisit,
        ],
      },
    });

    const result = await getWebsitesCache(
      mockWebsiteVisitStore,
      mockWebsiteStore,
      mockDomainBlocklistStore,
      mockWebsiteBlocklistStore,
    );

    // Recent visit should have higher score due to recency bonus
    expect(result['github.com/test-repo'].visitCount).toBeGreaterThan(
      result['docs.google.com/document1'].visitCount,
    );
  });

  it('should handle websites with no visits gracefully', async () => {
    // Website exists but has no visits
    const result = await getWebsitesCache(
      mockWebsiteVisitStore,
      mockWebsiteStore,
      mockDomainBlocklistStore,
      mockWebsiteBlocklistStore,
    );

    expect(result['github.com/test-repo']).toBeDefined();
    expect(result['github.com/test-repo'].visitCount).toBe(0);
    expect(result['github.com/test-repo'].meetings).toEqual([]);
    expect(result['github.com/test-repo'].lastVisited).toEqual(config.startDate);
  });

  it('should ignore visits for websites not in the website store', async () => {
    mockWebsiteVisitStore.getAllFiltered.mockResolvedValue({
      success: true,
      data: {
        data: [
          // Visit to website not in store
          {
            id: 'visit1',
            websiteId: 'unknown-website.com',
            url: 'https://unknown-website.com',
            domain: 'unknown-website.com',
            visitedTime: new Date(),
          } as IWebsiteVisit,
        ],
      },
    });

    const result = await getWebsitesCache(
      mockWebsiteVisitStore,
      mockWebsiteStore,
      mockDomainBlocklistStore,
      mockWebsiteBlocklistStore,
    );

    // Should not create entry for unknown website
    expect(result).not.toHaveProperty('unknown-website.com');

    // Should still have entries for known websites
    expect(result).toHaveProperty('github.com/test-repo');
    expect(result).toHaveProperty('docs.google.com/document1');
  });
});
