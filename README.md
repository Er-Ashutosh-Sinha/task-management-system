# Task Management System

**Author: Ashutosh Sinha**

##

A full-stack Task Manager application with authentication, role-based permissions, and a React frontend.

## Features

- User authentication with JWT (email/password)
- Role-based access control (Admin and Member roles)
- Task management (CRUD operations)
- Task filtering, sorting, and pagination
- Activity logging for tasks
- Statistics dashboard
- Responsive React UI

## Tech Stack

### Backend

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Bcrypt for password hashing
- Celebrate/Joi for validation

### Frontend

- React with Hooks
- React Router
- CSS Modules

### Containerization

- Docker & Docker Compose

---

## Getting Started

### Prerequisites

- Docker & Docker Compose installed
- Node.js (for local development without Docker)
- MongoDB (for local development without Docker)

### Environment Variables

**Backend (`backend/.env`):**

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://mongo:27017/taskmanager
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=30d
FRONTEND_URL=http://localhost:3000
```

**Frontend (`frontend/.env`):**

```env
REACT_APP_API_BASE_URL=http://localhost:5000/api
```

> ⚠️ Note: When building the frontend with Docker, pass `REACT_APP_API_BASE_URL` as a build argument.

---

### Running with Docker

1. Clone the repository:

```bash
git clone <repository-url>
cd task-manager
```

2. Start containers:

```bash
docker-compose up --build
```

3. Services will run on:

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:5000](http://localhost:5000)
- MongoDB: port `27017`

---

### Running Locally without Docker

1. Start MongoDB locally (or via Docker):

```bash
docker run -d --name taskmanager-mongo -p 27017:27017 mongo:7
```

2. Start backend:

```bash
cd backend
npm install
npm run dev
```

3. Start frontend:

```bash
cd frontend
npm install
npm start
```

---

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Users (Admin only)

- `GET /api/users` - Get all users
- `PATCH /api/users/:id/role` - Update user role

### Tasks

- `POST /api/tasks` - Create a new task
- `GET /api/tasks` - Get all tasks (with filtering, sorting, pagination)
- `GET /api/tasks/:id` - Get a specific task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task

### Stats

- `GET /api/stats/overview` - Get stats overview

---

## Development

### Scripts

**Backend**

```bash
npm run dev          # Start backend with nodemon
npm start            # Start backend in production mode
npm run test:backend # Run backend tests
```

**Frontend**

```bash
npm start            # Start frontend development server
npm run build        # Build frontend for production
npm run test:frontend # Run frontend tests
```

**Docker**

```bash
docker-compose up --build      # Start backend, frontend, and MongoDB
docker-compose down            # Stop and remove containers
docker-compose logs -f backend # Follow backend logs
```

---

## Running Tests

### Backend Tests

```bash
cd backend
npm run test
```

- Tests use an in-memory MongoDB (`mongodb-memory-server`), so no external MongoDB instance is required for running test cases.

- Runs unit and integration tests for controllers, models, and middleware.

---

## Linting & Formatting

```bash
npm run lint        # Lint both backend and frontend
npm run lint:fix    # Fix linting issues
npm run format      # Format frontend code with Prettier
```

---

## Project Structure

```
task-manager/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── tests/
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   ├── services/
│   │   └── ...
│   ├── package.json
│   └── ...
└── docker-compose.yml
```

---

## Role-Based Access Control

- **Members**: Can only manage their own tasks
- **Admins**: Can manage all tasks and users

---

## Notes

- **CORS:** Backend is configured to allow requests from `FRONTEND_URL`.
- **Docker Networking:** `backend` container connects to `mongo` via service name (`mongodb://mongo:27017/taskmanager`).
- **Frontend Build Arg:** When building frontend via Docker, pass `REACT_APP_API_BASE_URL` as a build arg to ensure correct API URL.

---

## License

All rights reserved. This software is private and may not be copied, distributed, or used without permission from the author.
