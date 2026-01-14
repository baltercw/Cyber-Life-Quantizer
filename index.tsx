
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

/**
 * SAFETY POLYFILL
 * Prevents "ReferenceError: process is not defined" in browser environments
 * where Node.js global variables are expected by some libraries or logic.
 */
// Fix: Access window as any to prevent TypeScript errors on the process property check
if (typeof window !== 'undefined' && !(window as any).process) {
  (window as any).process = { env: {} };
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
