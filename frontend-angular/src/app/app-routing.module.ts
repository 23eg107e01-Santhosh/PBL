import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Guards
import { AuthGuard } from './core/guards/auth.guard';
import { GuestGuard } from './core/guards/guest.guard';

// Components
import { LayoutComponent } from './layout/layout.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { TeacherScheduleManagerComponent } from './pages/teacher-schedule-manager/teacher-schedule-manager.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { AssignmentsComponent } from './pages/assignments/assignments.component';
import { StudentsComponent } from './pages/students/students.component';
import { RoomListComponent } from './pages/room-list/room-list.component';
import { RoomDetailComponent } from './pages/room-detail/room-detail.component';
import { ClassChatComponent } from './pages/class-chat/class-chat.component';

const routes: Routes = [
  // Public routes
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [GuestGuard]
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [GuestGuard]
  },
  
  // Protected routes
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'teacher-schedule', component: TeacherScheduleManagerComponent },
      { path: 'assignments', component: AssignmentsComponent },
      { path: 'students', component: StudentsComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'rooms', component: RoomListComponent },
  { path: 'rooms/:id', component: RoomDetailComponent }
      ,{ path: 'class-chat/:id', component: ClassChatComponent }
    ]
  },
  
  // Fallback
  { path: '**', redirectTo: 'dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
