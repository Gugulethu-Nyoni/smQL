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

Display user notifications with multiple types, customizable colors, and flexible options.

## Basic Usage

```js
Notification.show({
  type: 'success',
  message: 'Operation completed successfully!',
  duration: 5000
});
```

## Notification Types

- `success`: Green notification with checkmark (✓)
- `error`: Red notification with warning icon (⚠)
- `warning`: Orange notification with warning icon (⚠)

## Configuration Options

```js
{
  type: 'success',           // 'success', 'error', or 'warning'
  message: 'Message text',   // Notification content (supports HTML)
  duration: 5000,            // Auto-close in milliseconds (0 = persistent)
  closeable: true,           // Show close button
  successColor: '#4CAF50',   // Optional: Custom success color
  errorColor: '#F44336',     // Optional: Custom error color  
  warningColor: '#FF9800',   // Optional: Custom warning color
  themeColor: '#2196F3'      // Optional: Global theme color for all types
}
```

## Color Customization

### Type-Specific Colors
Override colors for specific notification types:

```js
// Custom success color (teal)
Notification.show({
  type: 'success',
  message: 'QR Codes emailed successfully!',
  duration: 3000,
  successColor: '#009688' // Overrides default green
});

// Custom error color (purple)
Notification.show({
  type: 'error',
  message: 'Something went wrong!',
  duration: 3000,
  errorColor: '#9C27B0' // Overrides default red
});

// Custom warning color (amber)
Notification.show({
  type: 'warning',
  message: 'Please check your input',
  duration: 3000,
  warningColor: '#FFC107' // Overrides default orange
});
```

### Global Theme Color
Apply a consistent color across all notification types:

```js
// All notifications will use blue theme
Notification.show({
  type: 'success',
  message: 'Operation completed!',
  duration: 3000,
  themeColor: '#2196F3' // Applies to success, error, and warning
});
```

### Color Priority System
The notification system follows this priority order:
1. **Type-specific color** (`successColor`, `errorColor`, `warningColor`)
2. **Global theme color** (`themeColor`) 
3. **Default color** (if no custom colors provided)

```js
// Example: Only warningColor will be used (highest priority)
Notification.show({
  type: 'warning',
  message: 'Please check your API call or server',
  duration: 3000,
  warningColor: '#FFC107',    // USED (type-specific)
  successColor: '#009688',    // Ignored (wrong type)
  errorColor: '#E91E63'       // Ignored (wrong type)
});
```

## Advanced Features

### Stacked Notifications
Multiple notifications automatically stack vertically with smooth animations.

### Custom Icons and HTML
Include custom icons or HTML in messages:

```js
Notification.show({
  type: 'success',
  message: 'Custom icon <i class="fa fa-check-circle"></i> Success!'
});
```

### Persistent Notifications
Set `duration: 0` for notifications that require manual dismissal:

```js
Notification.show({
  type: 'error',
  message: 'Critical system error!',
  duration: 0, // Requires user to click close
  closeable: true
});
```

### Auto-Close Control
```js
// Auto-close after 3 seconds
Notification.show({
  type: 'success', 
  message: 'Temporary message',
  duration: 3000
});

// Manual close only
Notification.show({
  type: 'warning',
  message: 'Important notice',
  duration: 0,
  closeable: true
});
```

## Default Values
```js
const defaults = {
  type: 'success',
  message: 'Operation completed successfully',
  duration: 5000,
  closeable: true,
  successColor: null,    // Default: #4CAF50
  errorColor: null,      // Default: #F44336  
  warningColor: null,    // Default: #FF9800
  themeColor: null       // No global theme by default
}
```

The notification system is fully backward-compatible - existing code will continue to work without any changes.

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
      
      // 4. Show success notification with custom color
      Notification.show({
        type: 'success',
        message: 'Product created successfully!',
        duration: 3000,
        successColor: '#009688' // Teal success color
      });
      
      // 5. Refresh product list
      const products = await api.get('/products');
      renderProductList(products);
      
    } catch (error) {
      // Show error notification with custom color
      Notification.show({
        type: 'error',
        message: 'Failed to create product: ' + error.message,
        duration: 5000,
        errorColor: '#E91E63' // Pink error color
      });
    }
  }
});

// Advanced CRUD examples with different notification styles

// CREATE with persistent notification
async function createProduct(productData) {
  try {
    await api.post('/products', productData);
    
    Notification.show({
      type: 'success',
      message: 'Product added to database',
      duration: 0, // Persistent - requires manual close
      closeable: true,
      successColor: '#4CAF50'
    });
    
  } catch (error) {
    Notification.show({
      type: 'error',
      message: `Create failed: ${error.message}`,
      duration: 0, // Persistent error
      closeable: true,
      errorColor: '#F44336'
    });
  }
}

// UPDATE with theme color consistency
async function updateProduct(id, updates) {
  try {
    await api.put(`/products/${id}`, updates);
    
    Notification.show({
      type: 'success',
      message: 'Product updated successfully',
      duration: 2000,
      themeColor: '#2196F3' // Blue theme for all operations
    });
    
  } catch (error) {
    Notification.show({
      type: 'error', 
      message: 'Update failed - please try again',
      duration: 3000,
      themeColor: '#2196F3' // Consistent blue theme
    });
  }
}

// DELETE with warning confirmation flow
async function deleteProduct(id, productName) {
  // First show warning confirmation
  Notification.show({
    type: 'warning',
    message: `Delete "${productName}"? <button onclick="confirmDelete(${id})">Confirm</button>`,
    duration: 0, // Stays until user acts
    closeable: true,
    warningColor: '#FF9800'
  });
}

async function confirmDelete(productId) {
  try {
    await api.delete(`/products/${productId}`);
    
    Notification.show({
      type: 'success',
      message: 'Product deleted permanently',
      duration: 2000,
      successColor: '#009688'
    });
    
    // Refresh list
    const products = await api.get('/products');
    renderProductList(products);
    
  } catch (error) {
    Notification.show({
      type: 'error',
      message: 'Deletion failed - product may be in use',
      duration: 4000,
      errorColor: '#E91E63'
    });
  }
}

// BATCH OPERATIONS with progress notifications
async function bulkUpdateProducts(updates) {
  let successCount = 0;
  let errorCount = 0;
  
  for (const update of updates) {
    try {
      await api.put(`/products/${update.id}`, update.data);
      successCount++;
    } catch (error) {
      errorCount++;
    }
  }
  
  // Show summary notification
  Notification.show({
    type: successCount > errorCount ? 'success' : 'warning',
    message: `Batch update: ${successCount} succeeded, ${errorCount} failed`,
    duration: 5000,
    successColor: '#4CAF50',
    warningColor: '#FF9800'
  });
}

// REAL-WORLD EXAMPLE: Product inventory management
class ProductManager {
  constructor() {
    this.api = new smQL('https://api.example.com');
  }
  
  async addProduct(productData) {
    try {
      const response = await this.api.post('/products', productData);
      
      Notification.show({
        type: 'success',
        message: `"${productData.name}" added to inventory`,
        duration: 3000,
        successColor: '#4CAF50'
      });
      
      return response;
    } catch (error) {
      Notification.show({
        type: 'error',
        message: `Inventory error: ${error.message}`,
        duration: 0, // Critical errors stay until dismissed
        closeable: true,
        errorColor: '#F44336'
      });
      throw error;
    }
  }
  
  async updateStock(productId, newStock) {
    try {
      await this.api.patch(`/products/${productId}`, { stock: newStock });
      
      Notification.show({
        type: 'success',
        message: `Stock updated to ${newStock} units`,
        duration: 2000,
        themeColor: '#2196F3' // Consistent blue for stock operations
      });
      
    } catch (error) {
      Notification.show({
        type: 'error',
        message: 'Stock update failed',
        duration: 3000,
        themeColor: '#2196F3'
      });
    }
  }
}

// Initialize product manager
const productManager = new ProductManager();
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