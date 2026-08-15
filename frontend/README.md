# TaskFlow

TaskFlow is a lightweight full-stack Kanban task board built as a take-home assignment.

It allows users to create, edit, delete, filter, and move tasks between columns. All task changes are persisted to a SQLite database through a Node.js/Express backend.

## Live Demo

**Frontend:** https://taskflow-frontend-ltvf.onrender.com/

**GitHub:** https://github.com/Parvez8561/TaskFlow

## Features

* View tasks in To Do, In Progress, and Done columns
* Create new tasks
* Edit existing tasks
* Delete tasks
* Move tasks between columns
* Filter tasks by priority
* Backend validation for required fields
* User-friendly error messages
* SQLite database persistence
* Seed data for a fresh database
* Backend automated tests

## Tech Stack

### Frontend

* React
* Vite
* JavaScript
* CSS

### Backend

* Node.js
* Express
* better-sqlite3
* CORS

### Testing

* Jest
* Supertest

### Database

* SQLite

## Project Structure

```text
TaskFlow/
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   └── App.css
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── routes/
│   │   └── task.js
│   ├── tests/
│   │   └── task.test.js
│   ├── database.js
│   ├── queries.js
│   ├── seed.js
│   ├── schema.sql
│   ├── server.js
│   ├── package.json
│   └── taskflow.db
│
└── README.md
```

## Requirements

Make sure the following are installed:

* Node.js
* npm

## Installation

Clone the repository:

```bash
git clone https://github.com/Parvez8561/TaskFlow.git
cd TaskFlow
```

### Backend

Open a terminal and run:

```bash
cd backend
npm install
```

### Frontend

Open another terminal and run:

```bash
cd frontend
npm install
```

## Database Setup

The project uses SQLite with `better-sqlite3`.

The database schema is defined in:

```text
backend/schema.sql
```

Seed data is provided through:

```text
backend/seed.js
```

To reset the database and insert the sample data:

```bash
cd backend
node seed.js
```

This creates:

* One TaskFlow board
* To Do column
* In Progress column
* Done column
* Sample tasks

The database uses foreign keys to maintain relationships between boards, columns, and tasks.

Required fields such as task title use `NOT NULL` constraints.

## Running the Application

### Start the Backend

From the `backend` directory:

```bash
node server.js
```

The backend runs on:

```text
http://localhost:5000
```

### Start the Frontend

Open another terminal and run:

```bash
cd frontend
npm run dev
```

Vite will provide the local frontend URL, usually:

```text
http://localhost:5173
```

If that port is already in use, Vite may select another available port.

## API Endpoints

### Get Tasks

```http
GET /api/tasks
```

Returns all tasks ordered by column and position.

### Create Task

```http
POST /api/tasks
```

Example:

```json
{
  "title": "Build dashboard",
  "description": "Create the dashboard UI",
  "priority": "high",
  "column_id": 4
}
```

### Move Task

```http
PUT /api/tasks/:id
```

Example:

```json
{
  "column_id": 5
}
```

### Edit Task

```http
PATCH /api/tasks/:id
```

Example:

```json
{
  "title": "Updated task",
  "description": "Updated description",
  "priority": "medium"
}
```

### Delete Task

```http
DELETE /api/tasks/:id
```

## Database Queries

Two non-trivial database queries are implemented in:

```text
backend/queries.js
```

### 1. Task Count Per Column

The first query counts tasks for each column using SQL aggregation:

```sql
SELECT
  columns.id,
  columns.name,
  COUNT(tasks.id) AS task_count
FROM columns
LEFT JOIN tasks
  ON tasks.column_id = columns.id
GROUP BY columns.id, columns.name
ORDER BY columns.position;
```

### 2. Tasks By Priority

The second query retrieves tasks with a specific priority and sorts them newest first:

```sql
SELECT
  tasks.id,
  tasks.title,
  tasks.description,
  tasks.priority,
  tasks.created_at,
  columns.name AS column_name
FROM tasks
JOIN columns
  ON tasks.column_id = columns.id
WHERE tasks.priority = ?
ORDER BY tasks.created_at DESC;
```

## Validation and Error Handling

The backend validates:

* Task title cannot be empty
* Priority must be `low`, `medium`, or `high`
* Column must exist
* Task must exist before updating or deleting

The frontend also displays user-friendly error messages when backend requests fail.

## Tests

The backend uses Jest and Supertest.

Run the tests from the backend directory:

```bash
npm test
```

The test suite covers:

1. Creating a task without a title should fail
2. Moving a task should update its column
3. Task count per column database query
4. Tasks by priority database query

Current test result:

```text
Test Suites: 1 passed, 1 total
Tests:       4 passed, 4 total
```

## Design Decisions and Assumptions

* SQLite was selected because the assignment allows it and it keeps local setup simple.
* Tasks use the existing board columns: To Do, In Progress, and Done.
* Task movement is implemented using buttons instead of drag-and-drop because the assignment explicitly allows a simple control.
* A task title is required and is validated both on the frontend and backend.
* A task priority defaults to Medium when creating a task.
* The implementation focuses on the required core functionality rather than adding features explicitly listed as out of scope.

## Deployment

The frontend is deployed on Render and is available at:

https://taskflow-frontend-ltvf.onrender.com/

The project was deployed to provide a working live demo for the assignment evaluation.

## What I Would Improve With More Time

If more time were available, I would consider:

* Drag-and-drop task movement
* Task title search
* More comprehensive API and frontend tests
* Improved task descriptions in the UI
* Better position management when tasks are moved or deleted
* More robust production database/deployment configuration

## Time Spent

Approximately 1–2 days were spent implementing the project, including the frontend, backend API, SQLite database, validation, testing, documentation, and deployment.

## What I Learned

One useful part of the project was working directly with SQLite and writing SQL queries instead of relying on an ORM. This helped reinforce how relational database relationships, foreign keys, aggregation, filtering, and ordering work at the database level.

## Scope

The following features were intentionally not included because they were explicitly listed as out of scope in the assignment:

* User accounts/login
* Multiple users or teams
* Realtime updates between browser tabs
* File uploads

The implementation focuses on delivering a clean, functional, and testable task board.

## License

This project was created as part of a Full-Stack Developer take-home assignment.
