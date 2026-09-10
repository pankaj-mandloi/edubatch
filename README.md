# EduBatch - Education Batch Management Platform

A lightweight, full-stack web application for coaching institutes and small educational organizations to manage batches, students, enrollments, fees, attendance, and announcements from a single dashboard.

![Status](https://img.shields.io/badge/status-MVP-brightgreen)
![Stack](https://img.shields.io/badge/stack-MERN-emerald)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Database Setup](#-database-setup)
- [API Documentation](#-api-documentation)
- [Test Credentials](#-test-credentials)
- [Deployment](#-deployment)
- [Assumptions](#-assumptions)
- [Known Limitations](#-known-limitations)
- [Roadmap](#-roadmap)
- [License](#-license)

---

## 🎯 Overview

**EduBatch** is an MVP (Minimum Viable Product) of a batch-centric education management platform built for:

- Coaching centers (JEE/NEET/Board prep)
- Language institutes
- Coding bootcamps
- Small private schools

Unlike heavy ERP systems, EduBatch focuses on a **minimal, fast, and developer-friendly core** with multi-role access, online payments, and a clean REST API that can later power mobile apps.

### Core Value

- ✅ Centralized batch & student management
- ✅ Online fee collection with Razorpay
- ✅ Role-based dashboards (Admin, Teacher, Student)
- ✅ Attendance tracking with percentage
- ✅ Batch-wise announcements

---

## ✨ Features

### Authentication & Authorization
- JWT-based registration and login
- Role-based access control (Admin / Teacher / Student)
- Password reset via email token
- Refresh token rotation

### Batch Management
- Full CRUD operations
- Schedule (days, start/end time)
- Capacity validation
- Fee configuration
- Teacher assignment
- Status management (upcoming / active / archived)

### Student Enrollment
- Enroll students into batches
- Deactivate enrollment
- Prevent over-capacity enrollment
- Duplicate enrollment prevention
- Payment status tracking (pending/paid/failed/waived)

### Fee & Payment
- Razorpay integration (test + live ready)
- Create order → checkout → signature verification
- Auto-update payment & enrollment status
- Payment history with filters
- Email receipts (via Nodemailer)

### Attendance
- Mark attendance by teacher/admin
- Date-wise records (present/absent/late)
- Bulk actions (all present/absent)
- Student attendance percentage
- Batch-wise attendance overview

### Notices / Announcements
- Global & batch-specific notices
- Pin important notices
- Owner-based edit/delete
- Search & filter

### Dashboards
- Role-specific stat cards
- Quick action shortcuts
- Revenue tracking (admin)

### Profile Management
- Update name, phone
- Upload avatar (base64 image)
- Change password

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + Vite + Tailwind CSS |
| **Backend** | Node.js + Express |
| **Database** | MongoDB + Mongoose |
| **Auth** | JWT + bcryptjs |
| **Payments** | Razorpay |
| **Email** | Nodemailer (Gmail SMTP) |
| **Icons** | Heroicons |
| **HTTP Client** | Axios |
| **Notifications** | react-hot-toast |

---

## 📁 Project Structure

```
edubatch-project/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   └── razorpay.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Batch.js
│   │   │   ├── Enrollment.js
│   │   │   ├── Payment.js
│   │   │   ├── Attendance.js
│   │   │   └── Notice.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── roleCheck.js
│   │   │   ├── validation.js
│   │   │   └── errorHandler.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── batchController.js
│   │   │   ├── enrollmentController.js
│   │   │   ├── paymentController.js
│   │   │   ├── attendanceController.js
│   │   │   ├── noticeController.js
│   │   │   └── userController.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── batchRoutes.js
│   │   │   ├── enrollmentRoutes.js
│   │   │   ├── paymentRoutes.js
│   │   │   ├── attendanceRoutes.js
│   │   │   ├── noticeRoutes.js
│   │   │   └── userRoutes.js
│   │   ├── services/
│   │   │   └── emailService.js
│   │   └── app.js
│   ├── server.js
│   ├── .env.example
│   ├── .gitignore
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── auth/
│   │   │   ├── batches/
│   │   │   ├── enrollments/
│   │   │   ├── attendance/
│   │   │   ├── payments/
│   │   │   ├── notices/
│   │   │   └── dashboard/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── api/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env.example
│   ├── .gitignore
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── README.md
└── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ 
- **npm** or **yarn**
- **MongoDB** (local or Atlas account)
- **Razorpay** account (test keys)
- **Gmail** account (for email, with app password)

### 1. Clone the Repository

```bash
git clone https://github.com/pankaj-mandloi/edubatch.git
cd edubatch
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

Fill in the values (see [Environment Variables](#-environment-variables)).

Start the backend:

```bash
npm run dev
```

Backend runs on: `http://localhost:5000`

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
```

Create `.env` file:

```bash
cp .env.example .env
```

Start the frontend:

```bash
npm run dev
```

Frontend runs on: `http://localhost:5173`

### 4. Access the Application

Open `http://localhost:5173` in your browser.

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb://localhost:27017/edubatch
# OR MongoDB Atlas:
# MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/edubatch

# JWT
JWT_SECRET=your_jwt_secret_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_min_32_chars
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Razorpay (Test Keys)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxx

# Email (Gmail SMTP)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587

# Frontend URL
CLIENT_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000/api/v1
```

### 🔑 How to Get Keys

#### MongoDB Atlas (Free)
1. Sign up at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create M0 free cluster
3. Create database user
4. Get connection string
5. Add to `MONGO_URI`

#### Razorpay Test Keys
1. Sign up at [razorpay.com](https://razorpay.com)
2. Dashboard → Settings → API Keys
3. Generate Test Keys
4. Copy Key ID & Key Secret

#### Gmail App Password
1. Enable 2FA on your Google account
2. Go to https://myaccount.google.com/apppasswords
3. Generate app password
4. Use this as `EMAIL_PASS`

---

## 🗄 Database Setup

### Option 1: Local MongoDB

```bash
# macOS (Homebrew)
brew services start mongodb-community

# Ubuntu/Debian
sudo systemctl start mongod

# Windows (Admin PowerShell)
net start MongoDB
```

Connection string: `mongodb://localhost:27017/edubatch`

### Option 2: MongoDB Atlas (Cloud — Recommended)

1. Create free M0 cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create database user with read/write access
3. Whitelist your IP (or use `0.0.0.0/0` for testing)
4. Get connection string
5. Paste in `backend/.env` as `MONGO_URI`

### Collections Created Automatically

| Collection | Purpose |
|-----------|---------|
| `users` | Admin, Teacher, Student accounts |
| `batches` | Batch information |
| `enrollments` | Student-batch links |
| `payments` | Razorpay transactions |
| `attendances` | Daily attendance records |
| `notices` | Announcements |

### Creating the First Admin

Since admin accounts are **not** creatable via the register endpoint (security), use one of these methods:

**Method A: MongoDB Compass**
1. Register a user via frontend (role: Student)
2. Open MongoDB Compass → `edubatch` → `users`
3. Change `role: "student"` → `role: "admin"`
4. Logout → Login again

**Method B: Direct API Call** (dev only)
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@edubatch.com",
    "password": "Admin@123",
    "phone": "",
    "role": "admin"
  }'
```

---

## 📡 API Documentation

**Base URL (dev):** `http://localhost:5000/api/v1`

**Standard Response Format:**
```json
{
  "success": true | false,
  "data": { ... },
  "message": "..."
}
```

**Authentication Header:**
```
Authorization: Bearer <accessToken>
```

### 🔐 Auth Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | Public | Register new user |
| POST | `/auth/login` | Public | Login and get tokens |
| POST | `/auth/refresh` | Public | Refresh access token |
| POST | `/auth/forgot-password` | Public | Send reset email |
| POST | `/auth/reset-password` | Public | Reset password |
| GET | `/auth/me` | Private | Get current user |
| POST | `/auth/logout` | Private | Logout (clear token) |

### 📚 Batch Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/batches` | Private | List all batches |
| GET | `/batches/:id` | Private | Get single batch |
| POST | `/batches` | Admin | Create batch |
| PUT | `/batches/:id` | Admin | Update batch |
| PATCH | `/batches/:id/status` | Admin | Change status |
| DELETE | `/batches/:id` | Admin | Delete/archive |

### 📝 Enrollment Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/enrollments` | Private | List (role-filtered) |
| GET | `/enrollments/my` | Student | My enrollments |
| GET | `/enrollments/batch/:batchId` | Private | Batch enrollments |
| POST | `/enrollments` | Admin | Enroll student |
| DELETE | `/enrollments/:id` | Admin | Remove enrollment |

### 💳 Payment Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/payments/create-order` | Student | Create Razorpay order |
| POST | `/payments/verify` | Private | Verify signature |
| GET | `/payments/history` | Private | Payment history |
| GET | `/payments/:id` | Private | Single payment |
| GET | `/payments/status/:enrollmentId` | Private | Payment status |
| POST | `/payments/webhook` | Public | Razorpay webhook |

### 📅 Attendance Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/attendance` | Teacher/Admin | Mark attendance |
| GET | `/attendance/batch/:batchId` | Private | Batch records |
| GET | `/attendance/my` | Student | My attendance |
| GET | `/attendance/student/:studentId/batch/:batchId` | Teacher/Admin | Student records |

### 📢 Notice Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/notices` | Private | List notices |
| GET | `/notices/:id` | Private | Single notice |
| POST | `/notices` | Teacher/Admin | Create notice |
| PUT | `/notices/:id` | Owner | Update notice |
| DELETE | `/notices/:id` | Owner | Delete notice |

### 👤 User Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users/dashboard` | Private | Dashboard stats |
| PUT | `/users/profile` | Private | Update profile |
| PUT | `/users/change-password` | Private | Change password |
| GET | `/users` | Admin | List all users |
| GET | `/users/:id` | Admin | Single user |
| PUT | `/users/:id/role` | Admin | Change role |
| PATCH | `/users/:id/toggle-status` | Admin | Activate/deactivate |

---

## 🔑 Test Credentials

> ⚠️ **Note:** These are sample credentials. Create your own admin account using the steps in [Database Setup](#-database-setup) if you cloned this repo fresh.

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@edubatch.com` | `Admin@123` |
| **Teacher** | `teacher@edubatch.com` | `Teacher@123` |
| **Student** | `pankaj.student@edubatch.com` | `Student@123` |

### Razorpay Test Cards

| Card Network | Number | CVV | Expiry |
|-------------|--------|-----|--------|
| **Domestic Mastercard** | `5267 3181 8797 5449` | Any 3 digits | Any future date |
| **Domestic Visa** | `4111 1111 1111 1111` | Any 3 digits | Any future date |
| **Failure test card** | `4000 0000 0000 0002` | Any 3 digits | Any future date |

**UPI Test:**
- Success: `success@razorpay`
- Failure: `failure@razorpay`

---

## 🚢 Deployment

### Recommended Stack

| Component | Platform | Tier |
|-----------|----------|------|
| **Frontend** | Vercel | Free |
| **Backend** | Render / Railway | Free |
| **Database** | MongoDB Atlas | M0 Free |
| **Email** | Resend / Gmail SMTP | Free |

### Deploy Backend (Render)

1. Push code to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect GitHub repo
4. Configure:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Add environment variables (same as `.env`)
6. Deploy → Copy the live URL

### Deploy Frontend (Vercel)

1. Go to [vercel.com](https://vercel.com) → New Project
2. Import GitHub repo
3. Configure:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add env var: `VITE_API_URL=https://your-backend.onrender.com/api/v1`
5. Deploy

### Post-Deployment Checklist

- [ ] Update `CLIENT_URL` in backend to frontend live URL
- [ ] Update `VITE_API_URL` in frontend to backend live URL
- [ ] Switch Razorpay from test → live keys
- [ ] MongoDB Atlas IP whitelist configured
- [ ] HTTPS enforced on both ends
- [ ] Test end-to-end flow on production URLs

---

## 📌 Assumptions

1. **Admin creation is manual** — First admin must be created via MongoDB or direct API. Register endpoint only allows `student` and `teacher` roles to prevent privilege escalation.
2. **No file storage service** — Avatars are stored as base64 strings directly in MongoDB. For production, replace with Cloudinary / S3.
3. **Single-tenant** — Current MVP supports one institute. Multi-tenant (Phase 3).
4. **Razorpay test mode** — Live keys required for real transactions.
5. **Time zone** — Server uses UTC; date normalization is applied on attendance.
6. **Currency** — INR only (Razorpay Indian accounts).
7. **No real-time updates** — Data refreshed on page navigation or manual fetch.

---

## ⚠️ Known Limitations

| Limitation | Reason | Fix (Future) |
|-----------|--------|-------------|
| Avatar stored as base64 | No cloud storage | Use Cloudinary / S3 |
| No CSV export | Not in MVP scope | Phase 2 |
| No push notifications | Not implemented | Add web push / email digests |
| No parent/guardian role | Out of MVP scope | Phase 2 |
| No multi-language support | English only | i18n libraries |
| No rate limiting per user | Only per IP | Redis-based limiter |
| No audit log | Not implemented | Add activity logger |

---

## 🗺 Roadmap

### ✅ Phase 1 - MVP (Current)
- Auth, Batches, Enrollments, Payments, Attendance, Notices, Dashboards

### Phase 2 - Usability & Growth
- Parent / Guardian role
- CSV / PDF exports
- Batch calendar view
- In-app notifications
- Student marks / progress module

### Phase 3 - Scale & Mobile
- React Native mobile app
- Multi-institute support
- Advanced analytics
- WhatsApp / SMS reminders
- Granular permissions

---

## 🤝 Contributing

This is an MVP developed as part of a technical assignment. PRs are welcome.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'feat: add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 👨‍💻 Author

**Your Name**
- GitHub: [@Pankaj Mandloi](https://github.com/pankaj-mandloi)
- Email: mandloipankaj2000@gmail.com

---

## 🙏 Acknowledgements

- [Node.js](https://nodejs.org)
- [Express](https://expressjs.com)
- [MongoDB](https://mongodb.com)
- [React](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Razorpay](https://razorpay.com)
- [Heroicons](https://heroicons.com)

---

**Built with ❤️ for educators and students.**
