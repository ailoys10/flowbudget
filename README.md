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

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login user |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Logout user |

### Transactions (🔒 JWT Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/transactions` | List all transactions |
| GET | `/transactions/:id` | Get single transaction |
| POST | `/transactions` | Create transaction |
| PUT | `/transactions/:id` | Update transaction |
| DELETE | `/transactions/:id` | Delete transaction |

Query params for GET `/transactions`: `?type=income`, `?search=groceries`, `?dateFrom=2025-01-01`, `?dateTo=2025-12-31`

### Analytics (🔒 JWT Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/overview/summary` | Total income, expense, balance |
| GET | `/overview/expenses-last-7-days` | Daily expenses for last 7 days |
| GET | `/overview/balance-history` | Cumulative balance trend |

---

## Request / Response Format

### POST /auth/register
**Request:**
```json
{
  "name": "Budi Santoso",
  "email": "budi@example.com",
  "password": "secret123"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": { "id": "...", "name": "Budi Santoso", "email": "budi@example.com" },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

### POST /transactions
**Headers:** `Authorization: Bearer <accessToken>`
**Request:**
```json
{
  "title": "Monthly Salary",
  "amount": 5000000,
  "type": "income",
  "category": "Salary",
  "date": "2025-03-01"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Transaction created successfully",
  "data": {
    "id": "uuid-...",
    "user_id": "...",
    "title": "Monthly Salary",
    "amount": 5000000,
    "type": "income",
    "category": "Salary",
    "date": "2025-03-01",
    "created_at": "..."
  }
}
```

---

## Features & Best Practices
- ✅ JWT Access Token + Refresh Token rotation
- ✅ Password hashing with bcryptjs (salt rounds: 12)
- ✅ Input validation with express-validator
- ✅ Proper HTTP status codes (200, 201, 400, 401, 403, 404, 409, 500)
- ✅ Consistent JSON response format `{ success, message, data }`
- ✅ User-scoped data (users only see their own transactions)
- ✅ CORS configured
- ✅ SQLite WAL mode + foreign keys
- ✅ Frontend auto-refreshes tokens on 401 TOKEN_EXPIRED
- ✅ SPA routing with auth guards
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Charts: bar chart (7-day expenses) + line chart (balance history)

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
