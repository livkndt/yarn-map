// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Polyfill TextEncoder/TextDecoder for Node.js environment
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// Polyfill Response and Request for Node.js environment (Node 18+)
if (typeof global.Response === 'undefined') {
  // Use a simple mock if undici is not available
  global.Response = class Response {
    constructor(body, init) {
      this.body = body;
      this.status = init?.status || 200;
      this.statusText = init?.statusText || 'OK';
      this.headers = init?.headers || new Map();
    }
  };
  global.Request = class Request {
    constructor(url, init) {
      this.url = url;
      this.method = init?.method || 'GET';
      this.headers = init?.headers || new Map();
    }
  };
  global.Headers = class Headers {
    constructor(init) {
      this.map = new Map(init);
    }
    get(name) {
      return this.map.get(name);
    }
    set(name, value) {
      this.map.set(name, value);
    }
  };
}
