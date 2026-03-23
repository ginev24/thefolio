# Chess Unlocked — Phase 2 (Full-Stack MERN)

Complete full-stack web application built on top of the Phase 1 React frontend.
Follows the CSAE 104 Phase 2 guide exactly.

---

## Project Structure

```
chess-unlocked-phase2/
├── backend/                     ← Express + MongoDB API server (port 5000)
│   ├── config/
│   │   └── db.js                ← MongoDB connection (Mongoose)
│   ├── middleware/
│   │   ├── auth.middleware.js   ← JWT token verification
│   │   ├── role.middleware.js   ← adminOnly / memberOrAdmin guards
│   │   └── upload.js            ← Multer image upload config
│   ├── models/
│   │   ├── User.js              ← User schema + bcrypt pre-save hook
│   │   ├── Post.js              ← Post schema
│   │   └── Comment.js           ← Comment schema
│   ├── routes/
│   │   ├── auth.routes.js       ← /api/auth/*
│   │   ├── post.routes.js       ← /api/posts/*
│   │   ├── comment.routes.js    ← /api/comments/*
│   │   └── admin.routes.js      ← /api/admin/*
│   ├── uploads/                 ← Image files saved here (auto-created)
│   ├── seedAdmin.js             ← One-time admin account creator
│   ├── .env                     ← Secret config (never commit this!)
│   ├── .gitignore
│   └── server.js                ← Main Express entry point
│
└── frontend/                    ← React CRA app (port 3000)
    ├── public/
    │   └── index.html
    └── src/
        ├── api/
        │   └── axios.js         ← Axios instance with JWT interceptor
        ├── context/
        │   └── AuthContext.js   ← Global login state (useAuth hook)
        ├── components/
        │   ├── Navbar.js        ← Auth-aware navigation bar
        │   ├── Footer.js        ← Shared footer
        │   ├── ProtectedRoute.js← Blocks unauthenticated/wrong-role access
        │   └── ChessQuiz.js     ← Interactive quiz (from Phase 1)
        ├── pages/
        │   ├── SplashPage.js    ← Loading screen → redirects to /home
        │   ├── HomePage.js      ← All published posts (fetched from API)
        │   ├── AboutPage.js     ← About + chess quiz
        │   ├── ContactPage.js   ← Contact form + resources table
        │   ├── PostPage.js      ← Single post + comments
        │   ├── LoginPage.js     ← Login form
        │   ├── RegisterPage.js  ← Registration form (hits real API)
        │   ├── ProfilePage.js   ← Edit profile + change password
        │   ├── CreatePostPage.js← Write a new post
        │   ├── EditPostPage.js  ← Edit an existing post
        │   ├── AdminPage.js     ← Admin dashboard (members + posts)
        │   └── NotFoundPage.js  ← 404 catch-all
        └── data/
            ├── quizData.js      ← Chess quiz questions
            └── resourcesData.js ← Resources table data
```

---

## Step-by-Step Setup

### Step A — Install MongoDB (if not already installed)
1. Download from https://www.mongodb.com/try/download/community
2. Run the installer — choose **Complete**, keep all defaults
3. Verify: open a terminal and run `mongosh` — you should see `test>`

### Step B — Set up the Backend

Open a terminal inside the `backend/` folder:

```bash
# 1. Install all packages
npm install

# 2. Create the admin account (run ONCE only)
node seedAdmin.js
#    Output: Admin account created successfully!
#    Email:    admin@chessunlocked.com
#    Password: Admin@1234

# 3. Delete seedAdmin.js after running it (optional but good practice)

# 4. Start the backend server
npm run dev
#    Expected output:
#    Server is running on http://localhost:5000
#    MongoDB Connected: 127.0.0.1
```

**Leave this terminal open.**

### Step C — Set up the Frontend

Open a **second** terminal inside the `frontend/` folder:

```bash
# 1. Install all packages (including axios)
npm install

# 2. Start the React app
npm start
#    Opens: http://localhost:3000
```

**Both terminals must be running at the same time.**

---

## User Roles

| Role   | What they can do |
|--------|-----------------|
| Guest  | Read all posts and comments. Register for an account. |
| Member | Login/logout. Write, edit, delete own posts. Add/delete own comments. Update profile name, bio, profile picture. Change password. |
| Admin  | Everything a member can do. Upload cover images on posts. Manage members (activate/deactivate). Remove any inappropriate post. |

---

## Admin Credentials (created by seedAdmin.js)

```
Email:    admin@chessunlocked.com
Password: Admin@1234
```

---

## API Endpoints Reference

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | /api/auth/register | Public | Register new member |
| POST | /api/auth/login | Public | Login → returns JWT |
| GET | /api/auth/me | Protected | Get current user |
| PUT | /api/auth/profile | Protected | Update name/bio/picture |
| PUT | /api/auth/change-password | Protected | Change password |
| GET | /api/posts | Public | All published posts |
| GET | /api/posts/:id | Public | Single post |
| POST | /api/posts | Member/Admin | Create post |
| PUT | /api/posts/:id | Owner/Admin | Edit post |
| DELETE | /api/posts/:id | Owner/Admin | Delete post |
| GET | /api/comments/:postId | Public | Comments for a post |
| POST | /api/comments/:postId | Member/Admin | Add comment |
| DELETE | /api/comments/:id | Owner/Admin | Delete comment |
| GET | /api/admin/users | Admin only | List all members |
| PUT | /api/admin/users/:id/status | Admin only | Toggle active/inactive |
| GET | /api/admin/posts | Admin only | All posts inc. removed |
| PUT | /api/admin/posts/:id/remove | Admin only | Mark post as removed |

---

## Daily Quick Start

Every time you sit down to work:

**Terminal 1 (backend):**
```bash
cd chess-unlocked-phase2/backend
npm run dev
```

**Terminal 2 (frontend):**
```bash
cd chess-unlocked-phase2/frontend
npm start
```

If MongoDB is not connecting on Windows:
```
Press Win key → search "Services" → find "MongoDB Server" → right-click → Start
```

---

## Adding Your Images

Place your `pics/` folder inside `frontend/public/`:
```
frontend/public/
  pics/
    hello.jpg
    hello1.jpg  ... etc.
    hello9.jpg   (logo)
    hello10.jpg  (header background)
```
