// Navbar functionality for EventSphere
class EventSphereNavbar {
    constructor() {
        this.init();
    }

    init() {
        this.updateNavbarBasedOnAuth();
        this.setupEventListeners();
        this.setupMobileMenu();
        this.setupScrollEffect();
    }

    // Update navbar based on authentication status
    updateNavbarBasedOnAuth() {
        const token = localStorage.getItem('userToken');
        const role = localStorage.getItem('userRole');
        const userName = localStorage.getItem('userName');

        const loginLink = document.getElementById('loginLink');
        const signupLink = document.getElementById('signupLink');
        const userMenu = document.getElementById('userMenu');
        const userNameSpan = document.getElementById('userName');
        const dashboardLink = document.getElementById('dashboardLink');

        if (token && role) {
            // User is logged in
            if (loginLink) loginLink.style.display = 'none';
            if (signupLink) signupLink.style.display = 'none';
            if (userMenu) userMenu.style.display = 'block';
            
            if (userNameSpan) {
                userNameSpan.textContent = userName || 'User';
            }
            
            if (dashboardLink) {
                // Set dashboard link based on role
                switch(role) {
                    case 'student':
                        dashboardLink.href = 'student-dashboard.html';
                        break;
                    case 'club':
                        dashboardLink.href = 'club-dashboard.html';
                        break;
                    case 'admin':
                        dashboardLink.href = 'admin-dashboard.html';
                        break;
                    default:
                        dashboardLink.href = 'index.html';
                }
            }
        } else {
            // User is not logged in
            if (loginLink) loginLink.style.display = 'block';
            if (signupLink) signupLink.style.display = 'block';
            if (userMenu) userMenu.style.display = 'none';
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // Logout functionality
        const logoutLink = document.getElementById('logoutLink');
        if (logoutLink) {
            logoutLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        }

        // Profile link
        const profileLink = document.querySelector('a[href="profile.html"]');
        if (profileLink) {
            profileLink.addEventListener('click', (e) => {
                if (!localStorage.getItem('userToken')) {
                    e.preventDefault();
                    Utils.showToast('Please login to access your profile.', 'warning');
                    window.location.href = 'login.html';
                }
            });
        }

        // Dashboard link click tracking
        const dashboardLink = document.getElementById('dashboardLink');
        if (dashboardLink) {
            dashboardLink.addEventListener('click', (e) => {
                if (!localStorage.getItem('userToken')) {
                    e.preventDefault();
                    Utils.showToast('Please login to access your dashboard.', 'warning');
                    window.location.href = 'login.html';
                }
            });
        }

        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // Handle user logout
    async handleLogout() {
        const confirmLogout = confirm('Are you sure you want to logout?');
        if (!confirmLogout) return;

        try {
            // Call logout API if available
            const token = localStorage.getItem('userToken');
            if (token) {
                try {
                    await fetch(`${API_BASE_URL}/auth/logout`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                } catch (error) {
                    console.log('Logout API call failed, continuing with local logout');
                }
            }

            // Clear local storage
            localStorage.removeItem('userToken');
            localStorage.removeItem('userRole');
            localStorage.removeItem('userId');
            localStorage.removeItem('userName');

            // Show success message
            Utils.showToast('Logged out successfully!', 'success');

            // Redirect to home page
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);

        } catch (error) {
            console.error('Logout error:', error);
            Utils.showToast('Error during logout. Please try again.', 'danger');
        }
    }

    // Setup mobile menu functionality
    setupMobileMenu() {
        const navbarToggler = document.querySelector('.navbar-toggler');
        const navbarCollapse = document.querySelector('.navbar-collapse');

        if (navbarToggler && navbarCollapse) {
            // Close mobile menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!navbarToggler.contains(e.target) && !navbarCollapse.contains(e.target)) {
                    if (navbarCollapse.classList.contains('show')) {
                        navbarToggler.click();
                    }
                }
            });

            // Close mobile menu when clicking on nav links
            const navLinks = navbarCollapse.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    if (navbarCollapse.classList.contains('show')) {
                        navbarToggler.click();
                    }
                });
            });
        }
    }

    // Setup scroll effect for navbar
    setupScrollEffect() {
        let lastScrollTop = 0;
        const navbar = document.querySelector('.navbar');
        
        if (!navbar) return;

        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            // Add/remove background based on scroll position
            if (scrollTop > 50) {
                navbar.style.background = 'rgba(0, 0, 0, 0.95)';
                navbar.style.backdropFilter = 'blur(20px)';
            } else {
                navbar.style.background = 'rgba(0, 0, 0, 0.9)';
                navbar.style.backdropFilter = 'blur(20px)';
            }

            // Hide/show navbar on scroll (optional)
            if (Math.abs(lastScrollTop - scrollTop) <= 5) return;
            
            if (scrollTop > lastScrollTop && scrollTop > 100) {
                // Scrolling down
                navbar.style.transform = 'translateY(-100%)';
            } else {
                // Scrolling up
                navbar.style.transform = 'translateY(0)';
            }
            
            lastScrollTop = scrollTop;
        });
    }

    // Add notification badge to navbar (for future use)
    addNotificationBadge(count = 0) {
        const userMenu = document.getElementById('userMenu');
        if (!userMenu) return;

        const existingBadge = userMenu.querySelector('.notification-badge');
        if (existingBadge) {
            existingBadge.remove();
        }

        if (count > 0) {
            const badge = document.createElement('span');
            badge.className = 'notification-badge badge bg-danger rounded-pill position-absolute top-0 start-100 translate-middle';
            badge.style.fontSize = '0.7rem';
            badge.textContent = count > 99 ? '99+' : count;
            
            const userToggle = userMenu.querySelector('.nav-link');
            if (userToggle) {
                userToggle.style.position = 'relative';
                userToggle.appendChild(badge);
            }
        }
    }

    // Update user name in navbar
    updateUserName(newName) {
        const userNameSpan = document.getElementById('userName');
        if (userNameSpan && newName) {
            userNameSpan.textContent = newName;
            localStorage.setItem('userName', newName);
        }
    }

    // Highlight active page in navbar
    highlightActivePage() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage || (currentPage === '' && href === 'index.html')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // Check authentication status periodically
    startAuthCheck() {
        // Check auth status every 5 minutes
        setInterval(() => {
            this.verifyAuthToken();
        }, 5 * 60 * 1000);
    }

    // Verify authentication token
    async verifyAuthToken() {
        const token = localStorage.getItem('userToken');
        if (!token) return;

        try {
            const response = await fetch(`${API_BASE_URL}/auth/verify-token`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Token verification failed');
            }

            const data = await response.json();
            if (!data.success) {
                throw new Error('Invalid token');
            }
        } catch (error) {
            console.log('Token verification failed:', error.message);
            Utils.showToast('Session expired. Please login again.', 'warning');
            Utils.logout();
        }
    }
}

// Initialize navbar when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const navbar = new EventSphereNavbar();
    
    // Highlight active page
    navbar.highlightActivePage();
    
    // Start periodic auth check
    navbar.startAuthCheck();
    
    // Make navbar instance globally available
    window.EventSphereNavbar = navbar;
});

// Export for module usage (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EventSphereNavbar;
}
