# Deployment Guide for SJMC File System

## Deploying to Vercel (Frontend) + Render/Railway (Backend)

This guide will help you deploy the SJMC File System with the frontend on Vercel and the backend on Render or Railway.

### Prerequisites

1. A GitHub account with this repository forked/cloned
2. A [Vercel](https://vercel.com) account
3. A [Render](https://render.com) or [Railway](https://railway.app) account

---

## Step 1: Deploy the Backend First

You must deploy the backend before deploying the frontend, as you'll need the backend URL for the frontend configuration.

### Option A: Deploy Backend on Render

1. Go to [render.com](https://render.com) and sign in
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub repository
4. Render will detect the `render.yaml` file and set up:
   - PostgreSQL database
   - Backend web service
5. Wait for the deployment to complete
6. **Copy the backend URL** (e.g., `https://your-app.onrender.com`)
7. Test the backend by visiting: `https://your-app.onrender.com/health`
   - You should see: `{"status":"ok","message":"SJMC backend is running",...}`

### Option B: Deploy Backend on Railway

1. Go to [railway.app](https://railway.app) and sign in
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select this repository
4. Add a PostgreSQL database:
   - Click **"+ New"** → **"Database"** → **"PostgreSQL"**
5. Connect the database to your backend service by adding environment variables
6. **Copy the backend URL** from Railway
7. Test the backend by visiting: `https://your-app.railway.app/health`

---

## Step 2: Deploy the Frontend on Vercel

### Important: Environment Variables Must Be Set BEFORE First Deploy

Vite builds environment variables into the application at **build time**, not runtime. This means:

- ✅ Set `VITE_API_URL` **BEFORE** the first deployment
- ❌ Setting it **AFTER** deployment won't work until you redeploy

### Deployment Steps

1. Go to [vercel.com](https://vercel.com) and sign in

2. Click **"Add New..."** → **"Project"**

3. Import your GitHub repository

4. **BEFORE clicking "Deploy"**, configure the project:

   - **Framework Preset**: Vite (should be auto-detected)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. **Add Environment Variables** (CRITICAL STEP):
   
   Click **"Environment Variables"** and add:
   
   | Name | Value |
   |------|-------|
   | `VITE_API_URL` | `https://your-backend-url.onrender.com` |
   
   **Important Notes:**
   - Replace `https://your-backend-url.onrender.com` with your actual backend URL from Step 1
   - Do NOT include a trailing slash
   - Make sure the URL starts with `https://` for production backends
   - Add this for all environments (Production, Preview, Development)

6. Click **"Deploy"**

7. Wait for the deployment to complete

8. Test your deployment:
   - Visit your Vercel URL
   - Try logging in with:
     - Email: `admin@sjmc.com`
     - Password: `password123`

---

## Troubleshooting

### "Failed to connect to server" error when logging in

This is the most common issue. Here's how to fix it:

#### 1. Verify Backend is Running

Visit your backend health endpoint: `https://your-backend-url.com/health`

You should see:
```json
{
  "status": "ok",
  "message": "SJMC backend is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456
}
```

If this doesn't work, your backend isn't running properly. Check your backend deployment logs.

#### 2. Check Environment Variable in Vercel

1. Go to your Vercel project
2. Click **"Settings"** → **"Environment Variables"**
3. Verify `VITE_API_URL` is set correctly:
   - Should be: `https://your-backend-url.onrender.com`
   - Should NOT be: `http://localhost:3001`
   - Should NOT have a trailing slash

#### 3. Redeploy if You Changed Environment Variables

If you added/changed `VITE_API_URL` after the initial deployment:

1. Go to your Vercel project
2. Click **"Deployments"**
3. Click the **"..."** menu on the latest deployment
4. Click **"Redeploy"**
5. Make sure **"Use existing Build Cache"** is **UNCHECKED**
6. Click **"Redeploy"**

This forces a fresh build with the new environment variable.

#### 4. Check Browser Console

Open your browser's developer tools (F12) and check the Console tab:

- Look for the message: `API Base URL:` - this shows what URL the frontend is using
- If it shows `http://localhost:3001`, your environment variable didn't get loaded
- You need to redeploy with the correct environment variable

#### 5. Check for CORS Errors

If you see CORS errors in the browser console, your backend might not be allowing requests from your Vercel domain. However, this is unlikely as the backend is configured to accept all origins.

### "Build failed" error

If the build fails:

1. Check the build logs in Vercel
2. Common issues:
   - Missing dependencies - make sure `package.json` is correct
   - TypeScript errors - fix any type errors in the code
   - Build command issues - verify build command is `npm run build`

### Backend database connection issues

If the backend is failing:

1. Check your backend deployment logs
2. Verify PostgreSQL database is running
3. Check database environment variables are set correctly
4. Run the database schema: `backend/schema.sql`

---

## Testing Your Deployment

1. **Test Backend Health**: Visit `https://your-backend-url.com/health`

2. **Test Backend Login API**: 
   ```bash
   curl -X POST https://your-backend-url.com/api/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@sjmc.com","password":"password123"}'
   ```
   
   Should return:
   ```json
   {
     "success": true,
     "message": "Login successful",
     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "user": {"email": "admin@sjmc.com"}
   }
   ```

3. **Test Frontend**: 
   - Visit your Vercel URL
   - Open browser console (F12) and look for `API Base URL:` message
   - Try logging in
   - If successful, you should see the dashboard

---

## Environment Variables Reference

### Frontend (Vercel)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://sjmc-backend.onrender.com` |

### Backend (Render/Railway)

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_HOST` | PostgreSQL host | Auto-set by platform |
| `DB_USER` | PostgreSQL user | Auto-set by platform |
| `DB_PASSWORD` | PostgreSQL password | Auto-set by platform |
| `DB_NAME` | Database name | `sjmc` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment | `production` |

---

## Need Help?

If you're still having issues:

1. Check the browser console for error messages
2. Check backend logs in Render/Railway dashboard
3. Verify all environment variables are set correctly
4. Make sure you redeployed after setting environment variables
5. Test the backend `/health` endpoint directly

For local development, see the main [README.md](./README.md) file.
