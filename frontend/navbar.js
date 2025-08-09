// This function will be called by each page to build the correct navbar.
function createNavbar() {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');
    const userName = localStorage.getItem('name');
    const navbarContainer = document.getElementById('navbar-container');

    if (!navbarContainer) {
        console.error('CRITICAL ERROR: Navbar container not found!');
        return;
    }

    let navLinks = '';
    let dashboardUrl = 'student-dashboard.html'; // Default

    if (token && userRole) {
        // --- USER IS LOGGED IN ---
        if (userRole === 'admin') dashboardUrl = 'admin-dashborad.html';
        if (userRole === 'club') dashboardUrl = 'club-dashborad.html';

        navLinks = `
            <span class="navbar-text me-3">
                Welcome, <span id="club-name">${userName || 'User'}</span>
            </span>
            <a href="analytics.html" class="btn btn-primary me-2 ${userRole !== 'admin' ? 'd-none' : ''}">Analytics</a>
            <a href="${dashboardUrl}" class="btn btn-light me-2">Dashboard</a>
            <a href="profile.html" class="btn btn-info me-2">Profile</a>
            <button class="btn btn-outline-light" onclick="logout()">Logout</button>
        `;
    } else {
        // --- USER IS LOGGED OUT ---
        navLinks = `
            <a class="btn btn-outline-light me-2" href="login.html">Login</a>
            <a class="btn btn-light" href="signup.html">Sign Up</a>
        `;
    }

    const navbarHTML = `
        <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
            <div class="container-fluid">
                <a class="navbar-brand" href="index.html">EventSphere</a>
                <div class="d-flex">
                    ${navLinks}
                </div>
            </div>
        </nav>
    `;

    navbarContainer.innerHTML = navbarHTML;
}

// Global logout function accessible by all pages
function logout() {
    localStorage.clear();
    window.location.href = "login.html";
}

// Run the function as soon as the HTML page is ready
document.addEventListener('DOMContentLoaded', createNavbar);