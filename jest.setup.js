/* eslint-disable no-undef */
// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Polyfill TextEncoder/TextDecoder for Node.js environment
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// Polyfill Web APIs needed for Next.js testing
// Node 18+ should have these, but just in case
if (typeof global.ReadableStream === 'undefined') {
  const { ReadableStream, TransformStream } = require('stream/web');
  global.ReadableStream = ReadableStream;
  global.TransformStream = TransformStream;
}

// Polyfill MessageChannel for Node.js test environment
if (typeof global.MessageChannel === 'undefined') {
  const { MessageChannel, MessagePort } = require('worker_threads');
  global.MessageChannel = MessageChannel;
  global.MessagePort = MessagePort;
}

// Web APIs - if not available, use minimal mocks
if (typeof global.Request === 'undefined') {
  // Node 20+ should have these built-in
  // For older versions, use whatwg-fetch or similar
  try {
    const { Request, Response, Headers, fetch } = require('undici');
    global.Request = Request;
    global.Response = Response;
    global.Headers = Headers;
    global.fetch = fetch;
  } catch {
    // Minimal mocks for tests that don't need full fetch API
    console.warn('undici not available, using minimal mocks');
  }
}
