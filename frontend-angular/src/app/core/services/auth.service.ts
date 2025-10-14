import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '@environments/environment';
import { User, AuthResponse, LoginCredentials, RegisterData } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;
  private tokenSubject: BehaviorSubject<string | null>;
  public token$: Observable<string | null>;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    this.tokenSubject = new BehaviorSubject<string | null>(token);
    this.currentUserSubject = new BehaviorSubject<User | null>(
      user ? JSON.parse(user) : null
    );
    
    this.currentUser$ = this.currentUserSubject.asObservable();
    this.token$ = this.tokenSubject.asObservable();

    // If we have a token but stale/empty user (or on refresh), hydrate from backend
    if (this.tokenSubject.value && !this.currentUserSubject.value) {
      this.refreshUserFromServer();
    }
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public get tokenValue(): string | null {
    return this.tokenSubject.value;
  }

  public get isAuthenticated(): boolean {
    return !!this.tokenValue && !!this.currentUserValue;
  }

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            this.setAuthData(response.data.token, response.data.user);
          }
        })
      );
  }

  register(data: RegisterData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, data)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            this.setAuthData(response.data.token, response.data.user);
          }
        })
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.tokenSubject.next(null);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  updateUser(userData: Partial<User>): void {
    const currentUser = this.currentUserValue;
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      this.currentUserSubject.next(updatedUser);
    }
  }

  hasRole(role: string): boolean {
    return this.currentUserValue?.role === role;
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.includes(this.currentUserValue?.role || '');
  }

  isApproved(): boolean {
    const user = this.currentUserValue;
    return user?.role === 'teacher' || user?.profile?.isApproved || false;
  }

  isAdmin(): boolean {
    const user = this.currentUserValue;
    return user?.role === 'admin' || user?.role === 'teacher';
  }

  private setAuthData(token: string, user: User): void {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.tokenSubject.next(token);
    this.currentUserSubject.next(user);
  }

  // Hydrate user state from backend profile
  refreshUserFromServer(): void {
    this.http.get<{ success: boolean; data?: { user: User } }>(`${environment.apiUrl}/auth/profile`).pipe(
      catchError(() => of(null))
    ).subscribe((res) => {
      if (res && res.success && res.data?.user) {
        const token = this.tokenValue!;
        this.setAuthData(token, res.data.user);
      }
    });
  }
}
