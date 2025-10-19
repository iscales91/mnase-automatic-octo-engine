/**
 * Accessibility Utilities - ARIA labels, keyboard navigation, WCAG compliance
 */

/**
 * Trap focus within a modal or dialog
 */
export const trapFocus = (element) => {
  const focusableElements = element.querySelectorAll(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );
  
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  const handleTabKey = (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    }
  };

  element.addEventListener('keydown', handleTabKey);
  
  // Return cleanup function
  return () => {
    element.removeEventListener('keydown', handleTabKey);
  };
};

/**
 * Announce message to screen readers
 */
export const announceToScreenReader = (message, priority = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * Check if element is visible in viewport
 */
export const isElementVisible = (element) => {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

/**
 * Skip to main content functionality
 */
export const SkipToContent = () => {
  const handleSkip = (e) => {
    e.preventDefault();
    const mainContent = document.querySelector('main') || document.querySelector('[role="main"]');
    if (mainContent) {
      mainContent.tabIndex = -1;
      mainContent.focus();
      mainContent.addEventListener('blur', () => {
        mainContent.removeAttribute('tabindex');
      }, { once: true });
    }
  };

  return (
    <a
      href="#main-content"
      onClick={handleSkip}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded"
    >
      Skip to main content
    </a>
  );
};

/**
 * Keyboard navigation helper
 */
export const handleKeyboardNavigation = (items, currentIndex, key) => {
  let newIndex = currentIndex;
  
  switch (key) {
    case 'ArrowDown':
    case 'ArrowRight':
      newIndex = (currentIndex + 1) % items.length;
      break;
    case 'ArrowUp':
    case 'ArrowLeft':
      newIndex = currentIndex - 1 < 0 ? items.length - 1 : currentIndex - 1;
      break;
    case 'Home':
      newIndex = 0;
      break;
    case 'End':
      newIndex = items.length - 1;
      break;
    default:
      return currentIndex;
  }
  
  return newIndex;
};

/**
 * Generate unique ID for ARIA attributes
 */
let idCounter = 0;
export const generateId = (prefix = 'a11y') => {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
};

/**
 * ARIA label helpers
 */
export const ariaLabels = {
  navigation: {
    main: 'Main navigation',
    breadcrumb: 'Breadcrumb',
    pagination: 'Pagination',
    tabs: 'Tabs navigation'
  },
  
  buttons: {
    close: 'Close',
    menu: 'Toggle menu',
    search: 'Search',
    filter: 'Filter options',
    sort: 'Sort options',
    expand: 'Expand section',
    collapse: 'Collapse section'
  },
  
  forms: {
    required: 'Required field',
    optional: 'Optional field',
    error: 'Error in this field',
    success: 'Valid input'
  },
  
  status: {
    loading: 'Loading content',
    success: 'Operation successful',
    error: 'Error occurred',
    warning: 'Warning'
  }
};

/**
 * Color contrast checker (WCAG AA standard)
 */
export const checkColorContrast = (foreground, background) => {
  // Convert hex to RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  // Calculate relative luminance
  const getLuminance = (rgb) => {
    const { r, g, b } = rgb;
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const fg = hexToRgb(foreground);
  const bg = hexToRgb(background);

  if (!fg || !bg) return null;

  const l1 = getLuminance(fg);
  const l2 = getLuminance(bg);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  const contrast = (lighter + 0.05) / (darker + 0.05);

  return {
    ratio: contrast.toFixed(2),
    passAANormal: contrast >= 4.5,
    passAALarge: contrast >= 3,
    passAAANormal: contrast >= 7,
    passAAALarge: contrast >= 4.5
  };
};

/**
 * Focus visible utility class
 */
export const focusVisibleClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600';

/**
 * Screen reader only class
 */
export const srOnlyClass = 'sr-only';

export default {
  trapFocus,
  announceToScreenReader,
  isElementVisible,
  SkipToContent,
  handleKeyboardNavigation,
  generateId,
  ariaLabels,
  checkColorContrast,
  focusVisibleClass,
  srOnlyClass
};
