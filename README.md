# Realtime Kanban Board

## Project Overview

A modern, real-time Kanban board application built with React, Node.js, Express, and MongoDB. It supports user authentication, real-time task updates, activity logging, smart task assignment, conflict handling, and a fully custom, responsive UI.

---

## Tech Stack

- **Frontend:** React (custom CSS, no UI frameworks)
- **Backend:** Node.js, Express
- **Database:** MongoDB
- **Authentication:** JWT (JSON Web Tokens), bcrypt for password hashing
- **Real-Time:** Socket.IO

---

## Setup & Installation

### Prerequisites

- Node.js (v16+ recommended)
- npm or yarn
- MongoDB (local or Atlas)

### 1. Clone the Repository

```
git clone <your-repo-url>
cd realtime-todo-board
```

### 2. Backend Setup

```
cd backend
npm install
# Create a .env file with:
# MONGO_URI=<your-mongodb-uri>
# JWT_SECRET=<your-secret>
npm run dev
```

- The backend will run on `http://localhost:5001` by default.

### 3. Frontend Setup

```
cd ../client
npm install
npm run dev
```

- The frontend will run on `http://localhost:5173` by default.

---

## Features & Usage Guide

### User Authentication

- Register and login with secure password hashing and JWT.

### Kanban Board

- Three columns: **Todo**, **In Progress**, **Done**
- Drag and drop tasks between columns
- Add, edit, delete, and assign tasks
- Tasks have title, description, priority, due date, tags, and assignee

### Real-Time Sync

- All changes (add/edit/delete/assign/drag-drop) are instantly reflected for all users via Socket.IO.

### Activity Log Panel

- Shows the last 20 actions (add, edit, delete, assign, drag-drop) with user and timestamp
- Updates live as actions occur

### Smart Assign

- Each task card has a **Smart Assign** button
- When clicked, the task is assigned to the user with the fewest active tasks (Todo or In Progress)

### Conflict Handling

- If two users edit the same task at the same time, a conflict is detected
- Both versions are shown in a modal
- Users can choose to **Merge** (combine fields) or **Overwrite** (replace with their version)

### Validation

- Task titles must be unique (case-insensitive) and cannot match column names
- Validation is enforced both on the frontend and backend

### Custom UI & Responsiveness

- Fully custom CSS, no third-party UI frameworks
- Responsive design for desktop and mobile
- Smooth animations for drag-and-drop, buttons, and modals

---

## Smart Assign Logic (Explanation)

- When the **Smart Assign** button is clicked, the backend:
  1. Fetches all users and counts their active tasks (status: Todo or In Progress)
  2. Finds the user with the fewest active tasks
  3. Assigns the task to that user and logs the action
  4. Emits a real-time update to all clients
- The frontend updates the UI instantly via Socket.IO

## Conflict Handling Logic (Explanation)

- Each task has a `version` field
- When editing, the current version is sent with the update
- If another user has updated the task in the meantime, the backend returns a 409 Conflict with both versions
- The frontend shows a modal with both the current and your version
- The user can choose to **Merge** (combine fields) or **Overwrite** (force their version)
- This prevents accidental overwrites and ensures collaborative editing

---

## License

MIT
