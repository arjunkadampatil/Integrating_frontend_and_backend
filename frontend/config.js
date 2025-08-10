// EventSphere Configuration
const API_BASE_URL = 'http://localhost:8000/api';

// Check if running in production
if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    // Update this URL to your production backend URL
    API_BASE_URL = 'https://your-production-api.com/api';
}

// API endpoints
const API_ENDPOINTS = {
    AUTH: {
        LOGIN: `${API_BASE_URL}/auth/login`,
        REGISTER: `${API_BASE_URL}/auth/register`,
        LOGOUT: `${API_BASE_URL}/auth/logout`,
        FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot-password`,
        RESET_PASSWORD: `${API_BASE_URL}/auth/reset-password`,
        VERIFY_TOKEN: `${API_BASE_URL}/auth/verify-token`
    },
    EVENTS: {
        LIST: `${API_BASE_URL}/events`,
        CREATE: `${API_BASE_URL}/events`,
        UPDATE: (id) => `${API_BASE_URL}/events/${id}`,
        DELETE: (id) => `${API_BASE_URL}/events/${id}`,
        REGISTER: (id) => `${API_BASE_URL}/events/${id}/register`,
        APPROVE: (id) => `${API_BASE_URL}/events/${id}/approve`,
        REJECT: (id) => `${API_BASE_URL}/events/${id}/reject`
    },
    USER: {
        PROFILE: `${API_BASE_URL}/user/profile`,
        UPDATE_PROFILE: `${API_BASE_URL}/user/profile`,
        DASHBOARD: `${API_BASE_URL}/user/dashboard`,
        REGISTERED_EVENTS: `${API_BASE_URL}/user/registered-events`
    },
    ADMIN: {
        DASHBOARD: `${API_BASE_URL}/admin/dashboard`,
        USERS: `${API_BASE_URL}/admin/users`,
        ANALYTICS: `${API_BASE_URL}/admin/analytics`
    },
    CLUB: {
        DASHBOARD: `${API_BASE_URL}/club/dashboard`,
        EVENTS: `${API_BASE_URL}/club/events`,
        ANALYTICS: `${API_BASE_URL}/club/analytics`
    },
    QR: {
        GENERATE: (eventId) => `${API_BASE_URL}/qr/generate/${eventId}`,
        VERIFY: `${API_BASE_URL}/qr/verify`
    },
    CERTIFICATE: {
        GENERATE: (eventId) => `${API_BASE_URL}/certificate/generate/${eventId}`,
        DOWNLOAD: (certificateId) => `${API_BASE_URL}/certificate/download/${certificateId}`
    }
};

// Application configuration
const APP_CONFIG = {
    APP_NAME: 'EventSphere',
    VERSION: '2.0.0',
    AUTHOR: 'EventSphere Team',
    COPYRIGHT: '© 2025 EventSphere. All rights reserved.',
    
    // UI Configuration
    ANIMATION_DURATION: 800,
    TOAST_DURATION: 5000,
    LOADING_TIMEOUT: 10000,
    
    // File upload limits
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
    
    // Pagination
    EVENTS_PER_PAGE: 12,
    USERS_PER_PAGE: 10,
    
    // Date formats
    DATE_FORMAT: 'YYYY-MM-DD',
    TIME_FORMAT: 'HH:mm',
    DATETIME_FORMAT: 'YYYY-MM-DD HH:mm:ss'
};

// Utility functions
const Utils = {
    // Show toast notification
    showToast: function(message, type = 'info') {
        // Create toast element
        const toastHtml = `
            <div class="toast align-items-center text-white bg-${type} border-0" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="d-flex">
                    <div class="toast-body">
                        ${message}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
                </div>
            </div>
        `;
        
        // Create toast container if it doesn't exist
        let toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
            toastContainer.style.zIndex = '1060';
            document.body.appendChild(toastContainer);
        }
        
        // Add toast to container
        const toastWrapper = document.createElement('div');
        toastWrapper.innerHTML = toastHtml;
        const toastElement = toastWrapper.firstElementChild;
        toastContainer.appendChild(toastElement);
        
        // Show toast
        const toast = new bootstrap.Toast(toastElement, {
            autohide: true,
            delay: APP_CONFIG.TOAST_DURATION
        });
        toast.show();
        
        // Remove toast element after it's hidden
        toastElement.addEventListener('hidden.bs.toast', function() {
            toastElement.remove();
        });
    },
    
    // Format date
    formatDate: function(date, format = 'short') {
        const d = new Date(date);
        if (isNaN(d.getTime())) return 'Invalid Date';
        
        const options = {
            short: { year: 'numeric', month: 'short', day: 'numeric' },
            long: { year: 'numeric', month: 'long', day: 'numeric' },
            time: { hour: '2-digit', minute: '2-digit' },
            datetime: { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit', 
                minute: '2-digit' 
            }
        };
        
        return d.toLocaleDateString('en-US', options[format] || options.short);
    },
    
    // Format time
    formatTime: function(time) {
        if (!time) return 'TBA';
        return time;
    },
    
    // Get user token
    getToken: function() {
        return localStorage.getItem('userToken');
    },
    
    // Get user role
    getUserRole: function() {
        return localStorage.getItem('userRole');
    },
    
    // Get user ID
    getUserId: function() {
        return localStorage.getItem('userId');
    },
    
    // Get user name
    getUserName: function() {
        return localStorage.getItem('userName');
    },
    
    // Check if user is logged in
    isLoggedIn: function() {
        return !!this.getToken();
    },
    
    // Logout user
    logout: function() {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        window.location.href = 'index.html';
    },
    
    // Make authenticated API request
    apiRequest: async function(url, options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        if (this.isLoggedIn()) {
            defaultOptions.headers['Authorization'] = `Bearer ${this.getToken()}`;
        }
        
        const finalOptions = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        };
        
        try {
            const response = await fetch(url, finalOptions);
            
            // Handle unauthorized access
            if (response.status === 401) {
                this.showToast('Session expired. Please login again.', 'warning');
                this.logout();
                return null;
            }
            
            return await response.json();
        } catch (error) {
            console.error('API Request Error:', error);
            this.showToast('Network error. Please try again.', 'danger');
            throw error;
        }
    },
    
    // Validate email format
    isValidEmail: function(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    // Validate phone number
    isValidPhone: function(phone) {
        const phoneRegex = /^[6-9]\d{9}$/;
        return phoneRegex.test(phone.replace(/\D/g, ''));
    },
    
    // Sanitize HTML
    sanitizeHtml: function(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    },
    
    // Truncate text
    truncateText: function(text, maxLength = 100) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    },
    
    // Generate random ID
    generateId: function() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },
    
    // Debounce function
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Loading state management
    setLoading: function(element, isLoading, originalText = '') {
        if (isLoading) {
            element.dataset.originalText = element.innerHTML;
            element.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Loading...';
            element.disabled = true;
        } else {
            element.innerHTML = element.dataset.originalText || originalText;
            element.disabled = false;
        }
    }
};

// Export for module usage (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        API_BASE_URL,
        API_ENDPOINTS,
        APP_CONFIG,
        Utils
    };
}
