# Quick API Setup Guide

Follow these steps to connect your Vue.js admin dashboard with your real API endpoints.

## 🚀 Step-by-Step Setup

### 1. Update Environment Variables

Update your `.env` file with your actual API URL:

```env
# Replace with your actual API URL
VITE_API_BASE_URL=http://localhost:8000/api
VITE_API_VERSION=v1
VITE_AUTH_TOKEN_KEY=cinema_auth_token
VITE_APP_ENV=development
```

### 2. Create Service Files

Run these commands to create the service directories:

```bash
# Create services directory
mkdir src/services

# Create individual service files
New-Item -Path "src/services/userService.js" -ItemType File
New-Item -Path "src/services/movieService.js" -ItemType File
New-Item -Path "src/services/bookingService.js" -ItemType File
New-Item -Path "src/services/dashboardService.js" -ItemType File
```

### 3. Update Your API Base Configuration

Replace the content in `src/utils/api.js` with the enhanced version from the [API Integration Guide](./API_INTEGRATION.md#api-service-setup).

### 4. Test API Connection

Add this to your `src/main.js` for testing:

```javascript
// Add at the top
import api from './utils/api'

// Add before app.mount('#app')
if (import.meta.env.VITE_APP_ENV === 'development') {
  // Test API connection
  api.get('/health')
    .then(response => {
      console.log('✅ API Connected:', response.data)
    })
    .catch(error => {
      console.warn('❌ API Connection failed:', error.message)
      console.log('Using demo mode. Update VITE_API_BASE_URL in .env')
    })
}
```

## 🔑 Expected API Endpoints

Your backend should implement these endpoints:

### Authentication
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/profile` - Get user profile
- `POST /auth/refresh` - Refresh token

### Dashboard
- `GET /dashboard/stats` - Dashboard statistics
- `GET /dashboard/activities` - Recent activities
- `GET /dashboard/booking-trends` - Booking trends data

### Users
- `GET /users` - List users (with pagination)
- `POST /users` - Create user
- `GET /users/{id}` - Get user details
- `PUT /users/{id}` - Update user
- `DELETE /users/{id}` - Delete user

### Movies
- `GET /movies` - List movies
- `POST /movies` - Create movie (with file upload)
- `GET /movies/{id}` - Get movie details
- `PUT /movies/{id}` - Update movie
- `DELETE /movies/{id}` - Delete movie

### Bookings
- `GET /bookings` - List bookings
- `GET /bookings/{id}` - Get booking details
- `PATCH /bookings/{id}/status` - Update booking status

## 📋 API Response Format

Your API should return consistent JSON responses:

### Success Response
```json
{
  "success": true,
  "data": {...},
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": {
    "field": ["Validation error message"]
  }
}
```

### Paginated Response
```json
{
  "data": [...],
  "total": 100,
  "per_page": 10,
  "current_page": 1,
  "last_page": 10
}
```

## 🔐 Authentication Flow

1. User enters credentials in login form
2. Frontend sends POST to `/auth/login`
3. Backend returns access_token and refresh_token
4. Frontend stores tokens and user data
5. All subsequent requests include `Authorization: Bearer {token}`

## ⚡ Quick Test Commands

Test individual endpoints in browser console:

```javascript
// Test login (replace with real credentials)
fetch('http://localhost:8000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@example.com',
    password: 'password'
  })
})

// Test dashboard stats
fetch('http://localhost:8000/api/dashboard/stats', {
  headers: { 'Authorization': 'Bearer YOUR_TOKEN_HERE' }
})
```

## 🔧 Common Issues & Solutions

### CORS Errors
Add to your backend CORS configuration:
```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

### 401 Unauthorized
- Check if token is being sent correctly
- Verify token hasn't expired
- Ensure backend authentication is working

### Network Errors
- Verify API_BASE_URL is correct
- Check if backend server is running
- Test endpoints directly with Postman

## 🎯 Next Steps

1. Update `.env` with your API URL
2. Implement the API endpoints in your backend
3. Test each service individually
4. Replace mock data with real API calls
5. Handle loading states and errors

For detailed implementation examples, see [API_INTEGRATION.md](./API_INTEGRATION.md).