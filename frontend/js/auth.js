// frontend/js/auth.js

// Check if user is logged in
function isLoggedIn() {
    return !!localStorage.getItem('token');
}

// Update UI based on authentication status
function checkAuthStatus() {
    const isAuthenticated = isLoggedIn();
    
    // Update login/logout buttons
    document.getElementById('login-btn')?.classList.toggle('hidden', isAuthenticated);
    document.getElementById('register-btn')?.classList.toggle('hidden', isAuthenticated);
    document.getElementById('logout-btn')?.classList.toggle('hidden', !isAuthenticated);
    document.getElementById('dashboard-btn')?.classList.toggle('hidden', !isAuthenticated);
}

// Login function
async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorElement = document.getElementById('login-error');
    
    try {
        const data = await API.login(username, password);
        
        if (data.access_token) {
            localStorage.setItem('token', data.access_token);
            window.location.href = 'dashboard.html';
        } else {
            errorElement.textContent = 'Login failed. Please check your credentials.';
        }
    } catch (error) {
        errorElement.textContent = error.message || 'Login failed. Please try again.';
    }
}

// Register function
async function register() {
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorElement = document.getElementById('register-error');
    
    try {
        const data = await API.register({ username, email, password });
        
        if (data.id) {
            // Registration successful, redirect to login
            window.location.href = 'login.html?registered=true';
        } else {
            errorElement.textContent = 'Registration failed. Please try again.';
        }
    } catch (error) {
        errorElement.textContent = error.message || 'Registration failed. Please try again.';
    }
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
}

// Load user info for dashboard
async function loadUserInfo() {
    try {
        const user = await API.getCurrentUser();
        document.getElementById('user-name').textContent = user.username;
    } catch (error) {
        console.error('Error loading user info:', error);
        // If there's an authentication error, redirect to login
        if (error.message.includes('401')) {
            logout();
        }
    }
}