# Login API Integration Testing

This guide helps you test and verify the login functionality with your real API.

## 🚀 Quick Setup

1. **Update API URL** in `.env`:
   ```env
   VITE_API_BASE_URL=http://localhost:8000/api
   # or your actual API URL
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Check browser console** for API connection status

## 🔍 Testing Scenarios

### Scenario 1: API is Available
- Login component will show "API Connected" status
- Use your real user credentials
- Backend should respond to `POST /api/auth/login`

### Scenario 2: API is Not Available (Demo Mode)
- Login component will show "Demo Mode" status
- Use demo credentials: `+855123456789` / `password123`
- System will work with mock data

## 📋 Expected API Response Format

Your backend `/auth/login` endpoint should return:

```json
{
  "success": true,
  "access_token": "your-jwt-token-here",
  "refresh_token": "your-refresh-token-here",
  "user": {
    "id": 1,
    "name": "User Name",
    "email": "user@example.com",
    "role": "admin",
    "permissions": ["users.read", "users.write", ...]
  }
}
```

Alternative format (Laravel Sanctum style):
```json
{
  "token": "your-token-here",
  "user": {
    "id": 1,
    "name": "User Name",
    "email": "user@example.com",
    "role": "admin"
  }
}
```

## 🔧 Required Backend Endpoints

### 1. Health Check (Optional but Recommended)
```
GET /api/health
Response: { "status": "ok" }
```

### 2. Login Endpoint
```
POST /api/auth/login
Content-Type: application/json

Request Body:
{
  "email": "user@example.com",
  "password": "password123",
  "remember": false
}

Success Response (200):
{
  "access_token": "...",
  "user": { ... }
}

Error Response (401):
{
  "message": "Invalid credentials"
}
```

### 3. Logout Endpoint
```
POST /api/auth/logout
Authorization: Bearer {token}

Response: { "message": "Logged out successfully" }
```

### 4. User Profile Endpoint
```
GET /api/auth/profile
Authorization: Bearer {token}

Response: { "user": { ... } }
```

## 🐛 Testing & Debugging

### Check API Connection
1. Open browser developer tools
2. Go to Console tab
3. Look for API connection status messages

### Test with curl
```bash
# Test health endpoint
curl http://localhost:8000/api/health

# Test login endpoint
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'
```

### Common Issues & Solutions

#### 1. CORS Errors
**Error**: `Access to XMLHttpRequest at 'http://localhost:8000/api/auth/login' from origin 'http://localhost:3000' has been blocked by CORS`

**Solution**: Configure CORS in your backend:
```php
// Laravel example - config/cors.php
'paths' => ['api/*'],
'allowed_origins' => ['http://localhost:3000'],
'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
```

#### 2. Network Errors
**Error**: `Network error. Please check your connection.`

**Solutions**:
- Verify backend server is running
- Check API URL in `.env` file
- Test endpoint directly with Postman/curl

#### 3. 401 Unauthorized
**Error**: `Invalid email or password`

**Solutions**:
- Verify user credentials exist in database
- Check password hashing matches
- Confirm endpoint accepts JSON requests

#### 4. 422 Validation Error
**Error**: Validation error messages

**Solutions**:
- Check required fields in request
- Verify email format validation
- Confirm password requirements

## 🎯 Demo Mode Features

When API is not available, the system automatically falls back to demo mode:

- **Demo Credentials**: `admin@cinema.com` / `password123`
- **Mock User Data**: Includes admin role and permissions
- **Local Storage**: Tokens stored locally for session persistence
- **Full Navigation**: Access to all admin dashboard features
- **Mock API Responses**: Dashboard shows placeholder data

## ✅ Verification Checklist

- [ ] API URL configured in `.env`
- [ ] Backend server running
- [ ] CORS configured properly
- [ ] Login endpoint returns expected format
- [ ] User roles and permissions included
- [ ] Token storage working
- [ ] Logout functionality works
- [ ] Demo mode fallback working

## 🔄 Next Steps

Once login is working:

1. Test other authenticated endpoints
2. Implement user profile updates
3. Add password change functionality
4. Set up token refresh mechanism
5. Integrate dashboard API calls

## 📊 Monitoring

Watch these browser console logs:
- `🚀 Cinema Admin Dashboard` - App started
- `✅ API Connected` - Backend available
- `❌ API Connection failed` - Using demo mode
- `🚀 API: POST /auth/login` - Login attempts
- Response times and status codes

This setup allows you to develop with or without a backend API, making it perfect for frontend development and testing!