/**
 * Performance monitoring utility for Chrome extension
 * Tracks key performance metrics for initial page load optimization
 */

interface PerformanceMetrics {
  startTime: number;
  domContentLoaded?: number;
  firstPaint?: number;
  firstContentfulPaint?: number;
  timeToInteractive?: number;
  bundleLoadTime?: number;
  authTime?: number;
  databaseTime?: number;
  cacheComputeTime?: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics;
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.metrics = {
      startTime: performance.now(),
    };
    this.initializeObservers();
  }

  private initializeObservers() {
    // Observe paint metrics
    if ('PerformanceObserver' in window) {
      try {
        const paintObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-paint') {
              this.metrics.firstPaint = entry.startTime;
            } else if (entry.name === 'first-contentful-paint') {
              this.metrics.firstContentfulPaint = entry.startTime;
            }
          }
        });
        paintObserver.observe({ entryTypes: ['paint'] });
        this.observers.push(paintObserver);
      } catch (error) {
        console.warn('Paint observer not supported:', error);
      }
    }

    // Track DOM content loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.metrics.domContentLoaded = performance.now() - this.metrics.startTime;
      });
    } else {
      this.metrics.domContentLoaded = 0; // Already loaded
    }
  }

  markTimeToInteractive() {
    this.metrics.timeToInteractive = performance.now() - this.metrics.startTime;
  }

  markBundleLoaded() {
    this.metrics.bundleLoadTime = performance.now() - this.metrics.startTime;
  }

  markAuthComplete() {
    this.metrics.authTime = performance.now() - this.metrics.startTime;
  }

  markDatabaseReady() {
    this.metrics.databaseTime = performance.now() - this.metrics.startTime;
  }

  markCacheComputed() {
    this.metrics.cacheComputeTime = performance.now() - this.metrics.startTime;
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  logMetrics() {
    const metrics = this.getMetrics();
    console.group('🚀 New Tab Performance Metrics');
    console.log('DOM Content Loaded:', metrics.domContentLoaded?.toFixed(2) + 'ms');
    console.log('First Paint:', metrics.firstPaint?.toFixed(2) + 'ms');
    console.log('First Contentful Paint:', metrics.firstContentfulPaint?.toFixed(2) + 'ms');
    // console.log('Bundle Load Time:', metrics.bundleLoadTime?.toFixed(2) + 'ms');
    // console.log('Authentication Time:', metrics.authTime?.toFixed(2) + 'ms');
    console.log('Database Ready Time:', metrics.databaseTime?.toFixed(2) + 'ms');
    console.log('Cache Compute Time:', metrics.cacheComputeTime?.toFixed(2) + 'ms');
    console.log('Time to Interactive:', metrics.timeToInteractive?.toFixed(2) + 'ms');
    console.groupEnd();

    // Log performance summary
    const tti = metrics.timeToInteractive || 0;
    if (tti < 300) {
      console.log('✅ Excellent performance: TTI < 300ms');
    } else if (tti < 500) {
      console.log('⚡ Good performance: TTI < 500ms');
    } else {
      console.log('⚠️ Performance needs improvement: TTI > 500ms');
    }
  }

  cleanup() {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];
  }
}

// Create global instance
const performanceMonitor = new PerformanceMonitor();

// Auto-log metrics after a delay to capture all measurements
setTimeout(() => {
  performanceMonitor.logMetrics();
}, 5000);

export default performanceMonitor;
