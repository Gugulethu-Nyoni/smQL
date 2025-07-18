// semantqQL.js
export default class smQL {
  constructor(endpoint, method = 'GET', body = null, options = {}) {
    this.endpoint = endpoint;
    this.method = method.toUpperCase();
    this.body = body;
    this.options = options;
    this.log = options.log ?? true; // default: auto log enabled
    return this.request();
  }

  async request() {
    try {
      const config = {
        method: this.method,
        headers: {
          'Content-Type': 'application/json',
          ...this.options.headers,
        },
        ...this.options,
      };

      // Remove log from fetch options — not a valid fetch option
      delete config.log;

      if (['POST', 'PUT', 'PATCH'].includes(this.method)) {
        config.body = JSON.stringify(this.body);
      }

      const response = await fetch(this.endpoint, config);

      const contentType = response.headers.get('content-type');
      const data = contentType && contentType.includes('application/json')
        ? await response.json()
        : await response.text();

      if (this.log) {
        if (response.ok) {
          console.log(`[✅] ${this.method} succeeded [${response.status}]:`, data);
        } else {
          console.warn(`[❌] ${this.method} failed [${response.status}]:`, data);
        }
      }

      return {
        status: response.status,
        ok: response.ok,
        data,
      };
    } catch (error) {
      if (this.log) {
        console.error(`[❌] ${this.method} request error:`, error.message);
      }
      return {
        status: 0,
        ok: false,
        data: null,
        error: error.message,
      };
    }
  }
}
