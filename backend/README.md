# TaskFlow

TaskFlow is a simple task management application for small teams.

## Features

- Create tasks
- Edit tasks
- Delete tasks
- Move tasks between columns
- Filter tasks by priority
- View task counts by column
- SQLite database
- REST API
- React frontend
- Automated backend tests

## Tech Stack

### Frontend
- React
- Vite
- Axios
- CSS

### Backend
- Node.js
- Express.js
- SQLite
- better-sqlite3

### Testing
- Jest
- Supertest

## Project Structure

```text
taskflow/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   └── app.js
│   ├── tests/
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   └── package.json
│
└── .gitignore


API Endpoints
Method	Endpoint	Description
GET	/api/health	Check API status
GET	/api/boards/:boardId	Get board and tasks
GET	/api/tasks/priority/:priority	Get tasks by priority
POST	/api/tasks	Create a task
PUT	/api/tasks/:id	Update a task
PATCH	/api/tasks/:id/move	Move a task
DELETE	/api/tasks/:id	Delete a task
GET	/api/boards/:boardId/task-counts	Get task counts
Running the Project
Backend
cd backend
npm install
npm start

Backend runs on:

http://localhost:5000
Frontend
cd frontend
npm install
npm run dev

Frontend runs on:

http://localhost:5173
Testing

From the backend directory:

npm test

The current test suite covers board retrieval, task validation, task creation, deletion, priority filtering, and task counts.