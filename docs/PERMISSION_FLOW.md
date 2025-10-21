# Permission System Architecture

This document outlines the architecture and workflow of the permission system used in this application.

## Overview

The permission system is designed to control user access to specific actions and views. It is a role-based access control (RBAC) system where users are assigned roles, and roles are granted a set of permissions.

The flow is as follows:
1.  User logs in.
2.  The frontend fetches the user's role and associated permissions from the backend.
3.  Permissions are stored in a global state management store (Pinia).
4.  The application uses this stored information to dynamically control access to UI elements (like buttons) and routes.

## Backend

The backend is the source of truth for all permissions. It defines roles and the permissions associated with them.

### Example Permission Structure

```json
{
  "Role.CASHIER": [
    // Dashboard
    "dashboard.view",
    "analytics.view",

    // User Management
    "users.view",
    "users.create",
    "users.edit",
    "users.manage",

    // ... other permissions
  ]
}
```

Permissions are typically strings in the format `resource.action`.

## Frontend

The frontend is responsible for fetching, storing, and enforcing the permissions.

### 1. Permission Store (`src/stores/permission.js`)

This Pinia store is the central hub for permissions on the frontend.

-   **State**: It stores the user's permissions list, role, and other relevant details.
-   **Actions**:
    -   `initializePermissions()`: Called after login to fetch and set up the permissions from the backend.
-   **Getters**: It provides helper functions to check for specific permissions (e.g., `hasPermission`, `canCreateUsers`).

### 2. `usePermissions` Composable (`src/composables/usePermissions.js`)

This composable provides a convenient way to access permission-related data and functions within your Vue components' `<script setup>` block. It essentially exposes the state and getters from the `permission` store.

**Usage:**

```javascript
import { usePermissions } from '@/composables/usePermissions';

const { hasPermission, canCreateUsers } = usePermissions();

if (canCreateUsers.value) {
  console.log("User can create users!");
}

if (hasPermission('movies.edit')) {
    console.log("User can edit movies!");
}
```

### 3. `v-permission` Directive (`src/directives/permission.js`)

The `v-permission` directive is the primary way to control UI elements directly in your templates. It's a simple and declarative way to show, hide, or disable elements based on the current user's permissions.

**Usage:**

-   **Show/Hide based on a single permission:**
    ```html
    <button v-permission="'users.create'">Create User</button>
    ```

-   **Disable instead of hiding:**
    ```html
    <button v-permission.disable="'users.delete'">Delete User</button>
    ```

-   **Require one of many permissions:**
    ```html
    <button v-permission="['users.edit', 'users.manage']">Edit or Manage</button>
    ```

-   **Require all permissions:**
    ```html
    <button v-permission.all="['users.edit', 'users.manage']">Edit and Manage</button>
    ```

### 4. Route Protection (`src/router/index.js`)

The routing system uses a navigation guard to check if a user has the necessary permissions to access a specific route. This is defined in the route's `meta` field.

**Route Definition:**

```javascript
import { createPermissionMeta } from '@/composables/usePermissions';

const routes = [
  {
    path: '/admin/users/create',
    name: 'CreateUser',
    component: () => import('@/views/users/CreateUser.vue'),
    meta: createPermissionMeta('users.create') // Requires 'users.create' permission
  },
  {
    path: '/admin/settings',
    name: 'Settings',
    component: () => import('@/views/settings/Settings.vue'),
    meta: createPermissionMeta(['settings.view', 'settings.edit']) // Requires either permission
  }
]
```

The `checkRoutePermissions` function (from `usePermissions.js`) is used within the router's `beforeEach` guard to perform the check.

## Full Workflow Example: Displaying a Button

1.  **Login**: User logs in. `authStore` is populated with user data and a token.
2.  **Initialization**: `permissionStore.initializePermissions()` is called. It makes an API request to the backend to get the permissions for the logged-in user's role.
3.  **Storage**: The returned permissions (e.g., `['users.view', 'users.create']`) are stored in the `permissionStore`.
4.  **Component Render**: A component like `UserList.vue` is rendered.
5.  **Directive Check**: A button in the template has `v-permission="'users.create'"`.
6.  **Evaluation**: The `permission` directive's logic runs. It calls `hasPermission('users.create')` from the `usePermissions` composable, which in turn checks the `permissionStore`.
7.  **DOM Update**: Since `'users.create'` exists in the store, the `hasPermission` check returns `true`, and the button is displayed. If the permission was missing, the button would be hidden (or disabled if using `v-permission.disable`).
