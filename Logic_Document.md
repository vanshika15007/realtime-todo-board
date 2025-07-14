# Logic_Document

## Smart Assign Logic

**What is Smart Assign?**
Smart Assign is a feature that automatically assigns a task to the user with the fewest active tasks ("Todo" or "In Progress") when you click the Smart Assign button on a task card.

**How it works:**

- When you click the Smart Assign button, the frontend sends a request to the backend for that specific task.
- The backend checks all users and counts how many active tasks each user currently has.
- It finds the user with the lowest number of active tasks.
- The task is then reassigned to that user.
- The system logs this action and notifies all connected clients in real time, so everyone sees the update instantly.

**Example:**

- User A has 2 active tasks, User B has 1, User C has 3.
- You click Smart Assign on a task.
- The task is assigned to User B (since they have the fewest active tasks).

---

## Conflict Handling Logic

**What is Conflict Handling?**
Conflict Handling ensures that if two users try to edit the same task at the same time, no one's changes are lost. Instead, both versions are shown and the user can decide how to resolve the conflict.

**How it works:**

- Each task has a version number that increases every time it is updated.
- When you edit a task, your version is sent to the backend.
- If someone else has already updated the task (so the version is higher on the server), the backend detects a conflict and returns both the current (server) version and your attempted version.
- The frontend then shows a modal with both versions side by side.
- You can choose to:
  - **Merge:** Combine your changes with the current version (for example, keep your description but use the latest status).
  - **Overwrite:** Force your version to replace the current one.
  - **Cancel:** Discard your changes.

**Example:**

- User A and User B both open Task X.
- User A changes the title and saves. The version increases to 2.
- User B (still seeing version 1) changes the description and tries to save.
- The backend sees that User B's version is outdated, so it returns a conflict.
- User B sees both versions and can choose to merge or overwrite.

---

This logic ensures fair, collaborative editing and prevents accidental data loss in a real-time, multi-user environment.
