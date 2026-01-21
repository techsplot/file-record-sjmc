// Get the API URL from environment variable or use localhost as fallback
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Log the API URL to help with debugging (only shows in browser console)
console.log('API Base URL:', API_BASE_URL);

// Warn if using localhost in production build
if (import.meta.env.PROD && API_BASE_URL.includes('localhost')) {
  console.warn(
    '⚠️ WARNING: Frontend is built for production but still using localhost API URL!\n' +
    'This means your frontend cannot connect to a remote backend.\n' +
    'To fix this:\n' +
    '1. Set the VITE_API_URL environment variable in your Vercel project settings\n' +
    '2. Redeploy your application (make sure to uncheck "Use existing Build Cache")\n' +
    'See DEPLOYMENT.md for detailed instructions.'
  );
}
