# TaskFlow – Task Management System

A beginner-friendly full-stack project with three separate apps:

| Folder      | What it is                         | Tech                                   | URL                     |
| ----------- | ---------------------------------- | -------------------------------------- | ----------------------- |
| `backend/`  | REST API, auth, database           | Node.js, Express 5, Prisma, PostgreSQL | http://localhost:5000   |
| `frontend/` | User website (manage your tasks)   | React, Vite, Tailwind CSS              | http://localhost:5173   |
| `admin/`    | Admin website (manage everything)  | React, Vite, Tailwind CSS              | http://localhost:5174   |

## Features

**User website** – register, log in, dashboard with task statistics, create / view / edit / delete tasks, mark tasks pending or completed, filter and search, log out.

**Admin website** – separate admin login, dashboard with statistic cards and recent activity, list all users (with task counts), delete users (their tasks are deleted too), list all tasks, delete tasks, log out. Sidebar layout that collapses into a menu on small screens.

**Backend** – Express REST API, JWT authentication, bcrypt password hashing, role-based access control (`USER` / `ADMIN`), Prisma ORM with PostgreSQL.

## Prerequisites

- Node.js 20.19 or newer (`node -v`)
- PostgreSQL running locally (default port 5432) and the password for its `postgres` user

## 1. Configure the backend

```bash
cd backend
cp .env.example .env
```

Open `backend/.env` and set:

- `DATABASE_URL` – replace `your_password` with your PostgreSQL password. The `taskmanagement` database is created automatically by the migration.
- `JWT_SECRET` – any long random string. You can generate one with:
  `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
- `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` – the initial admin account (see step 3).

## 2. Install dependencies

Run once in each folder:

```bash
cd backend && npm install
cd ../frontend && npm install
cd ../admin && npm install
```

## 3. Set up the database

From the `backend` folder:

```bash
npx prisma migrate dev --name init   # creates the database + User and Task tables
npm run seed                         # creates the initial admin account
```

- `prisma/schema.prisma` defines the tables. If you change it, run `npx prisma migrate dev --name describe_your_change`.
- On a production server use `npx prisma migrate deploy` instead of `migrate dev`.
- `npx prisma studio` opens a browser UI to look at the data.

### Initial admin account

`npm run seed` creates (or resets) an admin using `ADMIN_NAME`, `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `backend/.env`. Set your own strong `ADMIN_PASSWORD` in `backend/.env` **before** running the seed, then log in to the admin website with that email and password. Re-run `npm run seed` any time to reset the admin password.

Admins can only log in on the admin website, and normal users only on the user website.

## 4. Run the three apps

Open three terminals:

```bash
# Terminal 1 – API
cd backend
npm run dev
```

```bash
# Terminal 2 – user website
cd frontend
npm run dev
```

```bash
# Terminal 3 – admin website
cd admin
npm run dev
```

Then open http://localhost:5173 (users) and http://localhost:5174 (admin).

The two React apps call the API at `http://localhost:5000/api` by default. To change it, copy `.env.example` to `.env` in `frontend/` or `admin/` and edit `VITE_API_URL`. If you change the ports of the websites, also update `CLIENT_URLS` in `backend/.env` (used for CORS).

### Production build

```bash
cd frontend && npm run build   # output in frontend/dist
cd admin && npm run build      # output in admin/dist
cd backend && npm start
```

## API reference

All protected routes need the header `Authorization: Bearer <token>`.

| Method | Route                     | Access | Description                              |
| ------ | ------------------------- | ------ | ---------------------------------------- |
| GET    | `/api/health`             | Public | Health check                             |
| POST   | `/api/auth/register`      | Public | Create a user `{ name, email, password }` |
| POST   | `/api/auth/login`         | Public | User login `{ email, password }`         |
| POST   | `/api/auth/admin/login`   | Public | Admin login `{ email, password }`        |
| GET    | `/api/auth/me`            | Any    | Current logged-in account                |
| GET    | `/api/tasks?status=`      | USER   | Your tasks (optional `PENDING`/`COMPLETED`) |
| GET    | `/api/tasks/:id`          | USER   | One of your tasks                        |
| POST   | `/api/tasks`              | USER   | Create `{ title, description?, status? }` |
| PUT    | `/api/tasks/:id`          | USER   | Update any of `title, description, status` |
| DELETE | `/api/tasks/:id`          | USER   | Delete your task                         |
| GET    | `/api/admin/stats`        | ADMIN  | Dashboard numbers + recent users/tasks   |
| GET    | `/api/admin/users`        | ADMIN  | All users with task counts               |
| DELETE | `/api/admin/users/:id`    | ADMIN  | Delete a user and their tasks            |
| GET    | `/api/admin/tasks`        | ADMIN  | All tasks with owner                     |
| DELETE | `/api/admin/tasks/:id`    | ADMIN  | Delete any task                          |

## Project structure

```
taskmanagement/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma     # User + Task models, Role and TaskStatus enums
│   │   ├── migrations/       # created by `prisma migrate dev`
│   │   └── seed.js           # creates the initial admin
│   └── src/
│       ├── index.js          # Express app setup
│       ├── lib/              # Prisma client, JWT helpers
│       ├── middleware/auth.js# authenticate + authorize(role)
│       └── routes/           # auth.js, tasks.js, admin.js
├── frontend/src/
│   ├── api.js                # fetch wrapper (adds the JWT)
│   ├── context/AuthContext.jsx
│   ├── components/           # Navbar, TaskFormModal, ProtectedRoute …
│   └── pages/                # Login, Register, Dashboard
└── admin/src/
    ├── api.js
    ├── context/AuthContext.jsx
    ├── components/           # AdminLayout (sidebar), PageHeader, StatusBadge
    └── pages/                # Login, Dashboard, Users, Tasks
```

## Troubleshooting

- **`P1000: Authentication failed`** – the password in `DATABASE_URL` is wrong.
- **`Cannot reach the server`** in the browser – the backend isn't running on port 5000.
- **CORS error** – the website's URL is missing from `CLIENT_URLS` in `backend/.env`.
- **Port already in use** – stop the other program or change the port in `vite.config.js` / `PORT`.
