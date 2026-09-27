// auth.js - Authentication Guard + Logout

(function () {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const currentPage = window.location.pathname.split('/').pop().toLowerCase();

    const publicPages = ['login.html', ''];

    // Not logged in → redirect to login
    if (!isLoggedIn && !publicPages.includes(currentPage)) {
        window.location.replace('login.html');
        return;
    }

    // Already logged in but on login page → redirect to home
    if (isLoggedIn && currentPage === 'login.html') {
        window.location.replace('index.html');
        return;
    }

    // If logged in, inject the Logout button into the header
    if (isLoggedIn) {
        document.addEventListener('DOMContentLoaded', function () {
            injectLogoutButton();
        });
    }
})();

// ---------------------------------------------
// Inject the Logout button into the header
// ---------------------------------------------
function injectLogoutButton() {
    const headerContainer = document.querySelector('.header-container');
    if (!headerContainer) return;

    // Don't add twice
    if (document.getElementById('logoutBtn')) return;

    const username = localStorage.getItem('fullName')
        || localStorage.getItem('username')
        || 'User';

    const wrapper = document.createElement('div');
    wrapper.className = 'auth-buttons';
    wrapper.innerHTML = `
        <span class="user-greeting">👋 ${username}</span>
        <button id="logoutBtn" class="btn-logout" onclick="logout()">Logout</button>
    `;

    headerContainer.appendChild(wrapper);
}

// ---------------------------------------------
// Logout → clear session → redirect to login
// ---------------------------------------------
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('username');
        localStorage.removeItem('fullName');
        localStorage.removeItem('rememberMe');
        window.location.replace('login.html');
    }
}