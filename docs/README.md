# Frontend API Integration Documentation

This directory contains comprehensive documentation for integrating your Vue.js admin dashboard with real API endpoints.

## 📚 Documentation Files

### 1. [API_INTEGRATION.md](./API_INTEGRATION.md)
Complete guide covering:
- Environment configuration
- API service setup with interceptors
- Authentication integration
- CRUD operations for all modules
- Error handling
- Testing and debugging
- Deployment considerations

### 2. [QUICK_SETUP.md](./QUICK_SETUP.md)
Step-by-step quick setup guide:
- Essential configuration steps
- Required API endpoints
- Response formats
- Authentication flow
- Common troubleshooting

### 3. [EXAMPLE_UserList_Updated.vue](./EXAMPLE_UserList_Updated.vue)
Real-world example showing:
- How to replace mock data with API calls
- Proper error handling
- Loading states
- Pagination with API
- Bulk operations
- Debounced search

## 🚀 Quick Start

To integrate your frontend with real API endpoints:

1. **Update Environment**:
   ```bash
   # Edit your .env file
   VITE_API_BASE_URL=http://localhost:8000/api
   ```

2. **Install Additional Dependencies** (if needed):
   ```bash
   npm install lodash-es
   ```

3. **Create Service Files**:
   ```bash
   # Copy the service examples from API_INTEGRATION.md
   # Create files in src/services/
   ```

4. **Update Components**:
   - Replace mock data with service calls
   - Add proper error handling
   - Implement loading states

5. **Test Integration**:
   - Check browser console for API calls
   - Verify authentication flow
   - Test CRUD operations

## 🔑 Required Backend Endpoints

Your backend API should implement these endpoints:

### Authentication
- `POST /auth/login`
- `POST /auth/logout`  
- `GET /auth/profile`
- `POST /auth/refresh`

### Dashboard
- `GET /dashboard/stats`
- `GET /dashboard/activities`

### Users
- `GET /users` (with pagination)
- `POST /users`
- `GET /users/{id}`
- `PUT /users/{id}`
- `DELETE /users/{id}`

### Movies
- `GET /movies`
- `POST /movies`
- `GET /movies/{id}`
- `PUT /movies/{id}`
- `DELETE /movies/{id}`

### Bookings
- `GET /bookings`
- `GET /bookings/{id}`
- `PATCH /bookings/{id}/status`

## 📋 Expected Response Format

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "total": 100,          // For paginated responses
  "per_page": 10,
  "current_page": 1
}
```

## 🔧 Key Features Implemented

### Frontend Features
- ✅ JWT Authentication with refresh tokens
- ✅ Request/Response interceptors
- ✅ Error handling with user notifications
- ✅ Loading states
- ✅ Pagination
- ✅ Search and filtering
- ✅ Bulk operations
- ✅ File uploads (for movies)
- ✅ CORS handling

### Security Features
- ✅ Automatic token refresh
- ✅ Protected routes
- ✅ Role-based access control
- ✅ Secure token storage

## 🎯 Migration Steps

### From Mock Data to Real API

1. **Start with Authentication**:
   - Update login component
   - Test auth flow
   - Verify token storage

2. **Migrate Dashboard**:
   - Replace static stats
   - Connect real activity feed
   - Add chart data

3. **Update CRUD Operations**:
   - Users management
   - Movies management  
   - Bookings management

4. **Add Advanced Features**:
   - File uploads
   - Bulk operations
   - Export functionality

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**:
   - Configure backend CORS properly
   - Add allowed origins and headers

2. **401 Unauthorized**:
   - Check token format
   - Verify token expiration
   - Test authentication endpoint

3. **Network Errors**:
   - Verify API base URL
   - Check backend server status
   - Test endpoints with Postman

### Debug Mode

Enable detailed logging by setting:
```env
VITE_APP_ENV=development
```

This will log all API requests and responses to the browser console.

## 🔄 Next Steps

1. Configure your backend to match the expected endpoints
2. Update the `.env` file with your API URL
3. Copy the service files from the documentation
4. Update components one by one
5. Test thoroughly in development
6. Deploy to production

## 📞 Support

For implementation help:
1. Check the detailed examples in each documentation file
2. Review browser console for API errors
3. Test endpoints directly with API tools
4. Verify backend response formats match expectations

The documentation provides complete working examples for all major components and operations.