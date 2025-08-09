// frontend/navbar.js

function createNavbar() {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');
    const userName = localStorage.getItem('name');
    const navbarContainer = document.getElementById('navbar-container');

    if (!navbarContainer) {
        console.error('Navbar container not found!');
        return;
    }

    let navLinks = '';
    let dashboardUrl = '';

    if (token && userRole) {
        // --- USER IS LOGGED IN ---
        switch (userRole) {
            case 'admin':
                dashboardUrl = 'admin-dashborad.html';
                break;
            case 'club':
                dashboardUrl = 'club-dashborad.html';
                break;
            default:
                dashboardUrl = 'student-dashboard.html';
        }

        navLinks = `
            <span class="navbar-text me-3">
                Welcome, ${userName || 'User'}
            </span>
            <a href="/frontend/analytics.html" class="btn btn-primary me-2 ${userRole !== 'admin' ? 'd-none' : ''}">Analytics</a>
            <a href="/frontend/${dashboardUrl}" class="btn btn-light me-2">Dashboard</a>
            <a href="/frontend/profile.html" class="btn btn-info me-2">Profile</a>
            <button class="btn btn-outline-light" onclick="logout()">Logout</button>
        `;
    } else {
        // --- USER IS LOGGED OUT ---
        navLinks = `
            <a class="btn btn-outline-light me-2" href="/frontend/login.html">Login</a>
            <a class="btn btn-light" href="/frontend/signup.html">Sign Up</a>
        `;
    }

    const navbarHTML = `
        <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
            <div class="container-fluid">
                <a class="navbar-brand" href="/frontend/index.html">EventSphere</a>
                <div class="d-flex">
                    ${navLinks}
                </div>
            </div>
        </nav>
    `;

    navbarContainer.innerHTML = navbarHTML;
}

function logout() {
    localStorage.clear();
    window.location.href = "/frontend/login.html";
}

// Ensure the navbar is created after the page content is loaded
document.addEventListener('DOMContentLoaded', createNavbar);