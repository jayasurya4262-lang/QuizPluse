# 🎓 QuizPulse — Online Quiz & Assessment Platform

> Enterprise-grade, full-stack assessment engine featuring authoritative server-side timing, automated grading, role-based controls, and deep analytics.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3.1-61dafb.svg?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.1.0-646CFF.svg?logo=vite)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express_4.21.2-green.svg?logo=node.js)](https://nodejs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22.0-2D3748.svg?logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/Database-Neon_PostgreSQL-336791.svg?logo=postgresql)](https://neon.tech/)
[![Vitest](https://img.shields.io/badge/Testing-Vitest_3.0.6-FCC72B.svg?logo=vitest)](https://vitest.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📑 Table of Contents

1. [📖 About the Project](#-about-the-project)
2. [✨ Key Features](#-key-features)
3. [💻 Tech Stack](#-tech-stack)
4. [📁 Project Structure](#-project-structure)
5. [📋 Prerequisites](#-prerequisites)
6. [⚙️ Installation](#-installation)
7. [🚀 Running the Application](#-running-the-application)
8. [🧠 Business Logic](#-business-logic)
9. [🖥️ Screens & API Endpoints](#️-screens--api-endpoints)
10. [🗄️ Database Design](#️-database-design)
11. [🧪 Testing](#-testing)
12. [📸 Screenshots](#-screenshots)
13. [⚠️ Limitations](#️-limitations)
14. [🔮 Future Enhancements](#-future-enhancements)
15. [🤝 Contributing](#-contributing)
16. [📄 License](#-license)
17. [👤 Author & Contact](#-author--contact)

---

## 📖 About the Project

**QuizPulse** is an enterprise-grade, full-stack online quiz and assessment engine developed directly from the requirements in Jira Project `TRIAL` (Epics TRIAL-10 to TRIAL-15, issues TRIAL-1 to TRIAL-41).

### What It Is
An interactive, web-based assessment platform that enables educators to create customized quizzes, manage questions, and analyze student performance, while offering students a timed, responsive, and cheat-resistant examination interface.

### Why It Was Built
Traditional quiz tools often suffer from client-side timing manipulation, cheating vulnerabilities, and rudimentary grading mechanisms. QuizPulse resolves these challenges by using:
- **Authoritative server-side evaluation and timing** that prevents client clock manipulation.
- **Incremental real-time answer autosaving** that prevents data loss during internet interruptions.
- **Strict sanitization** that ensures answer keys and explanations are never sent to students during active quizzes.
- **Actionable teacher analytics** including score distribution histograms and question-level difficulty analysis.

### Who It Is For
- **Educators & Teachers:** To construct rigorous tests, publish exams with automated validation, track real-time submissions, and download CSV grade reports.
- **Students & Learners:** To take timed quizzes, monitor remaining time, review detailed performance breakdowns with explanations, and track progress over time.
- **Institutions:** Looking for a modern, zero-fluff, role-protected assessment system.

---

## ✨ Key Features

### 🔐 User Management & Role-Based Access Control (TRIAL-10)
- **Role Separation:** Dedicated dashboards and permission boundaries for `STUDENT` and `TEACHER` roles.
- **Authentication:** Token-based security using JSON Web Tokens (JWT) and Bcrypt (salt rounds: 10) password hashing.
- **Demo Access:** 1-click preset login buttons on the login page for rapid evaluation of pre-seeded accounts.
- **Password Reset Flow:** Cryptographically secure reset tokens with 1-hour expiration and single-use invalidation.

### 📝 Quiz & Question Management (TRIAL-11)
- **Draft & Publish Lifecycle:** Quizzes start as `DRAFT` and cannot be published until all structural validation checks pass.
- **Question Types:**
  - **Multiple Choice Questions (MCQ):** Flexible option count with single correct answer assignment.
  - **Short Answer:** Exact or synonym matching with case-insensitive and whitespace-trimmed evaluation.
- **Configurable Marks & Timing:** Assign points per question with automatic quiz total calculation and custom durations (1–180 minutes).
- **Question Reordering:** Reorder questions dynamically via order indices.

### ⏱️ Authoritative Quiz Engine & Participation (TRIAL-12)
- **Authoritative Timer:** Quiz deadlines are calculated and stored on the server (`startedAt + duration`).
- **Low-Time Warning:** Visual pulse animation and countdown alert when under 60 seconds remain.
- **Automatic Expiration:** Submissions are automatically accepted and locked when the server deadline passes.
- **Real-Time Autosave:** Answers are saved to the database immediately upon selection or typing, with an active sync status indicator (`Saved` / `Saving...`).
- **Interactive Question Palette:** Navigation grid showing answered, current, unanswered, and flagged question states.

### 📊 Instant Evaluation & Results (TRIAL-13)
- **Instant Automatic Grading:** Immediate calculation of total marks, percentage, and pass/fail thresholds upon submission.
- **Detailed Question Review:** Post-submission review displaying student choice, correct answer, score awarded, and teacher's explanation.
- **Celebratory Confetti:** Visual feedback animation for students achieving a passing grade.

### 📈 Student Analytics & Leaderboard (TRIAL-14)
- **Attempt History:** Chronological log of all completed assessment attempts.
- **Performance Trends:** Graphical trend breakdown of scores over time.
- **Topic Mastery:** Categorized progress metrics across different subjects (e.g., Computer Science, Science, DevOps).
- **Hall of Champions Leaderboard:** Global student standings ranked by total cumulative points and average score percentage with 1st, 2nd, and 3rd place podium badges.

### 👩‍🏫 Teacher Console & Class Analytics (TRIAL-15)
- **Overview Dashboard:** Summary cards for total quizzes, active drafts, participant volume, and class average score.
- **Score Distribution Histogram:** Categorizes student performances into 4 buckets: `0-25%`, `26-50%`, `51-75%`, and `76-100%`.
- **Question-Level Difficulty Analysis:** Calculates accuracy percentage per question to identify concepts requiring review.
- **CSV Data Export:** One-click streaming download of student assessment rosters and grades formatted for spreadsheet applications.

---

## 💻 Tech Stack

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | React | `^18.3.1` | Component-based reactive user interface |
| **Language (Frontend)** | TypeScript | `^5.7.3` | Type safety and reliable component contracts |
| **Build Tool & Bundler** | Vite | `^6.1.0` | High-performance development server and bundle optimization |
| **Routing** | React Router DOM | `^6.28.2` | Single Page Application (SPA) routing with protected routes |
| **Icons** | Lucide React | `^1.16.0` | Consistent, accessible iconography |
| **Visual Effects** | Canvas Confetti | `^1.9.4` | Particle confetti animation for passing assessments |
| **Styling** | Vanilla CSS | Custom Tokens | Glassmorphic dark design system with `Outfit` & `Inter` Google Fonts |
| **Backend Runtime** | Node.js | `>= 18.0.0` | JavaScript server runtime |
| **Language (Backend)** | TypeScript | `^5.7.3` | Server-side type definitions and schema sharing |
| **Web Server Framework** | Express | `^4.21.2` | RESTful API routing, middleware pipeline, and controllers |
| **Database ORM** | Prisma | `^5.22.0` | Type-safe database client, migrations, and schema modeling |
| **Primary Database** | Neon PostgreSQL | Serverless v16 | Cloud relational database with connection pooling and SSL |
| **Local Fallback Database**| SQLite | 3.x (`dev.db`) | Zero-config offline development alternative |
| **Security & Headers** | Helmet | `^8.0.0` | Sets secure HTTP response headers |
| **Rate Limiting** | Express Rate Limit | `^7.5.0` | Prevents brute-force authentication attacks |
| **Authentication** | JSON Web Token (JWT)| `^9.0.2` | Stateless bearer token session authorization |
| **Password Hashing** | BcryptJS | `^2.4.3` | Cryptographic password hashing with 10 salt rounds |
| **Input Validation** | Zod | `^3.24.2` | Strict runtime schema parsing and error handling |
| **Testing Framework** | Vitest | `^3.0.6` | Fast unit and integration test runner |
| **API Testing** | Supertest | `^7.0.0` | HTTP assertion library for Express API testing |
| **Process Orchestration** | Concurrently | `^9.1.2` | Concurrent execution of client and server dev processes |

### Package Configuration Snippets

#### Root `package.json`
```json
{
  "name": "online-quiz-application",
  "version": "1.0.0",
  "description": "Enterprise Online Quiz Application - Jira TRIAL Epic Suite",
  "private": true,
  "scripts": {
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
    "dev:server": "npm --prefix server run dev",
    "dev:client": "npm --prefix client run dev",
    "build": "npm --prefix server run build && npm --prefix client run build",
    "test": "npm --prefix server run test",
    "seed": "npm --prefix server run seed",
    "db:push": "npm --prefix server run db:push",
    "db:generate": "npm --prefix server run db:generate",
    "postinstall": "npm --prefix server install && npm --prefix client install"
  },
  "devDependencies": {
    "concurrently": "^9.1.2"
  }
}
```

---

## 📁 Project Structure

```
online_quiz_application/
├── .gitignore                   # Git ignore specifications for node_modules, build outputs, and local env files
├── package.json                 # Monorepo root package script runner with concurrently orchestration
├── README.md                    # Comprehensive project documentation and developer guide
├── render.yaml                  # Infrastructure-as-code deployment blueprint for Render.com hosting
├── vercel.json                  # Client rewrite and deployment configuration for Vercel
├── client/                      # Frontend Single Page Application (React 18 + Vite)
│   ├── index.html               # Main HTML entry point configuring Google Fonts (Outfit, Inter) and viewport
│   ├── package.json             # Frontend client dependencies, scripts, and build tools
│   ├── tsconfig.json            # TypeScript compiler configuration for client-side application
│   ├── tsconfig.node.json       # TypeScript compiler settings for Vite config execution
│   ├── vercel.json              # Client routing rewrites for SPA history API fallback
│   ├── vite.config.ts           # Vite server configuration with API proxy forwarding to http://localhost:5000
│   ├── public/                  # Static assets served directly by the web server
│   │   └── assets/              # Static demonstration assets (hero banners, logos, trophy icons)
│   └── src/                     # Client application source code
│       ├── App.tsx              # Root router defining all public, student, and teacher routes
│       ├── index.css            # Global CSS design tokens, glassmorphism utilities, and animations
│       ├── main.tsx             # Application bootstrap file mounting App into the DOM
│       ├── api/
│       │   └── client.ts        # Typed fetch client handling JWT injection, 401 logout, and all API calls
│       ├── assets/              # Bundled image files and graphics
│       ├── components/
│       │   ├── ConfirmModal.tsx # Reusable modal dialog for critical actions (quiz submission, deletion)
│       │   ├── Footer.tsx       # Application footer with navigational links and project attribution
│       │   ├── Navbar.tsx       # Dynamic navigation bar adapting links based on user authentication and role
│       │   ├── ProtectedRoute.tsx # Route guard enforcing authenticated sessions and RBAC role boundaries
│       │   ├── QuestionPalette.tsx # Navigation grid displaying answered, current, and flagged questions
│       │   ├── StatCard.tsx     # Metric card displaying numerical stats with colored icon accents
│       │   └── Timer.tsx        # Authoritative countdown timer with warning colors and low-time pulse
│       ├── context/
│       │   └── AuthContext.tsx  # React context providing login, registration, user state, and logout
│       └── pages/
│           ├── ForgotPasswordPage.tsx # Form to request a password reset token
│           ├── LandingPage.tsx   # Public marketing page highlighting features and 1-click demo access
│           ├── LoginPage.tsx     # User login screen with 1-click pre-filled demo account buttons
│           ├── NotFoundPage.tsx  # Fallback 404 screen for unmatched routes
│           ├── RegisterPage.tsx  # Account registration page supporting Student or Teacher role toggle
│           ├── ResetPasswordPage.tsx # Password reset form accepting verification token and new password
│           ├── student/
│           │   ├── ActiveQuizPage.tsx      # Core exam screen with question presentation, autosave, and timer
│           │   ├── AttemptHistoryPage.tsx  # Tabular record of all past student quiz attempts and marks
│           │   ├── AvailableQuizzesPage.tsx# Quiz catalog with topic filter buttons and search input
│           │   ├── LeaderboardPage.tsx     # Student rankings table based on total score and accuracy
│           │   ├── QuizDetailPage.tsx      # Pre-quiz briefing showing duration, marks, rules, and start button
│           │   ├── QuizResultPage.tsx      # Comprehensive score breakdown with question explanations
│           │   ├── StudentAnalyticsPage.tsx# Student performance dashboard with score trends and topic mastery
│           │   └── StudentDashboard.tsx    # Main student home with quick metrics, recommended tests, and attempts
│           └── teacher/
│               ├── MyQuizzesPage.tsx       # Teacher quiz catalog with status filters, publish toggles, and deletion
│               ├── QuizEditorPage.tsx      # Tabbed editor for quiz settings, question authoring, and student preview
│               ├── QuizResultsPage.tsx     # Class metrics, score distribution histogram, and CSV export
│               └── TeacherDashboard.tsx    # Instructor overview with total quizzes, unique students, and recent submissions
└── server/                      # Backend REST API (Node.js + Express + TypeScript + Prisma)
    ├── .env                     # Local environment variables (Port, JWT secrets, Database URLs)
    ├── .env.example             # Template environment file showing required keys and format
    ├── package.json             # Backend server dependencies, test runners, and Prisma scripts
    ├── tsconfig.json            # TypeScript compiler configuration for server-side code
    ├── prisma/
    │   ├── dev.db               # Local SQLite database file for offline/zero-config operation
    │   ├── schema.prisma        # Primary Prisma schema configured for Neon PostgreSQL
    │   └── schema.sqlite.prisma # Mirror Prisma schema configured for SQLite datasource
    ├── scripts/
    └── use-db.js            # Node CLI utility to toggle Prisma datasource between PostgreSQL and SQLite
    └── src/
        ├── db.ts                # PrismaClient singleton instance with production/test logging rules
        ├── index.ts             # Express app setup, Helmet, CORS, Rate Limiters, routes, and error handling
        ├── middleware/
        │   ├── auth.ts          # Express middleware for JWT authentication, role enforcement, and optional auth
        │   └── validate.ts      # Zod schema validation middleware returning structured 400 error arrays
        ├── routes/
        │   ├── analytics.routes.ts # Routes for student trends, leaderboard, teacher overview, and CSV export
        │   ├── attempt.routes.ts   # Routes for starting attempts, saving answers, and authoritative submission
        │   ├── auth.routes.ts      # Routes for student/teacher registration, login, logout, and password resets
        │   ├── question.routes.ts  # Routes for adding, updating, deleting, and reordering quiz questions
        │   ├── quiz.routes.ts      # Routes for quiz CRUD, filtering, student sanitization, and publish validation
        │   └── result.routes.ts    # Routes for retrieving detailed evaluated attempt results with explanations
        ├── seed/
        │   └── seed.ts          # Comprehensive seed script populating accounts, 4 quizzes, questions, and attempts
        ├── services/
        │   └── evaluation.service.ts # Core grading engine calculating points, percentages, and pass thresholds
        └── tests/
            ├── auth.test.ts     # Integration tests for student/teacher registration, login, and RBAC security
            ├── evaluation.test.ts# Unit tests for scoring math, partial answers, and case-insensitive matching
            └── quiz.test.ts     # Integration tests for quiz authoring, publish validation, and data sanitization
```

---

## 📋 Prerequisites

Before setting up QuizPulse, ensure you have the following installed on your operating system:

1. **Node.js**: Version `18.18.0` or higher (Node 20+ recommended).
   - Check version: `node -v`
2. **npm**: Version `9.0.0` or higher.
   - Check version: `npm -v`
3. **Git**: Version control system.
   - Check version: `git --version`
4. **Database Access**:
   - **Option A (Default):** Internet access to connect to the Neon Serverless PostgreSQL instance specified in `.env`.
   - **Option B (Offline):** Local SQLite mode using the included `use-db.js` switcher (no external database installation required).

---

## ⚙️ Installation

Follow these step-by-step instructions to set up the project from scratch.

> [!WARNING]
> **Security Notice:** Never commit actual `.env` files containing production database credentials or real secret keys to public repositories. Always use strong, randomly generated secrets in production environments.

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/online-quiz-application.git
cd online-quiz-application
```

### Step 2: Install All Dependencies
The project uses a monorepo structure. You can install all dependencies across the root, server, and client with a single command:
```bash
npm install
```

*(Alternatively, you can install dependencies manually in each directory:)*
```bash
npm --prefix server install
npm --prefix client install
```

### Step 3: Configure Environment Variables
Navigate to the `server/` directory and check the `.env` file. If not present, copy from `.env.example`:
```bash
cp server/.env.example server/.env
```

Ensure `server/.env` contains the required keys:
```env
# Server Port
PORT=5000

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRES_IN=7d

# Database Connection (Neon PostgreSQL in Production, SQLite file:./dev.db in local mode)
DATABASE_URL="postgresql://neondb_owner:your_password@ep-your-database-pooler.region.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
DIRECT_URL="postgresql://neondb_owner:your_password@ep-your-database.region.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# Client URL for CORS
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

*(Optional: To run in 100% offline mode with local SQLite, run: `npm --prefix server run db:push:sqlite`)*

### Step 4: Synchronize the Database Schema
Push the Prisma schema to create the tables in your database:
```bash
npm --prefix server run db:push
```

Generate the Prisma Client:
```bash
npm --prefix server run db:generate
```

### Step 5: Seed Demo Accounts & Assessments
Run the seed script to populate demo users, realistic quizzes, questions, and evaluation attempts:
```bash
npm --prefix server run seed
```

---

## 🚀 Running the Application

### Method 1: Run Both Client and Server Concurrently (Recommended)
From the project root:
```bash
npm run dev
```

This starts:
- **Backend API Server:** `http://localhost:5000`
- **Frontend Client Application:** `http://localhost:5173`
- **Health Check Endpoint:** `http://localhost:5000/api/health`

### Method 2: Run Separately in Individual Terminals

**Terminal 1 (Backend Server):**
```bash
npm --prefix server run dev
```

**Terminal 2 (Frontend Client):**
```bash
npm --prefix client run dev
```

---

## 🔑 Demo Accounts & Credentials

The database is pre-seeded with accounts for testing both teacher and student workflows. All demo accounts share the password: `Password123!`

| Role | Name | Email | Default Dashboard |
| :--- | :--- | :--- | :--- |
| 👩‍🏫 **Teacher** | Dr. Eleanor Vance | `teacher@quizpulse.com` | `/teacher/dashboard` |
| 👨‍🎓 **Student 1** | Alex Chen | `student1@quizpulse.com` | `/student/dashboard` |
| 👩‍🎓 **Student 2** | Sarah Miller | `student2@quizpulse.com` | `/student/dashboard` |
| 👨‍🎓 **Student 3** | David Kumar | `student3@quizpulse.com` | `/student/dashboard` |

> 💡 **Tip:** The Login Page (`/login`) includes **1-Click Demo Login** buttons that automatically authenticate as Dr. Vance, Alex Chen, or Sarah Miller without typing.

---

## 🧠 Business Logic

QuizPulse enforces strict server-authoritative business rules to ensure assessment validity:

### 1. Scoring & Evaluation Rules
- **Multiple Choice Questions (`MCQ`):**
  - Evaluated by comparing `selectedOptionId` against the option where `isCorrect === true`.
  - Full question marks (`q.marks`) awarded on exact match; `0` marks awarded otherwise.
- **Short Answer Questions (`SHORT_ANSWER`):**
  - Evaluated by trimming and lowercasing the student response.
  - Compared against the expected answer key, which supports multiple valid synonyms separated by semicolons (`;`) or pipes (`|`) (e.g., `JWT;JSON Web Token;jwt`).
  - Full question marks awarded on match; `0` marks awarded otherwise.
- **Unanswered Questions:**
  - Questions with no selection or empty text receive `0` marks and are incremented in `unansweredCount`.
- **Percentage Calculation:**
  $$\text{Percentage} = \text{round}\left(\frac{\text{Score Earned}}{\text{Total Quiz Marks}} \times 100, 1\right)$$
- **Pass / Fail Determination:**
  - If `passingScore` is defined on the quiz, `passed = (percentage >= passingScore)`.
  - If `passingScore` is `null`, `passed = null` (evaluated without pass/fail classification).

### 2. Quiz Session & Timing Rules
- **Authoritative Deadline:**
  $$\text{Deadline} = \text{startedAt} + (\text{durationMinutes} \times 60 \times 1000)$$
- **Session Continuity:** If a student attempts to restart a quiz while an attempt is already `IN_PROGRESS` and within deadline, the server returns the existing attempt, preserving previously saved answers.
- **Grace Period:** A 10-second server grace period allows network latency during final answer autosaves. Once `Date.now() > deadline + 10000`, answer saving is rejected.
- **Submission Immutability:** Once an attempt status transitions to `SUBMITTED`, answers are locked permanently and cannot be modified or re-submitted.

### 3. Quiz Publishing Validation Checks (TRIAL-26)
Before a quiz status can transition from `DRAFT` to `PUBLISHED`, the backend executes these strict validation rules:
1. **Title:** Must be non-empty and at least 3 characters.
2. **Duration:** Must be greater than 0 minutes (maximum 180 minutes).
3. **Question Count:** Must contain at least 1 question.
4. **Question Content:** Every question must have non-empty prompt text.
5. **Question Marks:** Every question must have assigned marks $\ge 1$.
6. **MCQ Constraints:**
   - Must contain at least 2 options.
   - Must have **exactly one** option designated as correct (`isCorrect === true`).
7. **Short Answer Constraints:** Must contain a non-empty `expectedAnswer` key string.

### 4. Public Student Data Sanitization (Anti-Cheat)
When students or unauthenticated users request quiz details via `GET /api/quizzes/:id`:
- Correct answer flags (`isCorrect`) are removed from all options.
- Teacher explanations (`explanation`) and expected answer strings (`expectedAnswer`) are completely omitted from the JSON payload.
- Explanations and answer keys are only delivered after the attempt is submitted via `GET /api/results/:attemptId`.

---

## 🖥️ Screens & API Endpoints

### Frontend Application Routes

| Path | Screen / Page | Role Access | Purpose |
| :--- | :--- | :--- | :--- |
| `/` | `LandingPage` | Public | Hero showcase, technology badges, and 1-click demo entry |
| `/login` | `LoginPage` | Public | Authentication screen with 1-click demo accounts |
| `/register` | `RegisterPage` | Public | Self-service registration with Student / Teacher role toggle |
| `/forgot-password` | `ForgotPasswordPage` | Public | Request a password reset token |
| `/reset-password` | `ResetPasswordPage` | Public | Reset password using verified token |
| `/quizzes` | `AvailableQuizzesPage` | Public / All | Browse published quizzes with topic filters and search |
| `/quizzes/:id` | `QuizDetailPage` | Public / All | Pre-assessment brief with duration, marks, and instructions |
| `/leaderboard` | `LeaderboardPage` | Public / All | Global rankings table based on total points and accuracy |
| `/student/dashboard` | `StudentDashboard` | `STUDENT` | Student home with metrics, recommended tests, and attempts |
| `/student/attempts` | `AttemptHistoryPage` | `STUDENT` | History of all submitted attempts with scores and timestamps |
| `/student/analytics` | `StudentAnalyticsPage` | `STUDENT` | Graphical score progression and topic mastery breakdown |
| `/quiz/:quizId/attempt/:attemptId` | `ActiveQuizPage` | `STUDENT` | Timed exam interface with question palette and autosave |
| `/results/:attemptId` | `QuizResultPage` | Student / Teacher Owner | Comprehensive review with explanations and celebratory confetti |
| `/teacher/dashboard` | `TeacherDashboard` | `TEACHER` | Educator overview with quiz counts, students, and submissions |
| `/teacher/quizzes` | `MyQuizzesPage` | `TEACHER` | Quiz management catalog with publish toggles and delete dialogs |
| `/teacher/quizzes/create` | `QuizEditorPage` | `TEACHER` | Create new quiz with duration and passing threshold |
| `/teacher/quizzes/:id/edit` | `QuizEditorPage` | `TEACHER` | Question builder modal, reordering, and student preview |
| `/teacher/quizzes/:id/results` | `QuizResultsPage` | `TEACHER` | Score distribution histogram, difficulty analysis, and CSV export |
| `*` | `NotFoundPage` | Public | 404 error page for unmatched URL routes |

### Backend REST API Endpoints

| Method | Endpoint | Auth / Role | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | API health check and database status |
| `POST` | `/api/auth/register-student` | Public | Register a new user with `STUDENT` role |
| `POST` | `/api/auth/register-teacher` | Public | Register a new user with `TEACHER` role |
| `POST` | `/api/auth/login` | Public | Authenticate user and return JWT bearer token |
| `POST` | `/api/auth/logout` | Public | Invalidate client session token |
| `POST` | `/api/auth/forgot-password` | Public | Generate a secure 1-hour password reset token |
| `POST` | `/api/auth/reset-password` | Public | Reset password using valid reset token |
| `GET` | `/api/auth/me` | Authenticated | Retrieve authenticated user profile |
| `GET` | `/api/quizzes` | Optional Auth | List published quizzes (or teacher's own with `?myQuizzes=true`) |
| `GET` | `/api/quizzes/:id` | Optional Auth | Retrieve quiz details (sanitizes answer keys for students) |
| `POST` | `/api/quizzes` | `TEACHER` | Create a new quiz in `DRAFT` status |
| `PUT` | `/api/quizzes/:id` | `TEACHER` (Owner) | Update quiz settings (title, duration, passing score) |
| `POST` | `/api/quizzes/:id/publish` | `TEACHER` (Owner) | Validate questions and transition status to `PUBLISHED` |
| `POST` | `/api/quizzes/:id/unpublish` | `TEACHER` (Owner) | Revert quiz status to `DRAFT` |
| `DELETE`| `/api/quizzes/:id` | `TEACHER` (Owner) | Permanently delete quiz and cascade associated questions |
| `POST` | `/api/quizzes/:quizId/questions` | `TEACHER` (Owner) | Add MCQ or Short Answer question with marks |
| `PUT` | `/api/quizzes/:quizId/questions/:qId` | `TEACHER` (Owner) | Edit question text, marks, options, or explanation |
| `DELETE`| `/api/quizzes/:quizId/questions/:qId` | `TEACHER` (Owner) | Delete individual question from quiz |
| `POST` | `/api/quizzes/:quizId/questions/reorder` | `TEACHER` (Owner) | Reorder question sequence indices |
| `POST` | `/api/attempts/start` | `STUDENT` | Start new attempt or resume active in-progress session |
| `GET` | `/api/attempts/:attemptId` | `STUDENT` (Owner) | Get current attempt status, remaining time, and questions |
| `POST` | `/api/attempts/:attemptId/save-answer` | `STUDENT` (Owner) | Incremental autosave for MCQ option or text answer |
| `POST` | `/api/attempts/:attemptId/submit` | `STUDENT` (Owner) | Lock attempt, evaluate answers, and compute score |
| `GET` | `/api/results/:attemptId` | Student / Teacher Owner | Retrieve full evaluation breakdown with explanations |
| `GET` | `/api/analytics/student/attempts` | `STUDENT` | Retrieve history of completed attempts for logged-in student |
| `GET` | `/api/analytics/student/overview` | `STUDENT` | Performance statistics, score trends, and topic mastery |
| `GET` | `/api/analytics/leaderboard` | Public | Global student leaderboard ranked by total score and average |
| `GET` | `/api/analytics/teacher/overview` | `TEACHER` | Instructor overview with student volume and class averages |
| `GET` | `/api/analytics/teacher/quiz/:quizId` | `TEACHER` (Owner) | Detailed quiz analytics, score distribution, and question accuracy |
| `GET` | `/api/analytics/teacher/quiz/:quizId/export-csv` | `TEACHER` (Owner) | Stream and download participant results in CSV format |

---

## 🗄️ Database Design

The database schema is defined in [server/prisma/schema.prisma](file:///e:/online_quiz_application/server/prisma/schema.prisma) and supports PostgreSQL and SQLite.

### Entity Relationship Diagram

```
+--------------------------------------------------------------+
|                             User                             |
+--------------------------------------------------------------+
| id          : String (UUID, PK)                              |
| email       : String (Unique)                                |
| password    : String (Bcrypt Hash)                           |
| name        : String                                         |
| role        : String ("STUDENT" | "TEACHER")                 |
| avatarUrl   : String?                                        |
| createdAt   : DateTime                                       |
| updatedAt   : DateTime                                       |
+--------------------------------------------------------------+
       | 1                           | 1                 | 1
       | creates                     | attempts          | requests
       | N                           | N                 | N
       v                             v                   v
+------------------------+   +-------------------+   +-------------------------+
|          Quiz          |   |    QuizAttempt    |   |   PasswordResetToken    |
+------------------------+   +-------------------+   +-------------------------+
| id             : String|   | id          : UUID|   | id        : String (PK) |
| title          : String|   | quizId      : FK  |   | token     : String (Unq)|
| description    : String|   | studentId   : FK  |   | userId    : FK -> User  |
| topic          : String|   | status      : Text|   | expiresAt : DateTime    |
| durationMinutes: Int   |   | startedAt   : Time|   | used      : Boolean     |
| passingScore   : Int?  |   | deadline    : Time|   | createdAt : DateTime    |
| status         : String|   | submittedAt : Time|   +-------------------------+
| shuffleQuest.  : Bool  |   | score       : Flt |
| teacherId      : FK    |   | totalMarks  : Flt |
| createdAt      : Time  |   | percentage  : Flt |
| updatedAt      : Time  |   | passed      : Bool|
+------------------------+   | correctCount: Int |
       | 1                   | incorrCount : Int |
       | contains            | unansCount  : Int |
       v N                   +-------------------+
+------------------------+             | 1
|        Question        |             | records
+------------------------+             v N
| id            : UUID   |   +-------------------+
| quizId        : FK     |   |   AttemptAnswer   |
| type          : String |   +-------------------+
| text          : String |   | id          : UUID|
| orderIndex    : Int    |   | attemptId   : FK  |
| marks         : Int    |   | questionId  : FK  |
| explanation   : String?|   | selectOptId : Str?|
| expectedAnswer: String?|   | textAnswer  : Str?|
+------------------------+   | isCorrect   : Bool|
       | 1           | 1     | marksAwarded: Flt |
       | has         | holds | savedAt     : Time|
       v N           +------>+-------------------+
+------------------------+   Unique: [attemptId, questionId]
|     QuestionOption     |
+------------------------+
| id         : UUID (PK) |
| questionId : FK        |
| text       : String    |
| isCorrect  : Boolean   |
| orderIndex : Int       |
+------------------------+
```

### Table Definitions & Constraints

1. **`User`**
   - Stores user profiles with distinct roles (`STUDENT` or `TEACHER`).
   - Unique index on `email`.
2. **`PasswordResetToken`**
   - Manages temporary password recovery tokens.
   - Unique index on `token`. Cascades on user deletion.
3. **`Quiz`**
   - Core assessment record owned by a teacher (`teacherId`).
   - `status`: `DRAFT`, `PUBLISHED`, or `ARCHIVED`.
   - Indexed on `[teacherId]` and `[status]`.
4. **`Question`**
   - Questions belonging to a quiz.
   - `type`: `MCQ` (Multiple Choice) or `SHORT_ANSWER`.
   - `marks`: Numerical points awarded for a correct answer.
   - Indexed on `[quizId]`.
5. **`QuestionOption`**
   - Choice options for MCQ questions.
   - `isCorrect`: Boolean designating the answer key.
   - Indexed on `[questionId]`.
6. **`QuizAttempt`**
   - Individual student test session tracking start time, server deadline, and submission time.
   - Stores computed outcome: `score`, `totalMarks`, `percentage`, `passed`, `correctCount`, `incorrectCount`, `unansweredCount`.
   - `status`: `IN_PROGRESS`, `SUBMITTED`, or `EXPIRED`.
   - Indexed on `[quizId]` and `[studentId]`.
7. **`AttemptAnswer`**
   - Student response per question within an attempt.
   - Unique compound constraint `@@unique([attemptId, questionId])` ensuring one recorded answer per question per attempt.

---

## 🧪 Testing

The platform includes an automated testing suite implemented using **Vitest** and **Supertest**.

### Running Tests
Execute the test suite from the server directory or root:
```bash
# From root
npm test

# Or directly in server directory
npm --prefix server run test
```

### Test Coverage Table

| Test Suite File | Test Case | Jira Key | Expected Outcome |
| :--- | :--- | :--- | :--- |
| `server/src/tests/auth.test.ts` | registers a student with STUDENT role | TRIAL-16 | HTTP 201, user object returned with role `STUDENT`, JWT defined |
| `server/src/tests/auth.test.ts` | registers a teacher with TEACHER role | TRIAL-17 | HTTP 201, user object returned with role `TEACHER`, JWT defined |
| `server/src/tests/auth.test.ts` | rejects registration with duplicate email | TRIAL-16 | HTTP 409 Conflict, `success: false` |
| `server/src/tests/auth.test.ts` | authenticates valid credentials and rejects invalid password | TRIAL-1, 18 | HTTP 200 with valid JWT; HTTP 401 with wrong password |
| `server/src/tests/auth.test.ts` | enforces RBAC: prevents student from creating a quiz | TRIAL-20 | HTTP 403 Forbidden, `success: false` |
| `server/src/tests/evaluation.test.ts` | evaluates all correct answers and calculates percentage and pass threshold | TRIAL-33, 34 | Score 6/6, 100%, `passed: true`, 0 incorrect, 0 unanswered |
| `server/src/tests/evaluation.test.ts` | handles partial correctness, case-insensitive trimmed short answers, and failure threshold | TRIAL-33, 35 | Score 3/6, 50%, `passed: false` (against 70% threshold), 1 unanswered |
| `server/src/tests/evaluation.test.ts` | handles completely unanswered attempt | TRIAL-33, 34 | Score 0/6, 0%, `passed: false`, 3 unanswered count |
| `server/src/tests/quiz.test.ts` | authenticates seed teacher | TRIAL-18 | HTTP 200, role `TEACHER`, returns valid authorization token |
| `server/src/tests/quiz.test.ts` | allows teacher to create a DRAFT quiz | TRIAL-21 | HTTP 201 Created, quiz status is `DRAFT` |
| `server/src/tests/quiz.test.ts` | rejects publishing a quiz with no questions | TRIAL-26 | HTTP 400 Bad Request, errors array notes "at least 1 question" |
| `server/src/tests/quiz.test.ts` | adds questions with marks and validates total marks | TRIAL-22, 24 | HTTP 201 Created, question marks equal 5 |
| `server/src/tests/quiz.test.ts` | successfully publishes quiz once questions are valid | TRIAL-26 | HTTP 200 OK, quiz status transitions to `PUBLISHED` |
| `server/src/tests/quiz.test.ts` | does NOT leak isCorrect or explanation in public student view | TRIAL-27 | HTTP 200, `explanation` is undefined, `opt.isCorrect` is undefined |

---

## 📸 Screenshots

*(Placeholder section — add production UI screenshots here)*

| Landing Page | Student Active Quiz |
| :---: | :---: |
| ![Landing Page Placeholder](https://via.placeholder.com/600x350/111827/ffffff?text=QuizPulse+Landing+Page) | ![Active Quiz Screen](https://via.placeholder.com/600x350/111827/ffffff?text=Active+Quiz+Exam+Screen) |

| Teacher Analytics & Histogram | Detailed Student Review |
| :---: | :---: |
| ![Teacher Analytics](https://via.placeholder.com/600x350/111827/ffffff?text=Teacher+Analytics+%26+Histogram) | ![Results Review](https://via.placeholder.com/600x350/111827/ffffff?text=Question+Review+%26+Explanations) |

---

## ⚠️ Limitations

Based directly on code inspection, the application currently has the following known constraints:
1. **Password Reset Email Delivery:** The `/api/auth/forgot-password` endpoint generates and saves a secure token in the database, but does not connect to an external SMTP server (e.g., SendGrid, AWS SES) to send an email; the token is returned in the API response for testing.
2. **Single Active Attempt Constraint:** A student cannot initiate a second concurrent attempt on the same quiz while an existing attempt has status `IN_PROGRESS`.
3. **Super-Admin Role:** User roles are strictly partitioned into `STUDENT` and `TEACHER`. A dedicated super-admin user role (`ADMIN`) for global system user moderation is not present in the database schema.
4. **Question Formats:** The question engine is optimized for Multiple Choice (`MCQ`) and Short Answer (`SHORT_ANSWER`). File attachment submissions, rich media questions, multi-select checkboxes (multiple correct answers), and free-text long essays requiring manual teacher grading are not implemented.

---

## 🔮 Future Enhancements

- [ ] **Email Provider Integration:** Connect Nodemailer or SendGrid to transmit password reset links.
- [ ] **Multi-Select Checkboxes:** Support question types with multiple correct options and partial credit.
- [ ] **Long Essay Grading Console:** Manual grading interface allowing teachers to score open-ended written responses.
- [ ] **Media Question Attachments:** Support image and code snippet attachments in question prompts.
- [ ] **Real-time Proctoring Alerts:** Webhook or WebSocket alerts if a student switches tabs or loses browser focus during an active quiz attempt.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create your feature branch:
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add AmazingFeature"
   ```
4. Push to the branch:
   ```bash
   git push origin feature/AmazingFeature
   ```
5. Open a Pull Request.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👤 Author & Contact

- **Author:** [Your Name]
- **Email:** [Your Email]
- **GitHub:** [[GitHub link](https://github.com)]
- **Project Link:** [https://github.com/your-username/online-quiz-application](https://github.com/your-username/online-quiz-application)
