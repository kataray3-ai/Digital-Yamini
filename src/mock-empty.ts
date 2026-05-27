// Mock file to prevent Node.js polyfills from loading in the browser build
export const FormData = typeof window !== "undefined" ? window.FormData : undefined;
export const fetch = typeof window !== "undefined" ? window.fetch : undefined;
export default {};
