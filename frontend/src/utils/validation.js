/**
 * Form Validation Utilities
 * Provides client-side validation functions
 */

export const ValidationUtils = {
  /**
   * Validate email format
   */
  validateEmail: (email) => {
    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return pattern.test(email);
  },

  /**
   * Validate US phone number
   */
  validatePhone: (phone) => {
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    const pattern = /^(\+?1)?[0-9]{10}$/;
    return pattern.test(cleaned);
  },

  /**
   * Validate password strength
   */
  validatePassword: (password) => {
    const errors = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Validate date format (YYYY-MM-DD)
   */
  validateDate: (dateStr) => {
    const pattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!pattern.test(dateStr)) {
      return false;
    }
    
    const date = new Date(dateStr);
    return date instanceof Date && !isNaN(date);
  },

  /**
   * Validate age from date of birth
   */
  validateAge: (dateOfBirth, minAge = 18) => {
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    
    return {
      isValid: age >= minAge,
      age
    };
  },

  /**
   * Validate required field
   */
  validateRequired: (value, fieldName) => {
    const isEmpty = !value || (typeof value === 'string' && value.trim() === '');
    return {
      isValid: !isEmpty,
      error: isEmpty ? `${fieldName} is required` : null
    };
  },

  /**
   * Sanitize input
   */
  sanitizeInput: (text) => {
    if (!text) return '';
    return text.trim().replace(/\s+/g, ' ');
  }
};

/**
 * Form field validation hook
 */
export const useFormValidation = (initialValues, validationRules) => {
  const [values, setValues] = React.useState(initialValues);
  const [errors, setErrors] = React.useState({});
  const [touched, setTouched] = React.useState({});

  const validateField = (name, value) => {
    if (!validationRules[name]) return null;

    const rules = validationRules[name];
    let error = null;

    for (const rule of rules) {
      const result = rule(value);
      if (result) {
        error = result;
        break;
      }
    }

    return error;
  };

  const handleChange = (name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, values[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const validateAll = () => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach(name => {
      const error = validateField(name, values[name]);
      if (error) {
        newErrors[name] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched(Object.keys(validationRules).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
    
    return isValid;
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    reset,
    setValues
  };
};

/**
 * Common validation rules
 */
export const commonRules = {
  required: (fieldName) => (value) => {
    const result = ValidationUtils.validateRequired(value, fieldName);
    return result.isValid ? null : result.error;
  },

  email: (value) => {
    if (!value) return null;
    return ValidationUtils.validateEmail(value) ? null : 'Invalid email format';
  },

  phone: (value) => {
    if (!value) return null;
    return ValidationUtils.validatePhone(value) ? null : 'Invalid phone number';
  },

  password: (value) => {
    if (!value) return null;
    const result = ValidationUtils.validatePassword(value);
    return result.isValid ? null : result.errors[0];
  },

  date: (value) => {
    if (!value) return null;
    return ValidationUtils.validateDate(value) ? null : 'Invalid date format (YYYY-MM-DD)';
  },

  minAge: (minAge) => (value) => {
    if (!value) return null;
    const result = ValidationUtils.validateAge(value, minAge);
    return result.isValid ? null : `Must be at least ${minAge} years old`;
  },

  minLength: (min) => (value) => {
    if (!value) return null;
    return value.length >= min ? null : `Must be at least ${min} characters`;
  },

  maxLength: (max) => (value) => {
    if (!value) return null;
    return value.length <= max ? null : `Must be no more than ${max} characters`;
  }
};

export default ValidationUtils;
