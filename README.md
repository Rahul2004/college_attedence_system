# College Attendance Management System (AttendOS)

A modern, secure, full-stack College Attendance Management System built with **React**, **Vite**, **TailwindCSS**, and **Supabase**.

---

## Features

- **Multi-Role Portals**: Dedicated, role-isolated portals for **Students**, **Faculty/Teachers**, and **Administrators**.
- **Real-Time Attendance Sync**: Live classroom attendance tracking, roll-call rosters, and quick-grid matrix.
- **Attendance Shortage & Deficit Engine**: Automated calculation of attendance percentages, 75% statutory compliance, and deficit recovery requirements.
- **Leave & Exemption Management**: Online student leave applications with medical document uploads, faculty approvals, and real-time status updates.
- **Attendance Disputes Flow**: Built-in resolution mechanism for biometric sensor failures and attendance discrepancies.
- **Institutional Analytics & Reports**: Department-wise, semester-wise, and subject-wise attendance analytics and audit logging.
- **Security & RBAC**: Row-Level Security (RLS) enforcement, rate limiting, bot protection, and role-guarded routes.

---

## Tech Stack

- **Frontend**: React 18, React Router v7, Framer Motion, Lucide Icons, Canvas Confetti
- **Styling**: TailwindCSS
- **Backend & Database**: Supabase (PostgreSQL, Supabase Auth, Realtime Channels)
- **Tooling**: Vite

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Rahul2004/college_attedence_system.git
cd college_attedence_system
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Create a `.env` file in the root directory based on `.env.example`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_ADMIN_EMAIL=admin@college.edu.in
VITE_ADMIN_PASSWORD=your_secure_password
```

### 4. Database Setup

Execute the SQL script in `database-schema.sql` inside your Supabase project's SQL Editor to set up required tables, indexes, and Row Level Security policies.

### 5. Run Development Server

```bash
npm run dev
```

The application will be running at `http://localhost:5173`.

---

## License

This project is licensed under the MIT License.
