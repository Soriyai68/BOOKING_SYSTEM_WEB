# Cinema Admin Dashboard

A modern Vue 3 admin dashboard for cinema booking system management, built with Element Plus UI framework.

## 🚀 Features

- **Modern Tech Stack**: Vue 3 + Vite + Element Plus
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Authentication**: Login system with role-based access control
- **Dashboard**: Statistics cards, charts, and activity feed
- **User Management**: CRUD operations for user accounts
- **Movie Management**: Manage movie catalog and details
- **Booking Management**: View and manage customer bookings
- **State Management**: Pinia for centralized state management
- **API Integration**: Axios with interceptors for API calls
- **Auto Import**: Automatic component and API imports

## 🛠️ Installation & Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   - Update environment variables in `.env`:
     ```env
     VITE_APP_TITLE=Cinema Admin Dashboard
     VITE_API_BASE_URL=http://localhost:8000/api
     ```

3. **Development Server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`

4. **Build for Production**
   ```bash
   npm run build
   ```

## 🔐 Demo Login

- **Email**: `admin@cinema.com`
- **Password**: `password123`

## 📁 Project Structure

- **src/layouts/**: Page layouts (AdminLayout)
- **src/views/**: Page components organized by feature
- **src/components/**: Reusable components
- **src/stores/**: Pinia stores (auth, app state)
- **src/utils/**: Utilities (API configuration)
- **src/router/**: Vue Router setup with guards

## 🎯 Key Pages

- **Dashboard**: Statistics and overview
- **Users**: User management with CRUD operations
- **Movies**: Movie catalog management
- **Bookings**: Booking management and details
- **Settings**: Application configuration

## 🎨 UI Framework

Built with Element Plus providing:
- Responsive data tables
- Form validation
- Navigation components
- Cards and statistics displays
- Theme support
