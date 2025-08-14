# smQL

**CRUD Abstraction for Semantq Full Stack Apps**

smQL is a lightweight, robust, and reusable JavaScript HTTP client class that simplifies **CRUD** (Create, Read, Update, Delete) operations using standard `fetch` API calls. It includes complementary Form and Notification utilities for complete frontend API interaction management.

## Installation

```bash
npm install @semantq/ql
```

Import into your project:

```js
// Import all components
import { smQL, Form, Notification } from '@semantq/ql';

// Or import selectively
import { smQL } from '@semantq/ql';
```

## Core Features

- **smQL**: HTTP client with built-in token management and logging
- **Form**: Form data capture and submission handler
- **Notification**: Elegant notification system with multiple types

# smQL HTTP Client

## Basic Usage

### Static One-Off Calls

```js
const response = await smQL.fetch(
  'https://api.example.com', 
  '/users',
  'GET',
  null,
  { 'X-Custom-Header': 'value' }
);
```

### Instance-Based Usage

```js
const api = new smQL('https://api.example.com', {
  'X-API-Version': '1.0'
}, { log: true });

// Set authentication token
api.setToken('your_jwt_token_here');

// Make requests
const users = await api.get('/users');
const newUser = await api.post('/users', { name: 'John' });
```

## Configuration Options

### Constructor Parameters

```js
const api = new smQL(baseURL, defaultHeaders, options);
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `baseURL` | string | Base API URL |
| `defaultHeaders` | object | Default headers (default: {'Content-Type': 'application/json'}) |
| `options` | object | Additional options: |

**Options:**
```js
{
  log: true, // Enable/disable request logging (default: true)
}
```

## CRUD Methods

All methods return a response object with:
- `_status`: HTTP status code
- `_ok`: Boolean indicating success
- Response data

### GET Request
```js
const response = await api.get('/users', {
  'Cache-Control': 'no-cache'
});
```

### POST Request
```js
const response = await api.post('/users', {
  name: 'Alice',
  email: 'alice@example.com'
});
```

### PUT Request
```js
const response = await api.put('/users/123', {
  name: 'Alice Smith'
});
```

### PATCH Request
```js
const response = await api.patch('/users/123', {
  email: 'new@example.com'
});
```

### DELETE Request
```js
const response = await api.delete('/users/123');
```

## Logging System

smQL provides detailed request logging when enabled:

```js
// Enable logging (default)
const api = new smQL('https://api.example.com', {}, { log: true });

// Disable logging
const silentApi = new smQL('https://api.example.com', {}, { log: false });
```

**Log Format:**
```
[smQL] Request to /users returned status 200 {
  _status: 200,
  _ok: true,
  data: [...]
}
```

## Error Handling

smQL throws errors for:
- Network failures
- Invalid responses
- Parsing errors

```js
try {
  const response = await api.get('/nonexistent');
} catch (error) {
  console.error('API Error:', error);
  Notification.show({
    type: 'error',
    message: 'Failed to load data'
  });
}
```

# Form Handler

The Form class simplifies form data capture and handling.

## Basic Usage

```js
const form = new Form('userForm', 'submit', {
  debug: true,
  onCaptured: (data) => {
    api.post('/users', data)
      .then(() => Notification.show({
        type: 'success',
        message: 'User created!'
      }));
  }
});
```

## Advanced Features

### Multi-Select Support
Automatically handles `<select multiple>` elements.

### Array Values
Converts repeated fields into arrays automatically.

### Event System
```js
document.getElementById('userForm').addEventListener('form:captured', (e) => {
  console.log('Form data:', e.detail);
});
```

## Methods

### getData()
Returns the captured form data:

```js
const form = new Form('userForm');
// ... after form submission
console.log(form.getData());
```

# Notification System

Display user notifications with multiple types and options.

## Basic Usage

```js
Notification.show({
  type: 'success',
  message: 'Operation completed successfully!',
  duration: 5000
});
```

## Notification Types

- `success`: Green notification with checkmark
- `error`: Red notification with warning icon
- `warning`: Orange notification with warning icon

## Configuration Options

```js
{
  type: 'success', // 'success', 'error', or 'warning'
  message: 'Message text',
  duration: 5000, // Auto-close duration (0 to disable)
  closeable: true // Show close button
}
```

## Advanced Usage

### Stacked Notifications
Multiple notifications automatically stack vertically.

### Custom Icons
Override default icons with HTML:

```js
Notification.show({
  type: 'success',
  message: 'Custom icon <i class="fa fa-check"></i>'
});
```

# Comprehensive Examples

## Complete CRUD Workflow

```js
// 1. Initialize API client
const api = new smQL('https://api.example.com');

// 2. Set up form handler
new Form('productForm', {
  onCaptured: async (data) => {
    try {
      // 3. Submit data
      const response = await api.post('/products', data);
      
      // 4. Show success notification
      Notification.show({
        type: 'success',
        message: 'Product created!'
      });
      
      // 5. Refresh product list
      const products = await api.get('/products');
      renderProductList(products);
      
    } catch (error) {
      Notification.show({
        type: 'error',
        message: 'Failed to create product'
      });
    }
  }
});
```

## File Upload Example

```js
const form = new Form('uploadForm');

form.form.addEventListener('form:captured', async (e) => {
  const formData = new FormData();
  for (const key in e.detail) {
    formData.append(key, e.detail[key]);
  }
  
  await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
});
```

## Why Use smQL?

- **Complete solution**: Combines HTTP client, form handling, and notifications
- **Lightweight**: Minimal overhead
- **Flexible**: Works with any backend API
- **Consistent**: Standardized response format
- **Debug-friendly**: Built-in logging system

## License

**MIT License** - Free for personal and commercial use.