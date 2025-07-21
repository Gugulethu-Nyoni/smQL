# SemantqQL 

**CRUD Abstraction for Semantq Full Stack Apps**

SemantqQL is a super lightweight, robust, and reusable JavaScript HTTP client class that simplifies **CRUD** (Create, Read, Update, Delete) operations using standard `fetch` API calls. It’s designed to streamline REST API interactions in your Semantq full-stack apps—keeping your code clean, consistent, and DRY.


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

Create an instance using:

```js
const result = await new smQL(endpoint, method, body, options);
```

### Parameters:

* **`endpoint`**: API URL string
* **`method`**: HTTP method string (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`) – defaults to `'GET'`
* **`body`**: Data payload for POST/PUT/PATCH requests (optional)
* **`options`**: Config object supporting:

  | Option           | Type    | Description                                                         |
  | - | - | - |
  | `headers`        | Object  | Additional headers                                                  |
  | `log`            | Boolean | Enable/disable auto logging to console (default: `true`)            |
  | `formId`         | String  | DOM ID of the form to show auto success/error messages              |
  | `successMessage` | String  | Custom message shown on success (default: "Submission successful.") |
  | `errorMessage`   | String  | Custom message on failure (default: "An error occurred.")           |



## Auto Logging

Out of the box, all requests automatically log success or failure:

```js
POST [201]: { id: 1, name: "Item" }
```

Disable logs per request:

```js
await new smQL('/api/resource', 'POST', payload, { log: false });

// OR 

await new smQL('/api/resource', 'GET', null, { log: false });

```

##  Returned Result

Each request returns a promise (response) that resolves to:

```js
{
  status: number,       // HTTP status code
  ok: boolean,          // true if response.ok
  data: any,            // JSON or plain response
  error?: string        // Error message if applicable
}
```

So your actual data should be accessed this way: 

```javascript
let data;
const response = await new smQL('/api/resouce');
data=response.data;
```

## Built-in Form Feedback

If you provide `formId` in the config:

* On **success** (`POST`, `PUT`): the form is replaced with a success message.
* On **error**: the form is replaced with an error message.

Example:

```js
const formId = 'addProductForm';
await new smQL('/products', 'POST', formData, {
  formId,
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

### 4. **DELETE** — Remove a record (with logs off)

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

`semantqQL` ships with a lightweight `Form` utility class that captures HTML form submissions, converts them to a plain JS object, and lets you handle the data via a simple callback or custom event.

### Step 1: Minimal Setup (Quick Start)

Use this to **get up and running fast** with just a form ID and a handler:

```js
import { Form } from '@semantq/ql';

new Form('myFormId', {
  onCaptured: async (data) => {
    await new smQL('/api/endpoint', 'POST', data, {
      formId: 'myFormId',
    });
  },
});
```

> This is the cleanest version—ideal for rapid prototyping.


### Step 2: Using the Event Listener (for custom logic elsewhere)

If you prefer decoupling the form logic or triggering other actions:

```js
import { Form } from '@semantq/ql';

const formHandler = new Form('productForm');

formHandler.form.addEventListener('form:captured', async (e) => {
  const data = e.detail;

  await new smQL('/product/products', 'POST', data, {
    formId: 'productForm',
  });

});
```

> Useful when you want multiple listeners or fine control over side effects.


### Step 3: Add Debugging and Inline Feedback

Use the `debug` option to log captured form data to the console:

```js
new Form('productForm', {
  debug: true,
  onCaptured: async (data) => {
    await new smQL('/product/products', 'POST', data, {
      formId: 'productForm',
    });
  },
});
```

> Ideal for development mode or troubleshooting form submissions.


### Step 4: Full Configuration (All Available Options)

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

#### Available Parameters

| Parameter    | Type       | Default    | Description                                        |
| ------------ | ---------- | ---------- | -------------------------------------------------- |
| `formId`     | `string`   | —          | ID of the HTML form element                        |
| `eventType`  | `string`   | `'submit'` | Event to listen for (e.g. `'submit'`, `'change'`)  |
| `debug`      | `boolean`  | `false`    | Logs captured form data to the console             |
| `onCaptured` | `function` | —          | Callback function executed with captured form data |


## Pro Tip: Combine with `smQL` for Full-Stack CRUD

Together, `Form` and `smQL` give you a seamless, declarative way to build **interactive forms with instant UI feedback**:

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

## Why Use `semantqQL.js`?

*  **Clean**: Say goodbye to repetitive fetch boilerplate
*  **Fast**: One-liner CRUD calls
*  **Safe**: Built-in error handling & form feedback
*  **Reusable**: Works with any REST API
*  **Smart**: Optional logging and auto UI updates

##  Related Projects

*  [Semantq Full Stack Starter](https://github.com/Gugulethu-Nyoni/semantq) – Seamlessly integrates with `semantqQL`.

## License

**MIT License** — use freely in personal and commercial projects.

Danko!. Ngyabonga!
