import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { User } from '../core/models/auth.model';

interface MenuItem {
  text: string;
  icon: string;
  path: string;
  roles: string[];
}

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  standalone: false
})
export class LayoutComponent implements OnInit {
  user: User | null = null;
  isSidebarOpen = true;
  
  menuItems: MenuItem[] = [
    {
      text: 'Dashboard',
      icon: 'dashboard',
      path: '/dashboard',
      roles: ['admin', 'teacher', 'student']
    },
    {
      text: 'Manage Schedules',
      icon: 'calendar_today',
      path: '/teacher-schedule',
      roles: ['admin', 'teacher']
    },
    {
      text: 'Assignments',
      icon: 'assignment',
      path: '/assignments',
      roles: ['admin', 'teacher', 'student']
    },
    {
      text: 'Classrooms',
      icon: 'meeting_room',
      path: '/rooms',
      roles: ['admin', 'teacher', 'student']
    }
  ];

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
    });
  }

  getFilteredMenuItems(): MenuItem[] {
    return this.menuItems.filter(item => 
      this.authService.hasAnyRole(item.roles)
    );
  }

  getUserDisplayName(): string {
    return this.user?.profile?.fullName || this.user?.profileData?.name || this.user?.email || 'User';
  }

  getUserInitial(): string {
    return this.getUserDisplayName().charAt(0).toUpperCase();
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  logout(): void {
    this.authService.logout();
  }

  navigateToProfile(): void {
    this.router.navigate(['/profile']);
  }
}
