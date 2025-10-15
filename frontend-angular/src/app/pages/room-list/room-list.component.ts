import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RoomService } from '../../core/services/room.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-room-list',
  template: `
    <div class="page-container">
      <h1>Classrooms</h1>
      <div class="forms">
        <form [formGroup]="createForm" (ngSubmit)="create()" *ngIf="isTeacher">
          <mat-form-field appearance="outline">
            <mat-label>Title</mat-label>
            <input matInput formControlName="title" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Description</mat-label>
            <input matInput formControlName="description" />
          </mat-form-field>
          <button mat-raised-button color="primary" type="submit">Create</button>
        </form>

        <form [formGroup]="joinForm" (ngSubmit)="join()" *ngIf="isStudent">
          <mat-form-field appearance="outline">
            <mat-label>Room Code</mat-label>
            <input matInput formControlName="code" />
          </mat-form-field>
          <button mat-raised-button color="accent" type="submit">Join</button>
        </form>
      </div>

      <div class="room-grid">
        <mat-card *ngFor="let r of rooms" class="room-card">
          <mat-card-title>{{ r.title }}</mat-card-title>
          <mat-card-subtitle>Code: {{ r.code }}</mat-card-subtitle>
          <mat-card-content>{{ r.description }}</mat-card-content>
          <mat-card-actions>
            <button mat-stroked-button color="primary" (click)="open(r)">Open</button>
            <button mat-button color="accent" (click)="openChat(r)">Open Chat</button>
            <button mat-button color="warn" *ngIf="isTeacher" (click)="deleteRoom(r)">Delete</button>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`.forms{display:flex; gap:24px; margin-bottom:16px;} .room-grid{display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:16px;} .room-card{cursor:pointer;}`],
  standalone: false
})
export class RoomListComponent implements OnInit {
  createForm!: FormGroup;
  joinForm!: FormGroup;
  rooms: any[] = [];
  isTeacher = false;
  isStudent = false;
  constructor(private fb: FormBuilder, private roomsApi: RoomService, private router: Router, private toastr: ToastrService, private auth: AuthService) {}
  ngOnInit(): void {
    const role = this.auth.currentUserValue?.role || '';
    this.isTeacher = role === 'teacher' || role === 'admin';
    this.isStudent = role === 'student';
    this.createForm = this.fb.group({ title: ['', Validators.required], description: [''] });
    this.joinForm = this.fb.group({ code: ['', Validators.required] });
    this.load();
  }
  load(): void { this.roomsApi.myRooms().subscribe(res => this.rooms = res.data?.rooms || []); }
  create(): void { if (this.createForm.invalid) return; this.roomsApi.create(this.createForm.value).subscribe(res => { this.toastr.success('Room created'); this.load(); }); }
  join(): void { if (this.joinForm.invalid) return; this.roomsApi.join(this.joinForm.value.code).subscribe(res => { this.toastr.success('Joined room'); this.load(); }); }
  open(r:any){ this.router.navigate(['/rooms', r._id || r.id]); }
  openChat(r:any){ this.router.navigate(['/class-chat', r._id || r.id]); }
  
  deleteRoom(r: any): void {
    if (confirm('Are you sure you want to delete this room? This action cannot be undone.')) {
      this.roomsApi.delete(r._id || r.id).subscribe({
        next: () => {
          this.toastr.success('Room deleted successfully');
          this.load();
        },
        error: () => this.toastr.error('Failed to delete room')
      });
    }
  }
}
