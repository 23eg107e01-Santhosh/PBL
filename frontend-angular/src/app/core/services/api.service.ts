import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  protected apiUrl = environment.apiUrl;

  constructor(protected http: HttpClient) {}

  protected buildParams(params?: any): HttpParams {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return httpParams;
  }
}

@Injectable({
  providedIn: 'root'
})
export class StudentService extends ApiService {
  create(studentData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/students`, studentData);
  }

  getAll(params?: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/students`, { params: this.buildParams(params) });
  }

  getById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/students/${id}`);
  }

  getMyProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/students/me`);
  }

  updateMyProfile(studentData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/students/me`, studentData);
  }

  update(id: string, studentData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/students/${id}`, studentData);
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/students/${id}`);
  }

  approve(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/students/${id}/approve`, {});
  }
}

@Injectable({
  providedIn: 'root'
})
export class ClassRoutineService extends ApiService {
  create(routineData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/class-routines`, routineData);
  }

  getAll(params?: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/class-routines`, { params: this.buildParams(params) });
  }

  getById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/class-routines/${id}`);
  }

  getWeeklySchedule(params?: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/class-routines/weekly`, { params: this.buildParams(params) });
  }

  update(id: string, routineData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/class-routines/${id}`, routineData);
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/class-routines/${id}`);
  }
}

@Injectable({
  providedIn: 'root'
})
export class AssignmentService extends ApiService {
  create(assignmentData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/assignments`, assignmentData);
  }

  getAll(params?: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/assignments`, { params: this.buildParams(params) });
  }

  getById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/assignments/${id}`);
  }

  getByType(params?: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/assignments/by-type`, { params: this.buildParams(params) });
  }

  update(id: string, assignmentData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/assignments/${id}`, assignmentData);
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/assignments/${id}`);
  }
}

@Injectable({
  providedIn: 'root'
})
export class AnnouncementService extends ApiService {
  create(announcementData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/announcements`, announcementData);
  }

  getAll(params?: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/announcements`, { params: this.buildParams(params) });
  }

  getById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/announcements/${id}`);
  }

  getMy(params?: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/announcements/my`, { params: this.buildParams(params) });
  }

  update(id: string, announcementData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/announcements/${id}`, announcementData);
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/announcements/${id}`);
  }
}

@Injectable({
  providedIn: 'root'
})
export class AcademicService extends ApiService {
  // Departments
  createDepartment(departmentData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/academic/departments`, departmentData);
  }

  getDepartments(): Observable<any> {
    return this.http.get(`${this.apiUrl}/academic/departments`);
  }

  updateDepartment(id: string, departmentData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/academic/departments/${id}`, departmentData);
  }

  deleteDepartment(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/academic/departments/${id}`);
  }

  // Sections
  createSection(sectionData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/academic/sections`, sectionData);
  }

  getSections(): Observable<any> {
    return this.http.get(`${this.apiUrl}/academic/sections`);
  }

  updateSection(id: string, sectionData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/academic/sections/${id}`, sectionData);
  }

  deleteSection(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/academic/sections/${id}`);
  }

  // Intakes
  createIntake(intakeData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/academic/intakes`, intakeData);
  }

  getIntakes(): Observable<any> {
    return this.http.get(`${this.apiUrl}/academic/intakes`);
  }

  updateIntake(id: string, intakeData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/academic/intakes/${id}`, intakeData);
  }

  deleteIntake(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/academic/intakes/${id}`);
  }
}

@Injectable({
  providedIn: 'root'
})
export class UserService extends ApiService {
  getAll(params?: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/users`, { params: this.buildParams(params) });
  }

  getTeachers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/teachers`);
  }

  getById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/${id}`);
  }

  update(id: string, userData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${id}`, userData);
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${id}`);
  }

  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/auth/profile`);
  }

  updateProfile(userData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/auth/profile`, userData);
  }
}

@Injectable({
  providedIn: 'root'
})
export class ScheduleService extends ApiService {
  create(scheduleData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/schedules`, scheduleData);
  }

  getAll(params?: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/schedules`, { params: this.buildParams(params) });
  }

  getById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/schedules/${id}`);
  }

  getCalendarView(params?: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/schedules/calendar`, { params: this.buildParams(params) });
  }

  update(id: string, scheduleData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/schedules/${id}`, scheduleData);
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/schedules/${id}`);
  }
}