# smQL

**CRUD Abstraction for Semantq Full Stack Apps**

smQL is a super lightweight, robust, and reusable JavaScript HTTP client class that simplifies **CRUD** (Create, Read, Update, Delete) operations using standard `fetch` API calls. It’s designed to streamline REST API interactions in your Semantq full-stack apps — keeping your code clean, consistent, and DRY.



## Installation

Install via npm:

```bash
npm install @semantq/ql
```

Import into your project:

```js
import smQL from '@semantq/ql';

// OR 
import smQL, { Form } from '@semantq/ql';
```



## Usage

### Static One-Off Calls

Make a single request without creating an instance:

```js
const res = await smQL.fetch('/api/resource', 'GET');
```



### Creating an Instance with Base URL + Using Convenience CRUD Methods

Instantiate `smQL` with a base API URL, then call methods passing relative endpoint paths:

```js
const api = new smQL('http://localhost:3003');

const products = await api.get('/product/products');

const newProduct = { name: 'Herbal Tea', price: 29.99 };
await api.post('/product/products', newProduct);

const updateData = { price: 24.99 };
await api.put('/product/products/42', updateData);

await api.delete('/product/products/42');
```



### Direct Constructor Usage (Full Parameter Mode)

Alternatively, call directly with all parameters:

```js
const result = await new smQL(endpoint, method, body, options);
```

#### Parameters:

| Parameter  | Type     | Description                                                             |
| - | -- | -- |
| `endpoint` | `string` | Full API URL or relative path                                           |
| `method`   | `string` | HTTP method (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`), defaults `'GET'` |
| `body`     | `object` | Payload for `POST`, `PUT`, or `PATCH` (optional)                        |
| `options`  | `object` | Config object supporting:                                               |

| Option           | Type    | Description                                                     |
| - | - |  |
| `headers`        | Object  | Additional headers to send (merged with default `Content-Type`) |
| `log`            | Boolean | Enable/disable console logging (default: `true`)                |
| `formId`         | String  | DOM ID of a form to auto-replace with success/error message     |
| `successMessage` | String  | Message shown on success (default: "Submission successful.")    |
| `errorMessage`   | String  | Message shown on failure (default: "An error occurred.")        |



## Auto Logging

All requests automatically log success or failure to the console:

```js
POST [201]: { id: 1, name: "Item" }
```

Disable logs per request:

```js
await new smQL('/api/resource', 'POST', payload, { log: false });
```



## Returned Result

Each request returns a Promise resolving to:

```js
{
  status: number,       // HTTP status code
  ok: boolean,          // true if response.ok
  data: any,            // JSON or text response data
  error?: string        // Error message if request failed
}
```

Example usage:

```js
const response = await new smQL('/api/resource');
const data = response.data;
```



## Built-in Form Feedback

Pass a `formId` in options to automatically replace the form with messages:

* On **success** (`POST`, `PUT`): form replaced by success message.
* On **error**: form replaced by error message.

Example:

```js
await new smQL('/products', 'POST', formData, {
  formId: 'addProductForm',
  successMessage: 'Product added!',
  errorMessage: 'Something went wrong.',
});
```



## Examples: CRUD Operations

### 1. **GET** — Fetch all products

```js
const res = await new smQL('http://localhost:3003/product/products');
```

### 2. **POST** — Create a new category

```js
const data = { name: 'Mobiles' };
const res = await new smQL('http://localhost:3003/category/categories', 'POST', data);
```

### 3. **PUT** — Update a record

```js
const update = { name: 'Mobile Phones' };
const res = await new smQL('http://localhost:3003/category/categories/7', 'PUT', update);
```

### 4. **DELETE** — Remove a record (logs off)

```js
const res = await new smQL('http://localhost:3003/product/products/42', 'DELETE', null, { log: false });
```

### 5. **GET with Custom Headers**

```js
const res = await new smQL('/api/secure', 'GET', null, {
  headers: {
    Authorization: 'Bearer token123',
  },
});
```

### 6. **POST with Full UI Feedback**

```js
const formData = { name: 'Herbal Tea', price: 29.99 };

await new smQL('/product/products', 'POST', formData, {
  formId: 'productForm',
  successMessage: 'Product added successfully!',
  errorMessage: 'Please check your inputs.',
});
```



## Capturing Form Data: The `Form` Helper Class

`smQL` includes a lightweight `Form` utility class to capture HTML form submissions, convert to plain JS objects, and handle via callbacks or custom events.

### Step 1: Minimal Setup (Quick Start)

```js
import { Form } from '@semantq/ql';

new Form('myFormId', {
  onCaptured: async (data) => {
    await new smQL('/api/endpoint', 'POST', data, { formId: 'myFormId' });
  },
});
```

### Step 2: Using Event Listener

```js
import { Form } from '@semantq/ql';

const formHandler = new Form('productForm');

formHandler.form.addEventListener('form:captured', async (e) => {
  const data = e.detail;
  await new smQL('/product/products', 'POST', data, { formId: 'productForm' });
});
```

### Step 3: Add Debugging and Inline Feedback

```js
new Form('productForm', {
  debug: true,
  onCaptured: async (data) => {
    await new smQL('/product/products', 'POST', data, { formId: 'productForm' });
  },
});
```

### Step 4: Full Configuration

```js
new Form('orderForm', 'submit', {
  debug: true,
  onCaptured: async (data) => {
    await new smQL('/orders', 'POST', data, {
      formId: 'orderForm',
      log: true,
      headers: {
        Authorization: 'Bearer token123',
      },
      successMessage: 'Order submitted successfully!',
      errorMessage: 'Failed to submit order. Please try again.',
    });
  },
});
```

#### Form Parameters

| Parameter    | Type       | Default    | Description                                       |
|  | - | - | - |
| `formId`     | `string`   | —          | ID of the HTML form element                       |
| `eventType`  | `string`   | `'submit'` | Event to listen for (e.g. `'submit'`, `'change'`) |
| `debug`      | `boolean`  | `false`    | Logs captured form data to the console            |
| `onCaptured` | `function` | —          | Callback executed with captured form data         |



## Pro Tip: Combine with `smQL` for Full-Stack CRUD

```js
new Form('contactForm', {
  onCaptured: async (data) => {
    await new smQL('/contact/submit', 'POST', data, {
      formId: 'contactForm',
      successMessage: 'Thank you! We’ll be in touch.',
      errorMessage: 'There was a problem. Please try again.',
    });
  },
});
```



## Why Use `smQL.js`?

* **Clean**: Say goodbye to repetitive fetch boilerplate
* **Fast**: One-liner CRUD calls
* **Safe**: Built-in error handling & form feedback
* **Reusable**: Works with any REST API
* **Smart**: Optional logging and auto UI updates



## Related Projects

* [Semantq Full Stack Starter](https://github.com/Gugulethu-Nyoni/semantq) – Seamlessly integrates with `smQL`.



## License

**MIT License** — use freely in personal and commercial projects.

Danko! Siyabonga!
