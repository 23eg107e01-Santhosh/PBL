# Study Collab - Class Management System

A modern, full-stack class management system now using **Angular** for the frontend and **Node.js/Express + MongoDB** for the backend.

## ✨ Features

- **User Management**: Role-based authentication (Admin, Teacher, Student)
- **Class Scheduling**: Interactive weekly class routines with calendar view
- **Assignment Management**: Create, track, and manage assignments with file uploads
- **Announcements**: Class-specific announcements with file attachments
- **Student Profiles**: Comprehensive student information management
- **File Management**: Profile pictures, assignment files, and announcement attachments

## 🛠️ Tech Stack

**Frontend:** Angular 19, Angular Material 
**Backend:** Node.js, Express.js, MongoDB, JWT Authentication, Multer

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>
```

### 2. Install Dependencies
```bash
npm install
npm run install:all
```

### 3. Environment Setup
Create `.env` files in the backend directory.

**Backend (.env):**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/study_collab
JWT_SECRET=your_jwt_secret_key
```

**Angular Frontend Environment:** Update `frontend-angular/src/environments/environment.ts` if needed:
```ts
export const environment = {
	production: false,
	apiUrl: 'http://localhost:5000/api'
};
```

### 4. Start MongoDB
Make sure MongoDB is running on your system.

### 5. Seed Demo Data (optional but recommended)
From the `backend` folder, populate demo Departments, Sections, Students, Schedules, Assignments, and Classrooms:
```bash
cd backend
npm run seed:demo
```

Demo accounts created by the seeders:

- Teacher: `teacher.demo@university.edu` / `teacher123`
- Students: `<personalId>@student.university.edu` (e.g. `cse21001@student.university.edu`) / `student123`

### 6. Start the Application
```bash
npm run dev
```

- Angular Frontend: http://localhost:4200
- Backend API: http://localhost:5000

## 📂 Project Structure

```
Study-collab/
├── backend/           # Node.js/Express backend
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── utils/
│   └── uploads/       # File upload directory
├── frontend-angular/  # Angular frontend
│   ├── src/app/
│   ├── src/environments/
│   └── ...
└── package.json       # Root package configuration
```

## 🔧 Available Scripts

- `npm run dev` - Start backend + Angular frontend concurrently
- `npm run dev:backend` - Start only backend server
- `npm run dev:frontend-angular` - Start only Angular frontend
- `npm run install:all` - Install dependencies (backend + Angular)
- `npm run build:frontend-angular` - Production build of Angular frontend

### Backend seeding scripts (run from `backend/`)

- `npm run seed:departments` — seed standard departments (CSE, EEE, ME, BBA, etc.)
- `npm run seed:sections` — seed Sections A–M
- `npm run seed:students` — seed demo students and their user accounts
- `npm run seed:schedules` — seed demo weekly class routines
- `npm run seed:assignments` — seed upcoming assignments
- `npm run seed:classrooms` — seed demo classrooms and welcome posts
- `npm run seed:demo` — run all of the above in order

## 📝 Default User Roles

- Teacher: Create schedules, assignments, announcements, manage classrooms
- Student: View schedules, assignments, announcements, manage profile

---

Built with Angular, Node.js, and MongoDB
