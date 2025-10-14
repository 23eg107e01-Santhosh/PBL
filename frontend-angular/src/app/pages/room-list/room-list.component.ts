import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RoomService } from '../../core/services/room.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-room-list',
  template: `
    <div class="page-container">
      <h1>Classrooms</h1>
      <div class="forms">
        <form [formGroup]="createForm" (ngSubmit)="create()">
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

        <form [formGroup]="joinForm" (ngSubmit)="join()">
          <mat-form-field appearance="outline">
            <mat-label>Room Code</mat-label>
            <input matInput formControlName="code" />
          </mat-form-field>
          <button mat-raised-button color="accent" type="submit">Join</button>
        </form>
      </div>

      <div class="room-grid">
        <mat-card *ngFor="let r of rooms" (click)="open(r)" class="room-card">
          <mat-card-title>{{ r.title }}</mat-card-title>
          <mat-card-subtitle>Code: {{ r.code }}</mat-card-subtitle>
          <mat-card-content>{{ r.description }}</mat-card-content>
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
  constructor(private fb: FormBuilder, private roomsApi: RoomService, private router: Router, private toastr: ToastrService) {}
  ngOnInit(): void {
    this.createForm = this.fb.group({ title: ['', Validators.required], description: [''] });
    this.joinForm = this.fb.group({ code: ['', Validators.required] });
    this.load();
  }
  load(): void { this.roomsApi.myRooms().subscribe(res => this.rooms = res.data?.rooms || []); }
  create(): void { if (this.createForm.invalid) return; this.roomsApi.create(this.createForm.value).subscribe(res => { this.toastr.success('Room created'); this.load(); }); }
  join(): void { if (this.joinForm.invalid) return; this.roomsApi.join(this.joinForm.value.code).subscribe(res => { this.toastr.success('Joined room'); this.load(); }); }
  open(r:any){ this.router.navigate(['/rooms', r._id || r.id]); }
}
