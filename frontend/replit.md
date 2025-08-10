# EventSphere - College Event Management Platform

## Overview

EventSphere is a comprehensive college event management platform designed to streamline event creation, registration, and management across educational institutions. The system supports multiple user roles including students, clubs, and administrators, providing role-based access to different features like event discovery, registration, QR code attendance tracking, and analytics.

The platform features a modern, responsive frontend built with static HTML/CSS/JavaScript that integrates with a Node.js backend API. Key features include event browsing and filtering, user authentication, dashboard management, QR code-based attendance systems, and comprehensive analytics for different stakeholders.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend follows a static multi-page application (MPA) architecture with the following design decisions:

- **Technology Stack**: Pure HTML5, CSS3, and vanilla JavaScript with no frontend frameworks
- **Styling Framework**: Hybrid approach using both Bootstrap 5 and Tailwind CSS via CDN for maximum flexibility
- **Animation Library**: AOS (Animate On Scroll) for smooth scroll-based animations
- **Icon System**: Font Awesome for consistent iconography
- **Typography**: Google Fonts (Inter) for modern, professional appearance

**Design System**: Implements a glass morphism design pattern with:
- CSS custom properties for consistent theming
- Gradient-based color schemes (primary, secondary, accent, dark)
- Backdrop blur effects for modern glass appearances
- Responsive design patterns using Bootstrap's grid system

### Backend Integration
The frontend communicates with a RESTful API through a centralized configuration system:

- **API Configuration**: Centralized in `config.js` with environment-aware endpoint management
- **Authentication**: Token-based authentication with localStorage persistence
- **Role-Based Routing**: Dynamic navigation and dashboard routing based on user roles (student, club, admin)
- **State Management**: Browser localStorage for user session and preferences

### User Role System
The application implements a three-tier user role architecture:

1. **Students**: Access to event browsing, registration, profile management, and personal dashboard
2. **Clubs**: Event creation and management capabilities, club-specific analytics, and member management
3. **Administrators**: System-wide oversight, user management, platform analytics, and event approval workflows

### Page Structure and Navigation
- **Public Pages**: Landing page, event listing, authentication pages (login, signup, password reset)
- **Protected Dashboards**: Role-specific dashboards with different feature sets
- **Utility Pages**: Profile management, QR attendance scanning, analytics viewing
- **Navigation System**: Dynamic navbar that adapts based on authentication status and user role

### Authentication Flow
- **Login/Registration**: Form-based authentication with backend API integration
- **Password Management**: Forgot/reset password functionality with email workflows
- **Session Management**: Persistent login state using localStorage tokens
- **Authorization**: Client-side route protection based on stored user roles

### Event Management System
- **Event Discovery**: Filterable and searchable event listings
- **Registration System**: One-click event registration with real-time updates
- **QR Code Integration**: Attendance tracking using QR code scanning
- **Categories**: Support for Intercollege and Intracollege event types

## External Dependencies

### CDN-Based Libraries
- **Bootstrap 5**: CSS framework for responsive design and component styling
- **Tailwind CSS**: Utility-first CSS framework for custom styling flexibility
- **Font Awesome**: Icon library for consistent UI iconography
- **AOS (Animate On Scroll)**: Animation library for scroll-triggered effects
- **Google Fonts**: Web fonts service for Inter typography

### Backend API Dependencies
- **Node.js + Express**: RESTful API server (external to this frontend)
- **MongoDB**: Database system for data persistence (accessed via backend API)
- **Authentication Service**: JWT-based authentication system
- **Email Service**: For password reset and notification functionality

### Browser APIs
- **localStorage**: For client-side session and preference storage
- **Fetch API**: For HTTP requests to backend services
- **Camera API**: For QR code scanning functionality (in qr-attendance.html)

### Asset Dependencies
- **Logo Assets**: Brand logo stored in `/assets/logo.svg`
- **Event Images**: Dynamic event imagery loaded via API responses
- **Background Elements**: CSS-generated floating shapes and gradient backgrounds

### Development Tools
- **Live Server**: For local development and testing
- **Modern Browsers**: Requires support for ES6+, CSS Grid, Flexbox, and backdrop-filter