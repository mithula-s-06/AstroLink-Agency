// Configuration
const API_URL = 'http://localhost:5000/api';
let authToken = null;
let currentUser = null;

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
});

function initializeApp() {
    // Check if user is logged in
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
        authToken = storedToken;
        currentUser = JSON.parse(storedUser);
        showDashboard();
    }
}

function setupEventListeners() {
    // Home Page Buttons
    const getStartedBtn = document.getElementById('getStartedBtn');
    const learnMoreBtn = document.getElementById('learnMoreBtn');
    const authBtn = document.getElementById('authBtn');

    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', () => showAuthPage('login'));
    }

    if (learnMoreBtn) {
        learnMoreBtn.addEventListener('click', () => {
            document.getElementById('about').scrollIntoView({ behavior: 'smooth' });
        });
    }

    if (authBtn) {
        authBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (authToken) {
                logout();
            } else {
                showAuthPage('login');
            }
        });
    }

    // Login Form
    const loginForm = document.getElementById('loginFormElement');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Sign Up Form
    const signupForm = document.getElementById('signupFormElement');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }

    // Add Mission Form
    const addMissionForm = document.getElementById('addMissionForm');
    if (addMissionForm) {
        addMissionForm.addEventListener('submit', handleAddMission);
    }

    // Hamburger Menu
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
}

// Show Toast Notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Validate Email
function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Validate Password
function validatePassword(password) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
}

// Show Auth Page
function showAuthPage(form = 'login') {
    hidePage('homePage');
    hidePage('dashboardPage');
    showPage('authPage');

    if (form === 'login') {
        hidePage('signupForm');
        showPage('loginForm');
    } else {
        hidePage('loginForm');
        showPage('signupForm');
    }
}

// Switch to Login
function switchToLogin() {
    showPage('loginForm');
    hidePage('signupForm');
}

// Switch to Signup
function switchToSignup() {
    showPage('signupForm');
    hidePage('loginForm');
}

// Go Home
function goHome() {
    showPage('homePage');
    hidePage('authPage');
    hidePage('dashboardPage');
}

// Show Dashboard
function showDashboard() {
    showPage('dashboardPage');
    hidePage('homePage');
    hidePage('authPage');

    // Setup dashboard
    setupDashboard();
}

// Show Page
function showPage(pageId) {
    const page = document.getElementById(pageId);
    if (page) {
        page.classList.remove('hidden');
    }
}

// Hide Page
function hidePage(pageId) {
    const page = document.getElementById(pageId);
    if (page) {
        page.classList.add('hidden');
    }
}

// Logout
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    authToken = null;
    currentUser = null;
    goHome();
    showToast('Logged out successfully');
}

// Make API Request
async function makeRequest(endpoint, method = 'GET', data = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    if (authToken) {
        options.headers['Authorization'] = `Bearer ${authToken}`;
    }

    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, options);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Request failed');
        }

        return result;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Format Date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Format DateTime
function formatDateTime(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Get Status Badge Class
function getStatusBadgeClass(status) {
    const statusMap = {
        'Active': 'badge-success',
        'Completed': 'badge-success',
        'Planning': 'badge-primary',
        'In Orbit': 'badge-success',
        'On Hold': 'badge-warning',
        'Failed': 'badge-danger',
        'Decommissioned': 'badge-danger',
        'Lost': 'badge-danger',
        'Critical': 'badge-danger',
        'High': 'badge-warning',
        'Medium': 'badge-primary',
        'Low': 'badge-success'
    };

    return statusMap[status] || 'badge-primary';
}
