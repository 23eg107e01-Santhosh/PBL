import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { AssignmentService, AnnouncementService, ClassRoutineService, StudentService } from '../../core/services/api.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: false
})
export class DashboardComponent implements OnInit {
  loading = true;
  dashboardData: {
    upcomingAssignments: any[];
    recentAnnouncements: any[];
    todaySchedule: any[];
    stats: {
      totalStudents: number;
      totalAssignments: number;
      totalAnnouncements: number;
    };
  } = {
    upcomingAssignments: [],
    recentAnnouncements: [],
    todaySchedule: [],
    stats: {
      totalStudents: 0,
      totalAssignments: 0,
      totalAnnouncements: 0
    }
  };
  studentProfile: any = null;

  constructor(
    public authService: AuthService,
    private assignmentService: AssignmentService,
    private announcementService: AnnouncementService,
    private classRoutineService: ClassRoutineService,
    private studentService: StudentService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    
    // Load data based on user role
    if (this.authService.hasAnyRole(['student'])) {
      this.loadStudentData();
    } else {
      this.loadGeneralData();
    }
  }

  loadStudentData(): void {
    this.studentService.getMyProfile().subscribe({
      next: (response) => {
        if (response.success) {
          this.studentProfile = response.data;
          this.loadClassSpecificData();
        }
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  loadClassSpecificData(): void {
    const filter = {
      intake: this.studentProfile.intake._id,
      department: this.studentProfile.department._id,
      section: this.studentProfile.section._id
    };

    Promise.all([
      this.assignmentService.getAll({ ...filter, upcoming: true, limit: 5 }).toPromise(),
      this.announcementService.getAll({ ...filter, limit: 5 }).toPromise(),
      this.classRoutineService.getAll({ ...filter, day: this.getCurrentDay() }).toPromise()
    ]).then(([assignments, announcements, schedule]) => {
      this.dashboardData = {
        upcomingAssignments: assignments?.data?.assignments || [],
        recentAnnouncements: announcements?.data?.announcements || [],
        todaySchedule: schedule?.data?.routines || [],
        stats: {
          totalStudents: 0,
          totalAssignments: assignments?.data?.total || 0,
          totalAnnouncements: announcements?.data?.total || 0
        }
      };
      this.loading = false;
    }).catch(() => {
      this.loading = false;
    });
  }

  loadGeneralData(): void {
    Promise.all([
      this.assignmentService.getAll({ upcoming: true, limit: 5 }).toPromise(),
      this.announcementService.getAll({ limit: 5 }).toPromise(),
      this.studentService.getAll({ limit: 1 }).toPromise()
    ]).then(([assignments, announcements, students]) => {
      this.dashboardData = {
        upcomingAssignments: assignments?.data?.assignments || [],
        recentAnnouncements: announcements?.data?.announcements || [],
        todaySchedule: [],
        stats: {
          totalStudents: students?.data?.total || 0,
          totalAssignments: assignments?.data?.total || 0,
          totalAnnouncements: announcements?.data?.total || 0
        }
      };
      this.loading = false;
    }).catch(() => {
      this.loading = false;
    });
  }

  getCurrentDay(): string {
    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    return days[new Date().getDay()];
  }

  getUserDisplayName(): string {
    const user = this.authService.currentUserValue;
    return user?.profile?.fullName || this.studentProfile?.name || user?.email || 'User';
  }
}
