// Login Form Handler
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            if (!response.ok) {
                const error = await response.json();
                showError(error.message || 'Login failed');
                return;
            }
            
            const data = await response.json();
            
            // Store user with token
            localStorage.setItem('user', JSON.stringify({
                ...data.user,
                token: data.token
            }));
            
            window.location.href = 'dashboard.html';
        } catch (error) {
            showError('Login error: ' + error.message);
        }
    });
}

// Signup Form Handler
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Clear previous errors
        clearAllErrors();
        
        const full_name = document.getElementById('signupName').value.trim();
        const username = document.getElementById('signupEmail').value.trim();
        const email = document.getElementById('signupEmail').value.trim();
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('signupConfirmPassword').value;
        const role = document.getElementById('signupRole').value;
        const agreeTerms = document.getElementById('agreeTerms').checked;
        
        let hasError = false;
        
        // Validation with field-specific errors
        if (!full_name) {
            showFieldError('signupName', 'Full name is required');
            hasError = true;
        }
        
        if (!email) {
            showFieldError('signupEmail', 'Email address is required');
            hasError = true;
        } else if (!isValidEmail(email)) {
            showFieldError('signupEmail', 'Please enter a valid email address');
            hasError = true;
        }
        
        if (!password) {
            showFieldError('signupPassword', 'Password is required');
            hasError = true;
        } else if (password.length < 8) {
            showFieldError('signupPassword', 'Password must be at least 8 characters');
            hasError = true;
        } else if (!hasValidPassword(password)) {
            showFieldError('signupPassword', 'Password must include uppercase, lowercase, number, and special character (@$!%*?&)');
            hasError = true;
        }
        
        if (!confirmPassword) {
            showFieldError('signupConfirmPassword', 'Please confirm your password');
            hasError = true;
        } else if (password !== confirmPassword) {
            showFieldError('signupConfirmPassword', 'Passwords do not match');
            hasError = true;
        }
        
        if (!role) {
            showFieldError('signupRole', 'Please select a role');
            hasError = true;
        }
        
        if (!agreeTerms) {
            showError('You must agree to the Terms & Conditions');
            hasError = true;
        }
        
        if (hasError) return;
        
        try {
            const response = await fetch('http://localhost:5000/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ full_name, username, email, password, confirm_password: confirmPassword, role })
            });
            
            if (!response.ok) {
                const error = await response.json();
                showError(error.message || 'Signup failed');
                return;
            }
            
            showError('Account created successfully! Please log in.');
            // Clear form and redirect to login
            signupForm.reset();
            clearAllErrors();
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } catch (error) {
            showError('Signup error: ' + error.message);
        }
    });
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function hasValidPassword(password) {
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[@$!%*?&]/.test(password);
    return hasUppercase && hasLowercase && hasNumber && hasSpecialChar;
}

function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (field) {
        const formGroup = field.closest('.form-group');
        if (formGroup) {
            formGroup.classList.add('has-error');
            const errorElement = formGroup.querySelector('.error-message');
            if (errorElement) {
                errorElement.textContent = message;
            }
        }
    }
}

function clearAllErrors() {
    const formGroups = document.querySelectorAll('.form-group.has-error');
    formGroups.forEach(group => {
        group.classList.remove('has-error');
        const errorElement = group.querySelector('.error-message');
        if (errorElement) {
            errorElement.textContent = '';
        }
    });
}

function showError(message) {
    const toast = document.createElement('div');
    toast.className = 'toast show error';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Check if already logged in
document.addEventListener('DOMContentLoaded', () => {
    const user = localStorage.getItem('user');
    if (user && window.location.pathname.includes('login') || window.location.pathname.includes('signup')) {
        // User already logged in, redirect to dashboard
        // Commented out to allow viewing login/signup pages
        // window.location.href = 'dashboard.html';
    }
});
