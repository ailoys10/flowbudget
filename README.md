# FlowBudget 💸
> Modern Personal Finance Tracker — Full-Stack App (UTS KP70064006)

## Tech Stack
- **Backend:** Node.js + Express + SQLite (better-sqlite3)
- **Frontend:** Vanilla HTML + CSS + JavaScript (SPA)
- **Auth:** JWT (access token 15m + refresh token 7d with rotation)

## Quick Start

### 1. Install & Run Backend
```bash
cd backend
npm install
node src/app.js
```
Server starts at **http://localhost:3001**

### 2. Open Frontend
Visit **http://localhost:3001** in your browser (frontend is served by Express as static files).

---

## Project Structure
```
flowbudget/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   └── transactionController.js
│   │   ├── middleware/
│   │   │   └── auth.js          # JWT middleware
│   │   ├── models/
│   │   │   └── database.js      # SQLite setup
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── transactions.js
│   │   │   └── overview.js
│   │   ├── services/
│   │   │   ├── authService.js
│   │   │   └── transactionService.js
│   │   └── app.js               # Express entry point
│   ├── .env
│   └── package.json
└── frontend/
    ├── components/
    │   ├── sidebar.js
    │   └── utils.js
    ├── pages/
    │   ├── index.html           # SPA entry
    │   ├── login.js
    │   ├── register.js
    │   ├── dashboard.js
    │   ├── transactions.js
    │   └── transaction-form.js  # Add & Edit
    ├── services/
    │   ├── api.js               # API client
    │   └── router.js            # SPA router
    └── styles/
        └── main.css
```
