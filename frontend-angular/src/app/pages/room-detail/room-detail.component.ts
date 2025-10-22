import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ResourceService } from '../../core/services/resource.service';
import { ChatService } from '../../core/services/chat.service';
import { ChatApiService } from '../../core/services/chat-api.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-room-detail',
  template: `
    <div class="page-container" *ngIf="roomId">
      <div class="room-header">
        <h1>{{ roomTitle || 'Room' }}</h1>
        <div class="online">Online: <span class="chip" *ngFor="let u of onlineUsers">{{ u }}</span></div>
      </div>
      <mat-tab-group>
        <mat-tab label="Stream">
          <div class="tab-content">
            <form [formGroup]="postForm" (ngSubmit)="createPost()" class="res-form">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Share something with your class</mat-label>
                <textarea matInput formControlName="text" rows="2"></textarea>
              </mat-form-field>
              <button mat-raised-button color="primary" type="submit" [disabled]="postForm.invalid">Post</button>
            </form>
            <mat-list>
              <mat-list-item *ngFor="let p of posts">
                <div matListItemTitle>{{ p.author?.email || 'Someone' }}</div>
                <div matListItemLine>{{ p.text }}</div>
                <div *ngIf="p.attachments?.length">
                  <a *ngFor="let a of p.attachments" [href]="a.fileUrl" target="_blank">{{ a.fileName }}</a>
                </div>
              </mat-list-item>
            </mat-list>
          </div>
        </mat-tab>
        <mat-tab label="Resources">
          <div class="tab-content">
            <form [formGroup]="resForm" (ngSubmit)="upload()" class="res-form">
              <input type="file" (change)="onFile($event)" />
              <mat-form-field appearance="outline">
                <mat-label>Link URL</mat-label>
                <input matInput formControlName="linkUrl" />
              </mat-form-field>
              <button mat-raised-button color="primary" type="submit">Add</button>
            </form>
            <mat-list>
              <mat-list-item *ngFor="let it of resources">
                <a *ngIf="it.type==='file'" [href]="it.fileUrl" target="_blank">{{ it.fileName || it.fileUrl }}</a>
                <a *ngIf="it.type==='link'" [href]="it.linkUrl" target="_blank">{{ it.linkUrl }}</a>
              </mat-list-item>
            </mat-list>
          </div>
        </mat-tab>
        <mat-tab label="Classwork">
          <div class="tab-content">
            <form [formGroup]="asgForm" (ngSubmit)="createAssignment()" class="res-form" *ngIf="isTeacher">
              <mat-form-field appearance="outline">
                <mat-label>Title</mat-label>
                <input matInput formControlName="title" />
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Instructions</mat-label>
                <textarea matInput formControlName="instructions" rows="2"></textarea>
              </mat-form-field>
              <button mat-raised-button color="primary" type="submit" [disabled]="asgForm.invalid">Create</button>
            </form>
            <mat-list>
              <mat-list-item *ngFor="let a of assignments">
                <div matListItemTitle>{{ a.title }}</div>
                <div matListItemLine>{{ a.instructions }}</div>
                <ng-container *ngIf="!isTeacher">
                  <form [formGroup]="subForm" (ngSubmit)="submitWork(a._id)" class="res-form">
                    <input type="file" (change)="onSubFile($event)" />
                    <mat-form-field appearance="outline">
                      <mat-label>Link URL</mat-label>
                      <input matInput formControlName="linkUrl" />
                    </mat-form-field>
                    <button mat-raised-button color="primary" type="submit">Submit</button>
                  </form>
                </ng-container>
              </mat-list-item>
            </mat-list>
          </div>
        </mat-tab>
        <mat-tab label="People">
          <div class="tab-content">
            <h3>Teacher</h3>
            <mat-list>
              <mat-list-item *ngIf="teacher">
                <div matListItemTitle>{{ teacher?.profile?.fullName || teacher?.email }}</div>
                <div matListItemLine>{{ teacher?.role }}</div>
              </mat-list-item>
            </mat-list>
            <h3>Classmates</h3>
            <mat-list>
              <mat-list-item *ngFor="let m of classmates">
                <div matListItemTitle>{{ m.profile?.fullName || m.email }}</div>
                <div matListItemLine>{{ m.role }}</div>
              </mat-list-item>
            </mat-list>
          </div>
        </mat-tab>
        <mat-tab label="Chat">
          <div class="tab-content">
            <app-class-chat></app-class-chat>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`.room-header{display:flex; align-items:center; justify-content:space-between;} .online{display:flex; gap:8px; align-items:center;} .chip{background:#2a2f36; padding:4px 8px; border-radius:999px;} .res-form{display:flex; gap:12px; align-items:center; margin-bottom:12px;}`],
  standalone: false
})
export class RoomDetailComponent implements OnInit, OnDestroy {
  roomId!: string;
  roomTitle = '';
  resources: any[] = [];
  file: File | null = null;
  resForm!: FormGroup;
  postForm!: FormGroup;
  asgForm!: FormGroup;
  subForm!: FormGroup;
  onlineUsers = new Set<string>();
  posts: any[] = [];
  assignments: any[] = [];
  isTeacher = false;
  teacher: any = null;
  classmates: any[] = [];

  constructor(private route: ActivatedRoute, private resApi: ResourceService, private chat: ChatService, private chatApi: ChatApiService, private fb: FormBuilder, private auth: AuthService, private http: HttpClient) {}
  ngOnInit(): void {
    this.roomId = this.route.snapshot.paramMap.get('id')!;
    this.resForm = this.fb.group({ linkUrl: [''] });
    this.postForm = this.fb.group({ text: ['', [Validators.required, Validators.maxLength(2000)]] });
    this.asgForm = this.fb.group({ title: ['', Validators.required], instructions: [''] });
    this.subForm = this.fb.group({ linkUrl: [''] });
  this.isTeacher = this.auth.currentUserValue?.role === 'teacher';
    this.loadResources();
    // Fetch room info for title
    this.http.get<any>(`${environment.apiUrl}/rooms/${this.roomId}`).subscribe(r => {
      const room = r.data?.room;
      this.roomTitle = room?.title || '';
      const teacher = (room?.members || []).find((m:any)=> m.role==='teacher') || room?.createdBy;
      this.teacher = teacher;
      this.classmates = (room?.members || []).filter((m:any)=> m.role!=='teacher');
    });
    // Chat UI handled by app-class-chat within this tab.
  // Stream posts
  this.http.get<any>(`${environment.apiUrl}/classroom/${this.roomId}/posts`).subscribe(r=> this.posts = r.data?.posts || []);
  // Assignments
  this.http.get<any>(`${environment.apiUrl}/classroom/${this.roomId}/assignments`).subscribe(r=> this.assignments = r.data?.assignments || []);
    const userId = this.auth.currentUserValue?.id as string;
    this.chat.joinRoom(this.roomId, userId);
    // Track roster via socket events
    (this.chat as any).socket?.on('userJoined', (e:any)=>{ if (e && e.userId) this.onlineUsers.add(e.userId); });
    (this.chat as any).socket?.on('userLeft', (e:any)=>{ if (e && e.userId) this.onlineUsers.delete(e.userId); });
  }
  ngOnDestroy(): void {}
  loadResources(){ this.resApi.list(this.roomId).subscribe(res => this.resources = res.data?.resources || []); }
  onFile(ev: Event){ const input = ev.target as HTMLInputElement; this.file = (input.files && input.files[0]) || null; }
  upload(){ this.resApi.upload(this.roomId, this.file || undefined, this.resForm.value.linkUrl || undefined).subscribe(()=>{ this.resForm.reset(); this.file = null; this.loadResources(); }); }
  
  createPost(){ if (this.postForm.invalid) return; const fd = new FormData(); fd.append('room', this.roomId); fd.append('text', this.postForm.value.text); this.http.post<any>(`${environment.apiUrl}/classroom/posts`, fd).subscribe(r=>{ this.posts.unshift(r.data?.post); this.postForm.reset(); }); }
  createAssignment(){ if (this.asgForm.invalid) return; const payload = { room: this.roomId, ...this.asgForm.value }; this.http.post<any>(`${environment.apiUrl}/classroom/assignments`, payload).subscribe(r=>{ this.assignments.unshift(r.data?.assignment); this.asgForm.reset(); }); }
  onSubFile(ev: Event){ const input = ev.target as HTMLInputElement; const f = (input.files && input.files[0]) || null; if (f) { (this.subForm as any)._file = f; } }
  submitWork(asgId: string){ const f = (this.subForm as any)._file as File | null; const linkUrl = this.subForm.value.linkUrl; const fd = new FormData(); fd.append('assignment', asgId); if (f) fd.append('submissionFile', f); if (linkUrl) fd.append('linkUrl', linkUrl); this.http.post<any>(`${environment.apiUrl}/classroom/submissions`, fd).subscribe(()=>{ this.subForm.reset(); (this.subForm as any)._file = null; }); }
}
