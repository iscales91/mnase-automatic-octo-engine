/**
 * API Client with error handling, loading states, and request interceptors
 */

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

class APIError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
  }
}

class APIClient {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Get authentication token from localStorage
   */
  getAuthToken() {
    return localStorage.getItem('token');
  }

  /**
   * Get headers with authentication
   */
  getHeaders(customHeaders = {}) {
    const headers = { ...this.defaultHeaders, ...customHeaders };
    const token = this.getAuthToken();
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  /**
   * Handle API response
   */
  async handleResponse(response) {
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    
    const data = isJson ? await response.json() : await response.text();
    
    if (!response.ok) {
      // Handle specific error codes
      if (response.status === 401) {
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Only redirect if not already on home page
        if (window.location.pathname !== '/') {
          window.location.href = '/?session=expired';
        }
      }
      
      const errorMessage = data?.detail || data?.message || `Request failed with status ${response.status}`;
      throw new APIError(errorMessage, response.status, data);
    }
    
    return data;
  }

  /**
   * GET request
   */
  async get(endpoint, options = {}) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'GET',
        headers: this.getHeaders(options.headers),
        ...options,
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError('Network error - please check your connection', 0, null);
    }
  }

  /**
   * POST request
   */
  async post(endpoint, data, options = {}) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(options.headers),
        body: JSON.stringify(data),
        ...options,
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError('Network error - please check your connection', 0, null);
    }
  }

  /**
   * PUT request
   */
  async put(endpoint, data, options = {}) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'PUT',
        headers: this.getHeaders(options.headers),
        body: JSON.stringify(data),
        ...options,
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError('Network error - please check your connection', 0, null);
    }
  }

  /**
   * DELETE request
   */
  async delete(endpoint, options = {}) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'DELETE',
        headers: this.getHeaders(options.headers),
        ...options,
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError('Network error - please check your connection', 0, null);
    }
  }
}

// Export singleton instance
const apiClient = new APIClient();

export { apiClient, APIError };
export default apiClient;
