# Quick Troubleshooting Guide for Vercel Deployment

## Problem: "Failed to connect to server" on Login

This is the most common deployment issue. Here's how to fix it:

### Root Cause
Vite environment variables are injected at **build time**, not runtime. If you set the `VITE_API_URL` environment variable AFTER your app was built, it won't be included in your deployment.

### Solution: Redeploy with Environment Variable

1. **Go to your Vercel project dashboard**
   - Navigate to: Settings → Environment Variables

2. **Verify VITE_API_URL is set correctly**
   - Name: `VITE_API_URL`
   - Value: Your backend URL (e.g., `https://your-backend.onrender.com`)
   - **Important**: 
     - NO trailing slash
     - Use `https://` (not `http://`) for production
     - Not `http://localhost:3001`

3. **Trigger a fresh deployment**
   - Go to: Deployments tab
   - Click the "..." menu on your latest deployment
   - Click "Redeploy"
   - **CRITICAL**: Uncheck "Use existing Build Cache"
   - Click "Redeploy"

4. **Wait for deployment to complete**
   - This will rebuild your app with the correct environment variable

5. **Test your deployment**
   - Open your browser's Developer Tools (F12)
   - Go to the Console tab
   - Look for the message: `API Base URL: https://your-backend.onrender.com`
   - If it shows `http://localhost:3001`, the environment variable wasn't loaded correctly

### How to Verify Backend is Running

Before testing the frontend, verify your backend is working:

```bash
curl https://your-backend-url.com/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "SJMC backend is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456
}
```

If this doesn't work, your backend isn't running. Check your backend deployment logs.

### Additional Checks

1. **Browser Console Errors**
   - Open Developer Tools (F12) → Console tab
   - Look for network errors or CORS errors
   - The console will show what URL the app is trying to connect to

2. **Network Tab**
   - Open Developer Tools (F12) → Network tab
   - Try logging in
   - Look for the login request
   - Check if it's going to the correct URL
   - Check the response (should be 200 OK if credentials are correct)

3. **Environment Variable Scope**
   - Make sure you added `VITE_API_URL` to all environments:
     - Production
     - Preview
     - Development (optional, for Vercel dev)

## Still Having Issues?

See the complete [DEPLOYMENT.md](./DEPLOYMENT.md) guide for:
- Step-by-step deployment instructions
- Detailed troubleshooting
- Environment variable reference
- Testing procedures

## Quick Checklist

- [ ] Backend is deployed and `/health` endpoint returns `{"status":"ok"}`
- [ ] `VITE_API_URL` is set in Vercel environment variables
- [ ] `VITE_API_URL` value is correct (https://, no trailing slash, not localhost)
- [ ] Redeployed with build cache disabled
- [ ] Browser console shows correct API URL
- [ ] No CORS errors in browser console
