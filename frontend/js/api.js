// frontend/js/api.js
const API_URL = 'http://localhost:8000';

// Get authorization header
function getAuthHeader() {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}

// General API request function
async function apiRequest(endpoint, method = 'GET', data = null) {
    const headers = {
        'Content-Type': 'application/json',
        ...getAuthHeader()
    };

    const config = {
        method,
        headers,
        credentials: 'include'
    };

    if (data && method !== 'GET') {
        config.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, config);

        if (response.status === 204) {
            return { success: true };
        }

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.detail || 'API request failed');
        }

        return result;
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
}

// API endpoints
const API = {
    // Auth endpoints
    login: (username, password) => {
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);

        return fetch(`${API_URL}/users/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData
        }).then(response => response.json());
    },

    register: (userData) => apiRequest('/users/register', 'POST', userData),

    getCurrentUser: () => apiRequest('/users/me'),

    // Product endpoints
    getProducts: (params = {}) => {
        const queryParams = new URLSearchParams();
        for (const [key, value] of Object.entries(params)) {
            if (value !== null && value !== undefined && value !== '') {
                queryParams.append(key, value);
            }
        }
        return apiRequest(`/products?${queryParams.toString()}`);
    },

    getProductById: (id) => apiRequest(`/products/${id}`),

    createProduct: (productData) => apiRequest('/products', 'POST', productData),

    updateProduct: (id, productData) => apiRequest(`/products/${id}`, 'PUT', productData),

    deleteProduct: (id) => apiRequest(`/products/${id}`, 'DELETE'),

    // Other endpoints
    getTherapeuticAreas: () => apiRequest('/products/therapeutic-areas/'),

    getRegions: () => apiRequest('/products/regions/')
};