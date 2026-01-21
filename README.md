# Solomon Jayden Medical Center (SJMC) File System

This project is a full-stack web application designed as a file registration and management system for the Solomon Jayden Medical Center. It allows administrative staff to manage personal, family, referral, and emergency patient files through a secure and intuitive interface.

## Features

- **Secure Authentication**: Login system for authorized admin access.
- **Dashboard Overview**: At-a-glance statistics for all file types, including total counts and weekly new registrations.
- **Full CRUD Functionality**: Create, Read, Update, and Delete operations for all file types:
    - Personal Files
    - Family Files
    - Referral Files
    - Emergency Files
- **Dynamic Data Tables**: Search and filter capabilities for easy navigation and file retrieval.
- **Responsive UI**: Clean, modern interface built with React and Tailwind CSS.
- **RESTful Backend**: A robust backend powered by Node.js, Express, and PostgreSQL for data persistence.

## Tech Stack

- **Frontend**: React, Vite, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL
- **Development**: Concurrently (for running frontend and backend together)

---

## Prerequisites

Before you begin, ensure you have the following installed on your local machine:

- **Node.js**: Version 18.x or later.
- **npm**: (Comes with Node.js).
- **PostgreSQL Server**: A running instance of PostgreSQL (e.g., via Docker, locally installed PostgreSQL, or pgAdmin).

---

## Project Setup

Follow these steps to get your development environment set up and running.

### 1. Clone the Repository

First, clone the project repository to your local machine.

```bash
git clone <your-repository-url>
cd <repository-folder>
```

### 2. Backend Setup

The backend server connects to the PostgreSQL database and provides the API for the frontend.

**a. Install Dependencies:**

```bash
cd backend
npm install
```

**b. Configure Environment Variables:**

Create a `.env` file inside the `backend` directory. You can copy the example file to get started:

```bash
cp .env.example .env
```

Now, open the `.env` file and update the values with your PostgreSQL database connection details:

```
# .env file
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=sjmc
DB_PORT=5432
PORT=3001
NODE_ENV=development
```

**c. Set Up the Database:**

- Make sure your PostgreSQL server is running.
- Connect to your PostgreSQL server using your preferred client (e.g., pgAdmin, psql, DBeaver, or the command line).
- Create the database specified in your `.env` file (e.g., `sjmc`):
  ```bash
  # Using psql command line
  createdb sjmc
  # Or in psql shell
  CREATE DATABASE sjmc;
  ```
- Execute the SQL script from `backend/schema.sql` to create all the necessary tables and seed them with initial data:
  ```bash
  # Using psql command line
  psql -U postgres -d sjmc -f backend/schema.sql
  ```

### 3. Frontend Setup

The frontend is a React single-page application.

**a. Install Dependencies:**

Navigate to the project's root directory and install the necessary npm packages.

```bash
# From the root directory of the project
npm install
```

---

## Running the Application

This project is configured to run both the frontend and backend servers concurrently with a single command.

From the **root directory** of the project, run:

```bash
npm run dev
```

This command will:
1.  Start the backend API server on `http://localhost:3001`.
2.  Start the frontend Vite development server on `http://localhost:5173` (or another available port).
3.  Automatically open the application in your default web browser.

You can now access the application and test its features.

### Login Credentials

Use the following credentials to log in to the application:

- **Email**: `admin@sjmc.com`
- **Password**: `password123`

---

## Deployment

This application can be deployed for free on several platforms:

### Deploy on Render (Recommended)

1. Fork this repository
2. Sign up at [render.com](https://render.com)
3. Click "New +" → "Blueprint"
4. Connect your repository
5. Render will automatically detect `render.yaml` and set up both frontend, backend, and PostgreSQL database
6. Update the environment variables in Render dashboard if needed

### Deploy on Railway

1. Sign up at [railway.app](https://railway.app)
2. Create new project → "Deploy from GitHub repo"
3. Select this repository
4. Add a PostgreSQL database: Click "+ New" → "Database" → "PostgreSQL"
5. Add environment variables from the database to your backend service
6. Deploy!

### Deploy Frontend on Vercel + Backend on Render/Railway

**Frontend (Vercel):**
1. Sign up at [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Vercel will auto-detect Vite configuration
4. Add environment variable: `VITE_API_URL` = your backend URL

**Backend:** Follow Render or Railway instructions above for backend + database.

### Environment Variables for Production

Make sure to set these environment variables in your hosting platform:

**Backend:**
- `DB_HOST` - PostgreSQL host (auto-set by Render/Railway)
- `DB_USER` - PostgreSQL user
- `DB_PASSWORD` - PostgreSQL password
- `DB_NAME` - Database name (sjmc)
- `DB_PORT` - PostgreSQL port (5432)
- `PORT` - Server port (3001)
- `NODE_ENV` - production

**Frontend:**
- `VITE_API_URL` - Your backend API URL (e.g., https://sjmc-backend.onrender.com)

---

## API Documentation

The SJMC backend provides a comprehensive RESTful API with interactive documentation via Swagger UI.

### Accessing the API Documentation

Once the backend is running, you can access the interactive API documentation at:

- **Local Development**: `http://localhost:3001/api-docs`
- **Production**: `https://your-backend-url.com/api-docs`

The Swagger UI provides:
- Complete list of all API endpoints
- Request/response schemas
- Try-it-out functionality to test endpoints directly
- Authentication handling for protected endpoints

### Health Check Endpoint

To quickly verify that your backend is running, use the health check endpoint:

**Endpoint**: `GET /health`

**Example Request**:
```bash
curl http://localhost:3001/health
```

**Example Response**:
```json
{
  "status": "ok",
  "message": "SJMC backend is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456
}
```

This endpoint is publicly accessible (no authentication required) and is perfect for:
- Verifying deployment status
- Health monitoring
- Load balancer health checks

### API Authentication

Most API endpoints require JWT authentication. Here's how to access protected endpoints:

#### Step 1: Login to Get JWT Token

**Endpoint**: `POST /api/login`

**Request Body**:
```json
{
  "email": "admin@sjmc.com",
  "password": "password123"
}
```

**Example using curl**:
```bash
curl -X POST http://localhost:3001/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sjmc.com","password":"password123"}'
```

**Response**:
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "email": "admin@sjmc.com"
  }
}
```

#### Step 2: Use the Token for Protected Endpoints

Include the JWT token in the `Authorization` header with the format `Bearer <token>`:

**Example**:
```bash
curl http://localhost:3001/api/stats \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Quick API Reference

#### Authentication Endpoints
- `POST /api/login` - Login and get JWT token
- `GET /api/verify-token` - Verify if a token is valid (requires auth)

#### Statistics
- `GET /api/stats` - Get statistics for all file types (requires auth)

#### Personal Files
- `GET /api/personal` - Get all personal files
- `POST /api/personal` - Create a new personal file
- `PUT /api/personal/:id` - Update a personal file
- `DELETE /api/personal/:id` - Delete a personal file

#### Family Files
- `GET /api/family` - Get all family files
- `POST /api/family` - Create a new family file
- `PUT /api/family/:id` - Update a family file
- `DELETE /api/family/:id` - Delete a family file

#### Referral Files
- `GET /api/referral` - Get all referral files
- `POST /api/referral` - Create a new referral file
- `PUT /api/referral/:id` - Update a referral file
- `DELETE /api/referral/:id` - Delete a referral file

#### Emergency Files
- `GET /api/emergency` - Get all emergency files
- `POST /api/emergency` - Create a new emergency file
- `PUT /api/emergency/:id` - Update an emergency file
- `DELETE /api/emergency/:id` - Delete an emergency file

### Testing the API

You can test the API in several ways:

1. **Swagger UI** (Recommended): Visit `/api-docs` for interactive testing
2. **curl**: Use command-line curl commands (examples above)
3. **Postman**: Import endpoints from Swagger JSON at `/api-docs/swagger.json`
4. **Frontend Application**: The React frontend provides a complete UI for all operations

For detailed request/response schemas and to try out the API endpoints interactively, please visit the Swagger UI documentation at `/api-docs`.
