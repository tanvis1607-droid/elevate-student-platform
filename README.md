# Elevate — Student Productivity & Career Platform

A full-stack MERN application with authentication, tasks, notes, goals, study sessions, career skills, and a personal dashboard.

## Requirements
- Node.js 18+
- MongoDB Community Server or a MongoDB Atlas connection string

## 1. Configure the backend
```bash
cd server
copy .env.example .env
```
On macOS/Linux use `cp .env.example .env`.
Edit `.env` and set `MONGO_URI`. Keep the JWT secret private.

## 2. Install and start the backend
```bash
npm install
npm run dev
```
The API runs at `http://localhost:5000`.

## 3. Install and start the frontend
Open a second terminal:
```bash
cd client
npm install
npm run dev
```
Open the Vite URL shown in the terminal (normally `http://localhost:5173`).

## Features
- Register, login, and logout using JWT authentication
- Private user-specific data
- Create, read, update, and delete tasks, notes, goals, and career skills
- Record study sessions
- Dashboard summaries and weekly study chart
- Responsive layout

## API overview
All `/api/*` routes except `/api/auth/register` and `/api/auth/login` require:
`Authorization: Bearer <token>`

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET/POST /api/tasks`, `PATCH/DELETE /api/tasks/:id`
- `GET/POST /api/notes`, `PATCH/DELETE /api/notes/:id`
- `GET/POST /api/goals`, `PATCH/DELETE /api/goals/:id`
- `GET/POST /api/skills`, `PATCH/DELETE /api/skills/:id`
- `GET/POST /api/sessions`
- `GET /api/dashboard`

## Troubleshooting
- If MongoDB is local, make sure the MongoDB service is running.
- If you use Atlas, allow your current IP in Atlas Network Access and paste the connection string into `MONGO_URI`.
- Do not commit `.env` or share your JWT secret.
