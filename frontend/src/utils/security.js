/**
 * Security & Input Validation Utilities
 */

/**
 * Sanitize HTML to prevent XSS attacks
 */
export const sanitizeHTML = (html) => {
  const temp = document.createElement('div');
  temp.textContent = html;
  return temp.innerHTML;
};

/**
 * Escape HTML special characters
 */
export const escapeHTML = (str) => {
  const htmlEscapes = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };
  
  return str.replace(/[&<>"'/]/g, char => htmlEscapes[char]);
};

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (US format)
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Validate URL
 */
export const isValidURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Check password strength
 */
export const checkPasswordStrength = (password) => {
  const strength = {
    score: 0,
    feedback: [],
    level: 'weak'
  };

  // Length check
  if (password.length >= 8) strength.score += 1;
  if (password.length >= 12) strength.score += 1;
  
  // Character variety
  if (/[a-z]/.test(password)) strength.score += 1;
  if (/[A-Z]/.test(password)) strength.score += 1;
  if (/[0-9]/.test(password)) strength.score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) strength.score += 1;

  // Feedback
  if (password.length < 8) {
    strength.feedback.push('Password should be at least 8 characters');
  }
  if (!/[a-z]/.test(password)) {
    strength.feedback.push('Add lowercase letters');
  }
  if (!/[A-Z]/.test(password)) {
    strength.feedback.push('Add uppercase letters');
  }
  if (!/[0-9]/.test(password)) {
    strength.feedback.push('Add numbers');
  }
  if (!/[^a-zA-Z0-9]/.test(password)) {
    strength.feedback.push('Add special characters');
  }

  // Determine level
  if (strength.score <= 2) {
    strength.level = 'weak';
  } else if (strength.score <= 4) {
    strength.level = 'medium';
  } else {
    strength.level = 'strong';
  }

  return strength;
};

/**
 * Sanitize input for SQL-like queries (MongoDB)
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  // Remove potentially dangerous characters
  return input
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, 1000); // Limit length
};

/**
 * Validate date format and range
 */
export const isValidDate = (dateString, minDate = null, maxDate = null) => {
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return { valid: false, message: 'Invalid date format' };
  }

  if (minDate && date < new Date(minDate)) {
    return { valid: false, message: 'Date is too early' };
  }

  if (maxDate && date > new Date(maxDate)) {
    return { valid: false, message: 'Date is too late' };
  }

  return { valid: true, message: '' };
};

/**
 * Validate credit card number (Luhn algorithm)
 */
export const isValidCreditCard = (cardNumber) => {
  const cleaned = cardNumber.replace(/\s/g, '');
  
  if (!/^\d+$/.test(cleaned)) return false;
  if (cleaned.length < 13 || cleaned.length > 19) return false;

  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

/**
 * Rate limiting helper
 */
class RateLimiter {
  constructor(maxRequests = 10, timeWindow = 60000) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
    this.requests = new Map();
  }

  canMakeRequest(identifier) {
    const now = Date.now();
    const userRequests = this.requests.get(identifier) || [];
    
    // Remove old requests outside time window
    const recentRequests = userRequests.filter(
      timestamp => now - timestamp < this.timeWindow
    );
    
    if (recentRequests.length >= this.maxRequests) {
      return {
        allowed: false,
        retryAfter: Math.ceil((recentRequests[0] + this.timeWindow - now) / 1000)
      };
    }
    
    // Add new request
    recentRequests.push(now);
    this.requests.set(identifier, recentRequests);
    
    return { allowed: true, retryAfter: 0 };
  }

  reset(identifier) {
    this.requests.delete(identifier);
  }
}

export const rateLimiter = new RateLimiter();

/**
 * CSRF token management
 */
export const csrfToken = {
  get: () => {
    return localStorage.getItem('csrf_token') || '';
  },
  
  set: (token) => {
    localStorage.setItem('csrf_token', token);
  },
  
  clear: () => {
    localStorage.removeItem('csrf_token');
  },
  
  validate: (token) => {
    return token === csrfToken.get();
  }
};

/**
 * Content Security Policy helper
 */
export const generateCSPHeader = () => {
  return {
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://cdn.ngrok.com https://unpkg.com https://d2adkz2s9zrlge.cloudfront.net",
      "style-src 'self' 'unsafe-inline' https://cdn.ngrok.com",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data: https://cdn.ngrok.com",
      "connect-src 'self' https://courtside-22.preview.emergentagent.com https://api.stripe.com",
      "frame-src 'self' https://js.stripe.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ')
  };
};

/**
 * Secure local storage wrapper
 */
export const secureStorage = {
  set: (key, value, encrypt = false) => {
    try {
      let data = typeof value === 'object' ? JSON.stringify(value) : value;
      
      if (encrypt) {
        // Simple encoding (in production, use proper encryption)
        data = btoa(data);
      }
      
      localStorage.setItem(key, data);
      return true;
    } catch (error) {
      console.error('Error storing data:', error);
      return false;
    }
  },
  
  get: (key, decrypt = false) => {
    try {
      let data = localStorage.getItem(key);
      
      if (!data) return null;
      
      if (decrypt) {
        data = atob(data);
      }
      
      try {
        return JSON.parse(data);
      } catch {
        return data;
      }
    } catch (error) {
      console.error('Error retrieving data:', error);
      return null;
    }
  },
  
  remove: (key) => {
    localStorage.removeItem(key);
  },
  
  clear: () => {
    localStorage.clear();
  }
};

/**
 * File upload validation
 */
export const validateFileUpload = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf']
  } = options;

  const errors = [];

  // Check file size
  if (file.size > maxSize) {
    errors.push(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type must be one of: ${allowedTypes.join(', ')}`);
  }

  // Check file extension
  const extension = '.' + file.name.split('.').pop().toLowerCase();
  if (!allowedExtensions.includes(extension)) {
    errors.push(`File extension must be one of: ${allowedExtensions.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

export default {
  sanitizeHTML,
  escapeHTML,
  isValidEmail,
  isValidPhone,
  isValidURL,
  checkPasswordStrength,
  sanitizeInput,
  isValidDate,
  isValidCreditCard,
  rateLimiter,
  csrfToken,
  generateCSPHeader,
  secureStorage,
  validateFileUpload
};
