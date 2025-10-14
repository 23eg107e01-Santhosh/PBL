# Study Collab - Class Management System

A modern, full-stack class management system now using **Angular** for the frontend and **Node.js/Express + MongoDB** for the backend. (The original React implementation has been removed in favor of the new Angular application.)

## ✨ Features

- **User Management**: Role-based authentication (Admin, Teacher, Student)
- **Class Scheduling**: Interactive weekly class routines with calendar view
- **Assignment Management**: Create, track, and manage assignments with file uploads
- **Announcements**: Class-specific announcements with file attachments
- **Student Profiles**: Comprehensive student information management
- **File Management**: Profile pictures, assignment files, and announcement attachments

## 🛠️ Tech Stack

**Frontend:** Angular 19, Angular Material, RxJS, NGX-Toastr, Date-fns  
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

### 5. Start the Application
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

## 📝 Default User Roles

- **Admin**: Full system access and user management
- **Teacher**: Create assignments, announcements, and manage classes
- **Student**: View assignments, announcements, and manage profile

---

Built with using Angular, Node.js, and MongoDB