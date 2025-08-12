// smQL.js

/**
 * A client for making API requests with a consistent, readable interface.
 */
export default class smQL {
  constructor(endpoint, options = {}) {
    this.endpoint = endpoint;
    this.options = options;
    this.log = options.log ?? true;
    this.formId = options.formId ?? null;
    this.successMessage = options.successMessage ?? 'Submission successful.';
    this.errorMessage = options.errorMessage ?? 'An error occurred. Please try again.';
  }

  /**
   * Internal method to handle the fetch request logic.
   * @param {string} method - The HTTP method (GET, POST, etc.).
   * @param {object | null} body - The request body.
   * @returns {Promise<object>} The response data, status, and ok status.
   */
  async #request(method, body = null) {
    try {
      const config = {
        method: method.toUpperCase(),
        headers: {
          'Content-Type': 'application/json',
          ...this.options.headers,
        },
        ...this.options,
      };

      // Remove non-fetch config keys
      delete config.log;
      delete config.formId;
      delete config.successMessage;
      delete config.errorMessage;

      // Add JSON body if needed
      if (['POST', 'PUT', 'PATCH'].includes(config.method) && body) {
        config.body = JSON.stringify(body);
      }

      const response = await fetch(this.endpoint, config);

      const contentType = response.headers.get('content-type');
      const data = contentType && contentType.includes('application/json')
        ? await response.json()
        : await response.text();

      // Handle logging and form updates
      if (this.log) {
        const statusMsg = `${config.method} [${response.status}]`;
        response.ok
          ? console.log(`[✅] ${statusMsg}:`, data)
          : console.warn(`[❌] ${statusMsg}:`, data);
      }

      if (this.formId) {
        const form = document.getElementById(this.formId);
        if (form) {
          if (response.ok && ['POST', 'PUT'].includes(config.method)) {
            form.innerHTML = `<div class="formique-success">${this.successMessage}</div>`;
          }
          if (!response.ok) {
            form.innerHTML = `<div class="formique-error">${this.errorMessage}</div>`;
          }
        }
      }

      return {
        status: response.status,
        ok: response.ok,
        data,
      };
    } catch (error) {
      if (this.log) {
        console.error(`[❌] ${method} request error:`, error.message);
      }

      if (this.formId) {
        const form = document.getElementById(this.formId);
        if (form) {
          form.innerHTML = `<div class="formique-error">${this.errorMessage}</div>`;
        }
      }

      return {
        status: 0,
        ok: false,
        data: null,
        error: error.message,
      };
    }
  }

  // Public methods for specific HTTP verbs
  async get() {
    return this.#request('GET');
  }

  async post(body) {
    return this.#request('POST', body);
  }

  async put(body) {
    return this.#request('PUT', body);
  }

  async patch(body) {
    return this.#request('PATCH', body);
  }

  async delete() {
    return this.#request('DELETE');
  }
}

// The Form class is already well-designed and does not require changes.
// It is included here for completeness.
export class Form {
  constructor(formId, eventType = 'submit', options = {}) {
    this.form = document.getElementById(formId);
    if (!this.form) throw new Error(`Form with ID "${formId}" not found`);

    this.debug = options.debug ?? false;
    this.data = null;
    this.onCaptured = options.onCaptured;

    this.form.addEventListener(eventType, (event) => {
      event.preventDefault();
      this.data = this.#captureFormData(this.form);

      if (this.debug) {
        console.log(`[Form] Data captured from #${formId}:`, this.data);
      }

      if (typeof this.onCaptured === 'function') {
        this.onCaptured(this.data);
      }

      const customEvent = new CustomEvent('form:captured', { detail: this.data });
      this.form.dispatchEvent(customEvent);
    });
  }

  #captureFormData(form) {
    const formData = new FormData(form);
    const data = {};
      
    // Handle all form elements
    for (const [name, value] of formData.entries()) {
      // If the key already exists, convert to array or push to existing array
      if (data[name] !== undefined) {
        if (Array.isArray(data[name])) {
          data[name].push(value);
        } else {
          data[name] = [data[name], value];
        }
      } else {
        data[name] = value;
      }
    }
      
    // Special handling for multi-selects that might not be included in FormData if nothing selected
    const multiSelects = form.querySelectorAll('select[multiple]');
    multiSelects.forEach(select => {
      if (!select.name) return;
        
      const selectedOptions = Array.from(select.selectedOptions).map(opt => opt.value);
      if (selectedOptions.length > 0) {
        data[select.name] = selectedOptions.length === 1 ? selectedOptions[0] : selectedOptions;
      }
    });
      
    return data;
  }

  getData() {
    return this.data;
  }
}