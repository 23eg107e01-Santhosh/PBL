# Study Collab - Angular Frontend

This is a complete Angular replacement for the React frontend of Study Collab - Student Collaboration Platform.

## 🎯 Project Overview

**Technology Stack:**
- Angular 19
- Angular Material
- TypeScript 5.6
- RxJS 7.8
- NGX-Toastr for notifications
- Date-fns for date manipulation
- Socket.io-client for real-time features

## 📁 Project Structure

```
frontend-angular/
├── src/
│   ├── app/
│   │   ├── core/                    # Core services, guards, interceptors
│   │   │   ├── guards/              # Route guards (AuthGuard, GuestGuard)
│   │   │   ├── interceptors/        # HTTP interceptors (AuthInterceptor)
│   │   │   ├── models/              # TypeScript interfaces and models
│   │   │   └── services/            # Core services (AuthService, API services)
│   │   ├── layout/                  # Layout component (Sidebar, Header)
│   │   ├── pages/                   # Page components
│   │   │   ├── login/               # Login page
│   │   │   ├── register/            # Registration page
│   │   │   ├── dashboard/           # Dashboard with stats
│   │   │   ├── class-schedule/      # Class schedule viewer
│   │   │   ├── teacher-schedule-manager/  # Schedule management
│   │   │   ├── profile/             # User profile
│   │   │   ├── announcements/       # Announcements (placeholder)
│   │   │   ├── assignments/         # Assignments (placeholder)
│   │   │   └── students/            # Student management (placeholder)
│   │   ├── app.module.ts            # Main app module
│   │   ├── app.component.ts         # Root component
│   │   └── app-routing.module.ts    # Routing configuration
│   ├── environments/                # Environment configs
│   ├── index.html                   # Main HTML file
│   ├── main.ts                      # Application entry point
│   └── styles.scss                  # Global styles
├── angular.json                     # Angular CLI configuration
├── package.json                     # Dependencies
└── tsconfig.json                    # TypeScript configuration
```

## 🚀 Features Implemented

### ✅ Completed
- **Authentication System**
  - JWT-based authentication
  - Login & Register pages
  - Auth guards for route protection
  - HTTP interceptor for token injection
  - Auto-logout on 401 errors

- **Layout & Navigation**
  - Responsive sidebar navigation
  - Material Design AppBar
  - User profile menu
  - Role-based menu items

- **Dashboard**
  - Welcome card
  - Statistics cards (Assignments, Announcements, Students)
  - Upcoming assignments list
  - Recent announcements
  - Today's class schedule

- **API Services**
  - AuthService
  - StudentService
  - ClassRoutineService
  - AssignmentService
  - AnnouncementService
  - AcademicService
  - UserService

- **Dark Theme**
  - Professional dark theme throughout
  - Material Design components customized
  - Gradient buttons and cards
  - Smooth animations

### 🚧 To Be Implemented (Placeholders Created)
- Class Schedule (full calendar view)
- Teacher Schedule Manager (CRUD operations)
- Profile Management (edit, password change)
- Announcements (full CRUD)
- Assignments (full CRUD)
- Students Management (full CRUD)

## 📦 Installation

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- Angular CLI (`npm install -g @angular/cli`)

### Steps

1. **Navigate to the Angular frontend directory:**
   ```bash
   cd frontend-angular
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   Edit `src/environments/environment.ts` and set your API URL:
   ```typescript
   export const environment = {
     production: false,
     apiUrl: 'http://localhost:5000/api'
   };
   ```

4. **Start the development server:**
   ```bash
   npm start
   # or
   ng serve
   ```

5. **Open your browser:**
   Navigate to `http://localhost:4200`

## 🔧 Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm run watch` - Build in watch mode
- `npm test` - Run unit tests
- `npm run lint` - Lint code

## 🎨 Theme & Styling

The application uses a professional dark theme with:
- **Primary Color:** Indigo (#3f51b5)
- **Secondary Color:** Pink (#ff4081)
- **Background:** Dark gradients (#0a0a0a, #1e1e1e)
- **Font:** Inter, Roboto
- **Border Radius:** 12px

All Material Design components are customized to match the dark theme.

## 🔐 Authentication Flow

1. User accesses protected route
2. AuthGuard checks authentication status
3. If not authenticated, redirects to `/login`
4. After successful login, JWT token stored in localStorage
5. AuthInterceptor adds token to all HTTP requests
6. On 401 error, user is automatically logged out

## 🛣️ Routing

### Public Routes:
- `/login` - Login page
- `/register` - Registration page

### Protected Routes (require authentication):
- `/dashboard` - Main dashboard
- `/schedule` - Class schedule
- `/teacher-schedule` - Schedule management (Admin/Teacher only)
- `/assignments` - Assignments
- `/announcements` - Announcements
- `/students` - Student management (Admin/Teacher only)
- `/profile` - User profile

## 🔌 API Integration

All API services are located in `src/app/core/services/api.service.ts`.

**Base URL:** Configured in environment files (default: `http://localhost:5000/api`)

**Services:**
- `AuthService` - Authentication
- `StudentService` - Student CRUD operations
- `ClassRoutineService` - Class schedule management
- `AssignmentService` - Assignment management
- `AnnouncementService` - Announcement management
- `AcademicService` - Departments, Sections, Intakes
- `UserService` - User management

## 🏗️ Building for Production

```bash
npm run build
```

Production files will be in the `dist/study-collab-angular` directory.

## 🔄 Migration from React

This Angular app is a complete replacement for the React frontend with:

### Key Differences:
- **State Management:** RxJS Observables instead of React Context
- **Routing:** Angular Router instead of React Router
- **Forms:** Reactive Forms instead of react-hook-form
- **HTTP:** Angular HttpClient instead of Axios
- **Styling:** SCSS instead of inline styles
- **Components:** Angular components instead of React functional components

### Equivalent Features:
| React | Angular |
|-------|---------|
| Context API | Services with BehaviorSubject |
| useState | Component properties |
| useEffect | ngOnInit, ngOnDestroy |
| React Router | Angular Router |
| Axios | HttpClient |
| React Hook Form | Reactive Forms |
| react-toastify | ngx-toastr |

## 🎯 Next Steps

1. **Implement full Class Schedule page** with calendar view
2. **Complete Teacher Schedule Manager** with CRUD operations
3. **Build Profile Management** with edit capabilities
4. **Implement Announcements module** with file uploads
5. **Create Assignments module** with submission tracking
6. **Build Students Management** with approval workflow
7. **Add unit tests** for components and services
8. **Implement Socket.io** for real-time features
9. **Add form validations** throughout
10. **Optimize performance** with lazy loading

## 📝 Notes

- The backend API remains the same
- All authentication and authorization logic is compatible
- The dark theme matches the original React design
- Role-based access control is fully implemented
- Material Design ensures a modern, professional UI

## 🆘 Troubleshooting

**Problem:** Angular CLI not found
```bash
npm install -g @angular/cli
```

**Problem:** Module not found errors
```bash
rm -rf node_modules package-lock.json
npm install
```

**Problem:** API connection issues
- Check `environment.ts` has correct API URL
- Ensure backend is running on port 5000
- Check browser console for CORS errors

## 📄 License

This project is part of Study Collab platform.

---

**Updated:** October 2025  
**Framework:** Angular 19  
**Developer:** Study Collab Team
