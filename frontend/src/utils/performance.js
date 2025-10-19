/**
 * Performance Optimization Utilities
 */

/**
 * Lazy load images with intersection observer
 */
export const lazyLoadImages = () => {
  const images = document.querySelectorAll('img[data-src]');
  
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  } else {
    // Fallback for browsers that don't support IntersectionObserver
    images.forEach(img => {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    });
  }
};

/**
 * Debounce function for performance
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function for performance
 */
export const throttle = (func, limit = 300) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Cache manager for API responses
 */
class CacheManager {
  constructor(maxAge = 5 * 60 * 1000) { // 5 minutes default
    this.cache = new Map();
    this.maxAge = maxAge;
  }

  set(key, value, customMaxAge = null) {
    const expiresAt = Date.now() + (customMaxAge || this.maxAge);
    this.cache.set(key, { value, expiresAt });
  }

  get(key) {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  has(key) {
    return this.get(key) !== null;
  }

  clear() {
    this.cache.clear();
  }

  delete(key) {
    this.cache.delete(key);
  }

  clearExpired() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

export const apiCache = new CacheManager();

/**
 * Prefetch resources
 */
export const prefetchResource = (url, as = 'fetch') => {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = url;
  link.as = as;
  document.head.appendChild(link);
};

/**
 * Preload critical resources
 */
export const preloadResource = (url, as = 'script') => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = url;
  link.as = as;
  document.head.appendChild(link);
};

/**
 * Measure performance metrics
 */
export const measurePerformance = (metricName, callback) => {
  const startTime = performance.now();
  
  const result = callback();
  
  if (result instanceof Promise) {
    return result.then(data => {
      const endTime = performance.now();
      console.log(`⏱️ ${metricName}: ${(endTime - startTime).toFixed(2)}ms`);
      return data;
    });
  }
  
  const endTime = performance.now();
  console.log(`⏱️ ${metricName}: ${(endTime - startTime).toFixed(2)}ms`);
  return result;
};

/**
 * Request idle callback wrapper
 */
export const runWhenIdle = (callback, timeout = 2000) => {
  if ('requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, { timeout });
  }
  return setTimeout(callback, 1);
};

/**
 * Virtual scroll helper
 */
export const virtualScroll = {
  getVisibleRange: (scrollTop, itemHeight, containerHeight, totalItems) => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      totalItems - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight)
    );
    
    return { startIndex, endIndex };
  },
  
  calculateScrollPadding: (startIndex, endIndex, itemHeight, totalItems) => {
    const topPadding = startIndex * itemHeight;
    const bottomPadding = (totalItems - endIndex - 1) * itemHeight;
    
    return { topPadding, bottomPadding };
  }
};

/**
 * Check if connection is slow
 */
export const isSlowConnection = () => {
  if ('connection' in navigator) {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    return connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g';
  }
  return false;
};

/**
 * Get optimal image size based on viewport and connection
 */
export const getOptimalImageSize = (originalWidth) => {
  const devicePixelRatio = window.devicePixelRatio || 1;
  const viewportWidth = window.innerWidth;
  const connectionSpeed = isSlowConnection();
  
  let width = Math.min(originalWidth, viewportWidth * devicePixelRatio);
  
  if (connectionSpeed) {
    width = Math.floor(width * 0.7); // Reduce by 30% for slow connections
  }
  
  return width;
};

/**
 * Batch DOM updates
 */
export const batchDOMUpdates = (updates) => {
  requestAnimationFrame(() => {
    updates.forEach(update => update());
  });
};

/**
 * Memory usage warning
 */
export const checkMemoryUsage = () => {
  if ('memory' in performance) {
    const { usedJSHeapSize, jsHeapSizeLimit } = performance.memory;
    const usagePercent = (usedJSHeapSize / jsHeapSizeLimit) * 100;
    
    if (usagePercent > 90) {
      console.warn(`⚠️ High memory usage: ${usagePercent.toFixed(2)}%`);
      return { warning: true, percent: usagePercent };
    }
    
    return { warning: false, percent: usagePercent };
  }
  
  return { warning: false, percent: 0 };
};

export default {
  lazyLoadImages,
  debounce,
  throttle,
  apiCache,
  prefetchResource,
  preloadResource,
  measurePerformance,
  runWhenIdle,
  virtualScroll,
  isSlowConnection,
  getOptimalImageSize,
  batchDOMUpdates,
  checkMemoryUsage
};
