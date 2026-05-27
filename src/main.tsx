// Redefine window.fetch if it exists to be writable and configurable
if (typeof window !== "undefined" && window.fetch) {
  try {
    const originalFetch = window.fetch;
    Object.defineProperty(window, "fetch", {
      value: originalFetch,
      writable: true,
      configurable: true,
    });
  } catch (e) {
    console.warn("Could not modify window.fetch getter:", e);
  }
}
if (typeof globalThis !== "undefined" && globalThis.fetch) {
  try {
    const originalFetch = globalThis.fetch;
    Object.defineProperty(globalThis, "fetch", {
      value: originalFetch,
      writable: true,
      configurable: true,
    });
  } catch (e) {
    console.warn("Could not modify globalThis.fetch getter:", e);
  }
}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
