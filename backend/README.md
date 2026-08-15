# TaskFlow

TaskFlow is a lightweight Kanban-style task management application for small teams.

It provides a simple board with three columns:

- To Do
- In Progress
- Done

Users can create, edit, delete, move, and filter tasks by priority.

## Tech Stack

### Frontend

- React
- Vite
- Axios
- CSS

### Backend

- Node.js
- Express
- SQLite
- better-sqlite3
- Jest
- Supertest

## Project Structure

```text
taskflow/
├── backend/
│   ├── src/
│   │   ├── app.js
│   │   └── db/
│   │       ├── database.js
│   │       ├── schema.sql
│   │       └── seed.js
│   ├── tests/
│   │   └── tasks.test.js
│   ├── server.js
│   ├── package.json
│   └── taskflow.db
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   └── package.json
│
└── README.md


Features:
View the TaskFlow board
Create tasks
Edit tasks
Delete tasks
Move tasks between columns
Set task priority
Filter tasks by priority
Backend validation for task titles
SQLite persistence
Seed data
REST API
Automated backend tests


Requirements:
Make sure the following are installed:
Node.js
npm
Backend Setup

Open PowerShell and run:
cd D:\taskflow\backend
npm install

Start the backend:

npm start

The API will run at:

http://localhost:5000

Health check:

http://localhost:5000/api/health
Frontend Setup

Open another PowerShell terminal:

cd D:\taskflow\frontend
npm install

Start the frontend:

npm run dev

Open:

http://localhost:5173
Database

TaskFlow uses SQLite.

The database file is:

backend/taskflow.db

The schema is defined in:

backend/src/db/schema.sql

Seed data is provided through:

backend/src/db/seed.js

To run the seed script:

cd D:\taskflow\backend
node src/db/seed.js

The seed script will not duplicate the initial data if it already exists.

API Endpoints
Health
GET /api/health
Get Board
GET /api/boards/:boardId
Get Tasks by Priority
GET /api/tasks/priority/:priority

Supported priorities:

Low
Medium
High
Create Task
POST /api/tasks

Example:

{
  "column_id": 1,
  "title": "Build dashboard",
  "description": "Create the dashboard UI",
  "priority": "High"
}
Update Task
PUT /api/tasks/:id
Move Task
PATCH /api/tasks/:id/move

Example:

{
  "column_id": 2
}
Delete Task
DELETE /api/tasks/:id
Task Counts
GET /api/boards/:boardId/task-counts
Validation

Task titles are required.

The backend rejects requests where the title is empty.

Example response:

{
  "success": false,
  "message": "Task title is required"
}

Valid priorities are:

Low
Medium
High
Testing

The backend uses Jest and Supertest.

Run:

cd D:\taskflow\backend
npm test

The current test suite covers:

Board retrieval
Empty-title validation
Task creation
Task deletion
Priority filtering
Task-count queries
Development

Run backend:

cd D:\taskflow\backend
npm run dev

Run frontend in another terminal:

cd D:\taskflow\frontend
npm run dev

Notes

The application is intended as a lightweight task management system for small teams.

The frontend communicates with the Express REST API, while task data is persisted in SQLite.
