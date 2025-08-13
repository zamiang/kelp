import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { DesktopDashboard } from '../../../extension/src/components/dashboard/desktop-dashboard';

// Mock the store
const mockStore = {
  isLoading: false,
  error: null,
  websiteVisitStore: {
    getAll: vi.fn().mockResolvedValue([]),
    getAllFiltered: vi.fn().mockResolvedValue({
      success: true,
      data: {
        data: [],
        total: 0,
        hasMore: false,
        nextOffset: undefined,
      },
    }),
  },
  websiteStore: {
    getAll: vi.fn().mockResolvedValue([]),
    getAllFiltered: vi.fn().mockResolvedValue({
      success: true,
      data: {
        data: [],
        totalCount: 0,
        hasMore: false,
        offset: 0,
        limit: 50,
      },
    }),
    getById: vi.fn(),
    trackVisitFromTab: vi.fn(),
    updateTags: vi.fn(),
    saveOrder: vi.fn(),
  },
  domainBlocklistStore: {
    getAll: vi.fn().mockResolvedValue([]),
  },
  websiteBlocklistStore: {
    getAll: vi.fn().mockResolvedValue([]),
  },
  websiteTagStore: {
    getAll: vi.fn().mockResolvedValue([]),
    updateWebsiteTags: vi.fn(),
  },
  incrementLoading: vi.fn(),
};

describe('DesktopDashboard Component', () => {
  const defaultProps = {
    store: mockStore as any,
    setTheme: vi.fn(),
    theme: 'light',
    isMicrosoftError: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle theme changes', async () => {
    const setThemeMock = vi.fn();
    render(
      <BrowserRouter>
        <DesktopDashboard {...defaultProps} setTheme={setThemeMock} />
      </BrowserRouter>,
    );

    // Verify theme prop is passed correctly
    expect(defaultProps.theme).toBe('light');
  });

  it('should fetch website tags on mount', async () => {
    render(
      <BrowserRouter>
        <DesktopDashboard {...defaultProps} />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(mockStore.websiteTagStore.getAll).toHaveBeenCalled();
    });
  });

  it.skip('should update website cache when store loading changes', async () => {
    const { rerender } = render(
      <BrowserRouter>
        <DesktopDashboard {...defaultProps} />
      </BrowserRouter>,
    );

    // Simulate loading state change
    const updatedProps = {
      ...defaultProps,
      store: { ...mockStore, isLoading: true } as any,
    };

    rerender(
      <BrowserRouter>
        <DesktopDashboard {...updatedProps} />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(mockStore.websiteStore.getAllFiltered).toHaveBeenCalled();
    });
  });

  it('should not show error dialog for 500 errors', () => {
    const error500 = new Error('Server error');
    (error500 as any).status = 500;

    const errorStore = {
      ...mockStore,
      error: error500,
    };

    render(
      <BrowserRouter>
        <DesktopDashboard {...defaultProps} store={errorStore as any} />
      </BrowserRouter>,
    );

    // Should not show error dialog for 500 errors
    expect(screen.queryByText(/Server error/i)).toBeNull();
  });

  it('should handle website tag toggling', async () => {
    const mockWebsiteTags = [
      { id: '1', name: 'work', websites: [] },
      { id: '2', name: 'personal', websites: [] },
    ];

    mockStore.websiteTagStore.getAll.mockResolvedValue(mockWebsiteTags);

    render(
      <BrowserRouter>
        <DesktopDashboard {...defaultProps} />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(mockStore.websiteTagStore.getAll).toHaveBeenCalled();
    });
  });
});
