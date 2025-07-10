# Micro Tasking and Earning Platform - Backend API

This backend API supports a micro-tasking platform with three user roles: **Worker**, **Buyer**, and **Admin**. It handles user management, task creation and management, worker applications, approval workflows, coin transactions, and more.

---

## Live Server

The backend API is deployed and accessible at:  
[https://your-backend-server-url.com](micro-task-backend.vercel.app)  
*(Replace this URL with your actual live backend server URL)*

---

## Features

- **User management:** Register and list users with role-based coins allocation.
- **Task management:** Buyers create tasks specifying required workers and payment.
- **Worker application:** Workers apply for tasks, submissions tracked with status.
- **Approval workflow:** Buyers approve or reject worker submissions.
- **Coin balance:** Automatic coin deduction and credit during task creation and approval.
- **Role-based endpoints:** Different features for Worker, Buyer, and Admin roles.

---

## Installation & Setup

1. Clone the repo  
2. Run `npm install`  
3. Configure `.env` with MongoDB URI and other secrets  
4. Run with `npm run dev` or `node src/app.ts`  

---

## API Endpoints

### Users

- **GET** `/users`  
  Retrieve all registered users.

- **POST** `/users`  
  Register a new user. Request body example:  
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword",
    "role": "Worker", // or "Buyer" / "Admin"
    "coin": 10 // optional, set default in backend based on role
  }
  ```
  Tasks
GET /tasks
Retrieve all tasks.

POST /tasks
Create a new task (Buyer only). Request body example:
```{
  "title": "Watch my YouTube video and comment",
  "buyer": "buyerUserId",
  "payableAmount": 10,
  "requiredWorker": 100,
  "details": "Please provide screenshot as proof",
  "completionDate": "2025-12-31",
  "submissionInfo": "Screenshot of comment",
  "taskImageUrl": "https://example.com/image.jpg",
  "workers": []
}
```
Buyer must have enough coins = payableAmount * requiredWorker.

On success, buyer coins are deducted upfront.

GET /tasks/:id
Get detailed info for a specific task.

PATCH /tasks/:id
Update a worker’s submission status. Request body:
```{
  "user": "workerUserId",
  "status": "pending" | "approved" | "rejected"
}
```
When status is "approved", worker coin balance increases by payableAmount, buyer coin balance decreases accordingly.

DELETE /tasks/:id
Delete a task by ID.

Worker Task Application
POST /apply-task/:id
Worker applies for a task with task ID. Request body:
```{
  "_id": "workerUserId"
}
```
Adds the worker to the task’s workers array with status "pending".

Rejects duplicate applications.

Worker Submissions
GET /my-submission/:workerId
Get all tasks a worker has applied for.

Buyer Tasks
GET /mytasks/:buyerId
Get all tasks created by a buyer.

Business Logic & Notes
Coin Management:

Buyers pay coins upfront on task creation.

Workers earn coins when their submission is approved.

Buyers’ coins are deducted on approval.

Workers cannot apply multiple times to the same task.

Worker Submission Status:

"pending": Submitted but not yet reviewed.

"approved": Submission accepted, coins transferred.

"rejected": Submission rejected, required worker count adjusted.

Validation:

Checks for user and task existence before operations.

Ensures sufficient coins for payments.

Admin Role:

Manage users, roles, withdrawal requests, and system integrity (to be implemented).

Authentication:

Not included in current backend but recommended to secure routes.

