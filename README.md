# 🚀 TaskFlow — Team Task Manager

A modern, full-stack SaaS project management app where teams can create projects, assign tasks, track progress, and collaborate — all with role-based access control.

---

## 👀 What Does This App Do?

Think of it like a lightweight Jira or Trello built from scratch. Here's what you get:

- **Admins** can create projects, add team members, assign tasks, and see everything
- **Members** can view their assigned tasks and update their status
- A **Dashboard** shows you stats like total tasks, completed, overdue, and a chart of who's doing what
- A **Kanban board** where you can drag and drop tasks between To Do, In Progress, and Done
- Clean, modern UI that works on both desktop and mobile

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js + Tailwind CSS + Vite |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (JSON Web Tokens) + bcrypt |
| Charts | Recharts |
| Drag & Drop | @hello-pangea/dnd |
| HTTP Client | Axios |
| Routing | React Router v6 |
| Notifications | React Hot Toast |

---

## 📁 Folder Structure

```
team-task-manager/
│
├── client/                        # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/            # Sidebar, AppLayout
│   │   │   ├── projects/          # ProjectModal
│   │   │   └── tasks/             # TaskModal
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # Global auth state
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── SignupPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── ProjectsPage.jsx
│   │   │   ├── ProjectDetailPage.jsx
│   │   │   ├── TasksPage.jsx
│   │   │   ├── KanbanPage.jsx
│   │   │   └── TeamPage.jsx
│   │   ├── utils/
│   │   │   ├── api.js             # Axios instance with JWT interceptor
│   │   │   └── helpers.js         # Date formatting, colors, etc.
│   │   └── styles/
│   │       └── index.css          # Tailwind + custom classes
│   ├── index.html
│   ├── vite.config.js
│   └── tailwind.config.js
│
└── server/                        # Node.js backend
    ├── config/
    │   └── db.js                  # MongoDB connection
    ├── controllers/
    │   ├── authController.js      # Register, Login, GetMe
    │   ├── userController.js      # User CRUD
    │   ├── projectController.js   # Project CRUD + members
    │   └── taskController.js      # Task CRUD + stats
    ├── middleware/
    │   ├── authMiddleware.js      # JWT protect + role authorize
    │   └── validateMiddleware.js  # Input validation handler
    ├── models/
    │   ├── User.js                # User schema
    │   ├── Project.js             # Project schema
    │   └── Task.js                # Task schema
    ├── routes/
    │   ├── authRoutes.js
    │   ├── userRoutes.js
    │   ├── projectRoutes.js
    │   └── taskRoutes.js
    └── index.js                   # Express app entry point
```

---

## ⚡ Getting Started (Run Locally)

### What you need installed first
- [Node.js](https://nodejs.org) v18 or higher
- [MongoDB](https://www.mongodb.com) — either local install or free [MongoDB Atlas](https://cloud.mongodb.com) cluster
- A terminal / command prompt

---

### Step 1 — Clone or download the project

```bash
git clone https://github.com/yourusername/team-task-manager.git
cd team-task-manager
```

---

### Step 2 — Set up the Backend

```bash
cd server
npm install
```

Create your environment file:

```bash
cp .env.example .env
```

Open `.env` and fill in your values:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/teamtaskmanager
JWT_SECRET=write_any_long_random_string_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

> 💡 If using MongoDB Atlas, your MONGO_URI will look like:
> `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/teamtaskmanager`

Start the backend server:

```bash
npm run dev
```

You should see:
```
🚀 Server running on port 5000 in development mode
✅ MongoDB Connected: localhost
```

---

### Step 3 — Set up the Frontend

Open a **new terminal tab** and run:

```bash
cd client
npm install
npm run dev
```

You should see:
```
  VITE v4.x.x  ready in 500ms
  ➜  Local:   http://localhost:3000/
```

Open your browser and go to **http://localhost:3000**

---

### Step 4 — Create your first account

1. Click **"Create one"** on the login page
2. Fill in your name, email, password
3. Choose **Admin** role to get full access
4. You're in! 🎉

---

## 🔑 API Endpoints

### Auth
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Create new account |
| POST | `/api/auth/login` | Public | Login and get JWT |
| GET | `/api/auth/me` | Private | Get current user |

### Users
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/users` | Private | Get all users |
| GET | `/api/users/:id` | Private | Get single user |
| PUT | `/api/users/profile` | Private | Update your profile |
| DELETE | `/api/users/:id` | Admin | Delete a user |

### Projects
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/projects` | Private | Get all projects |
| POST | `/api/projects` | Admin | Create project |
| GET | `/api/projects/:id` | Private | Get single project |
| PUT | `/api/projects/:id` | Admin | Update project |
| DELETE | `/api/projects/:id` | Admin | Delete project |
| POST | `/api/projects/:id/members` | Admin | Add member |
| DELETE | `/api/projects/:id/members/:userId` | Admin | Remove member |

### Tasks
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/tasks` | Private | Get all tasks (with filters) |
| POST | `/api/tasks` | Admin | Create task |
| GET | `/api/tasks/stats` | Private | Dashboard statistics |
| GET | `/api/tasks/:id` | Private | Get single task |
| PUT | `/api/tasks/:id` | Private | Update task |
| DELETE | `/api/tasks/:id` | Admin | Delete task |

---

## 👥 Roles Explained

### Admin
- Create, edit, delete projects
- Create, assign, delete tasks
- Add/remove team members from projects
- See all projects and tasks across the whole app
- Access all API endpoints

### Member
- See only projects they are added to
- See only tasks assigned to them
- Update the **status** of their own tasks (can't edit other fields)
- Cannot create or delete anything

---

## 🗄️ Database Schema

### User
```
name        String  (required)
email       String  (unique, required)
password    String  (bcrypt hashed)
role        String  (admin | member)
createdAt   Date
```

### Project
```
name        String  (required)
description String
status      String  (active | on-hold | completed | archived)
priority    String  (low | medium | high)
color       String  (hex color for UI)
owner       → User
members     → [User]
dueDate     Date
```

### Task
```
title       String  (required)
description String
status      String  (todo | in-progress | completed)
priority    String  (low | medium | high | urgent)
project     → Project (required)
assignedTo  → User
createdBy   → User
dueDate     Date
completedAt Date    (auto-set when status = completed)
tags        [String]
```

---

## 🔐 How Authentication Works

1. User registers or logs in → backend returns a **JWT token**
2. Frontend stores the token in **localStorage**
3. Every API request automatically includes the token in the `Authorization: Bearer <token>` header (handled by Axios interceptor)
4. Backend middleware verifies the token on every protected route
5. If the token is expired or invalid → user is automatically logged out and redirected to login

---

## 🚢 Deployment

### Deploy Backend to Render

1. Push your code to GitHub
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your GitHub repo
4. Set these settings:
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Add environment variables (same as your `.env` file)
6. Click **Deploy**
7. Copy your Render URL (e.g. `https://taskflow-api.onrender.com`)

### Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) → New Project
2. Connect your GitHub repo
3. Set these settings:
   - **Root Directory:** `client`
   - **Framework:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add environment variable:
   ```
   VITE_API_URL=https://taskflow-api.onrender.com/api
   ```
5. Click **Deploy**

> ⚠️ Also update your backend's `CLIENT_URL` env variable to your Vercel URL so CORS works correctly.

---

## 🧪 Quick Test (without a frontend)

You can test the API directly using curl or Postman:

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@test.com","password":"123456","role":"admin"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"123456"}'

# Get projects (use token from login response)
curl http://localhost:5000/api/projects \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## ❓ Common Issues

**MongoDB connection error**
→ Make sure MongoDB is running locally (`mongod`) or your Atlas connection string is correct

**Port already in use**
→ Change `PORT=5000` to `PORT=5001` in your `.env`

**CORS error in browser**
→ Make sure `CLIENT_URL` in your backend `.env` matches exactly where your frontend is running

**JWT invalid error after restart**
→ Make sure `JWT_SECRET` in `.env` hasn't changed — changing it invalidates all existing tokens

**"Not authorized" on admin routes**
→ Make sure you registered with `role: "admin"` — members can't access admin endpoints

---

## 📝 Environment Variables Reference

### Server (`server/.env`)
```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

### Client (`client/.env`) — only needed for production
```env
VITE_API_URL=http://localhost:5000/api
```

---

Built with ❤️ using React, Node.js, Express, MongoDB, and JWT.
