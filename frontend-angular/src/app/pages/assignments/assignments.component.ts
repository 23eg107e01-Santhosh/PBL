import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AcademicService, AssignmentService } from '../../core/services/api.service';
import { RoomService } from '../../core/services/room.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-assignments',
  template: `
    <div class="page-container">
      <h1>Assignments</h1>
      <mat-card>
        <mat-card-content>
          <mat-tab-group>
            <mat-tab label="Manage">
              <div class="tab-wrap">
                <form [formGroup]="createForm" (ngSubmit)="createAssignment()" class="form-row" *ngIf="canCreate">
                  <mat-form-field appearance="fill">
                    <mat-label>Type</mat-label>
                    <mat-select formControlName="types">
                      <mat-option value="Assignment">Assignment</mat-option>
                      <mat-option value="Quiz">Quiz</mat-option>
                      <mat-option value="Project">Project</mat-option>
                    </mat-select>
                  </mat-form-field>
                  <mat-form-field appearance="fill">
                    <mat-label>Course Code</mat-label>
                    <input matInput formControlName="courseCode" />
                  </mat-form-field>
                  <mat-form-field appearance="fill" class="grow">
                    <mat-label>Course Title</mat-label>
                    <input matInput formControlName="courseTitle" />
                  </mat-form-field>
                  <mat-form-field appearance="fill" class="grow">
                    <mat-label>Assignment Title</mat-label>
                    <input matInput formControlName="assignmentTitle" />
                  </mat-form-field>
                  <mat-form-field appearance="fill" class="grow">
                    <mat-label>Detail</mat-label>
                    <textarea matInput formControlName="detail" rows="2"></textarea>
                  </mat-form-field>
                  <mat-form-field appearance="fill">
                    <mat-label>Due Date</mat-label>
                    <input matInput [matDatepicker]="picker" formControlName="date" />
                    <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                    <mat-datepicker #picker></mat-datepicker>
                  </mat-form-field>
                  <mat-form-field appearance="fill">
                    <mat-label>Department</mat-label>
                    <mat-select formControlName="department">
                      <mat-option [value]="null">All</mat-option>
                      <mat-option *ngFor="let d of departments" [value]="d._id">{{ d.name }} ({{ d.code }})</mat-option>
                    </mat-select>
                  </mat-form-field>
                  <mat-form-field appearance="fill">
                    <mat-label>Section</mat-label>
                    <mat-select formControlName="section">
                      <mat-option [value]="null">All</mat-option>
                      <mat-option *ngFor="let s of sections" [value]="s._id">{{ s.section }}</mat-option>
                    </mat-select>
                  </mat-form-field>
                  <mat-form-field appearance="fill">
                    <mat-label>Intake</mat-label>
                    <mat-select formControlName="intake">
                      <mat-option [value]="null">All</mat-option>
                      <mat-option *ngFor="let i of intakes" [value]="i._id">{{ i.intake }}</mat-option>
                    </mat-select>
                  </mat-form-field>
                  <button mat-raised-button color="primary" type="submit" [disabled]="createForm.invalid">Create</button>
                </form>

                <div class="filters">
                  <mat-form-field appearance="fill">
                    <mat-label>Filter by type</mat-label>
                    <mat-select [(ngModel)]="filter.type" (selectionChange)="loadAssignments()">
                      <mat-option [value]="''">All</mat-option>
                      <mat-option value="Assignment">Assignment</mat-option>
                      <mat-option value="Quiz">Quiz</mat-option>
                      <mat-option value="Project">Project</mat-option>
                    </mat-select>
                  </mat-form-field>
                  <button mat-stroked-button (click)="resetFilters()">Reset</button>
                </div>

                <div class="list">
                  <mat-list>
                    <mat-list-item *ngFor="let a of assignments">
                      <div matListItemTitle>{{ a.assignmentTitle }} <span class="muted">({{ a.types }})</span></div>
                      <div matListItemLine>
                        {{ a.courseCode }} — {{ a.courseTitle }}
                        <span class="due" *ngIf="a.date">Due: {{ a.date | date:'mediumDate' }}</span>
                      </div>
                      <div class="detail" *ngIf="a.detail">{{ a.detail }}</div>
                    </mat-list-item>
                  </mat-list>
                </div>
              </div>
            </mat-tab>

            <mat-tab label="Classwork">
              <div class="tab-wrap">
                <div class="filters">
                  <mat-form-field appearance="fill">
                    <mat-label>Classroom</mat-label>
                    <mat-select [(ngModel)]="selectedRoomId" (selectionChange)="loadRoomAssignments()">
                      <mat-option *ngFor="let r of myRooms" [value]="r._id">{{ r.title }}</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>

                <div *ngIf="roomAssignments.length === 0" class="muted">Select a classroom to view assignments.</div>
                <div class="list" *ngIf="roomAssignments.length">
                  <mat-list>
                    <mat-list-item *ngFor="let ca of roomAssignments">
                      <div matListItemTitle>
                        {{ ca.title }}
                        <span class="due" *ngIf="ca.dueDate">Due: {{ ca.dueDate | date:'medium' }}</span>
                        <span class="points" *ngIf="ca.totalPoints">• {{ ca.totalPoints }} pts</span>
                      </div>
                      <div matListItemLine class="detail" *ngIf="ca.instructions">{{ ca.instructions }}</div>
                      <ng-container *ngIf="!isTeacher; else gradingBlock">
                        <form [formGroup]="subForm" (ngSubmit)="submitWork(ca._id)" class="form-row">
                          <input type="file" (change)="onSubFile($event)" />
                          <mat-form-field appearance="fill" class="grow">
                            <mat-label>Link URL</mat-label>
                            <input matInput formControlName="linkUrl" />
                          </mat-form-field>
                          <button mat-raised-button color="primary" type="submit">Submit</button>
                        </form>
                      </ng-container>
                      <ng-template #gradingBlock>
                        <div class="muted">Grading is available from classroom details per student submissions.</div>
                      </ng-template>
                    </mat-list-item>
                  </mat-list>
                </div>
              </div>
            </mat-tab>
          </mat-tab-group>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container { max-width: 1400px; margin: 0 auto; }
    h1 { font-size: 2rem; font-weight: 600; color: #ffffff; margin-bottom: 24px; }
    .tab-wrap { display: flex; flex-direction: column; gap: 16px; }
    .form-row { display: grid; grid-template-columns: repeat(4, minmax(180px, 1fr)); gap: 12px; align-items: center; }
    .form-row .grow { grid-column: span 2; }
    .filters { display: flex; gap: 12px; align-items: center; }
    .list { background: #1e293b; border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; }
    .muted { color: #94a3b8; }
    .due { margin-left: 12px; color: #f59e0b; }
    .detail { margin-top: 8px; color: #cbd5e1; }
  `],
  standalone: false
})
export class AssignmentsComponent implements OnInit {
  createForm!: FormGroup;
  assignments: any[] = [];
  departments: any[] = [];
  sections: any[] = [];
  intakes: any[] = [];
  filter: any = { type: '' };
  canCreate = false;

  myRooms: any[] = [];
  selectedRoomId: string = '';
  roomAssignments: any[] = [];
  subForm!: FormGroup;

  isTeacher = false;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private academicApi: AcademicService,
    private assignmentApi: AssignmentService,
    private roomApi: RoomService,
    private http: HttpClient,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.isTeacher = this.auth.currentUserValue?.role === 'teacher';
    this.canCreate = ['admin','teacher'].includes(this.auth.currentUserValue?.role || '');
    this.createForm = this.fb.group({
      types: ['Assignment', Validators.required],
      courseCode: ['', Validators.required],
      courseTitle: ['', Validators.required],
      assignmentTitle: ['', Validators.required],
      detail: [''],
      date: [null],
      intake: [null],
      department: [null],
      section: [null]
    });
    this.subForm = this.fb.group({ linkUrl: [''] });
    this.loadMeta();
    this.loadAssignments();
    this.loadMyRooms();
  }

  loadMeta(): void {
    this.academicApi.getDepartments().subscribe({ next: (res:any)=> this.departments = res?.data || res || [], error: ()=> this.toastr.error('Failed to load departments') });
    this.academicApi.getSections().subscribe({ next: (res:any)=> this.sections = res?.data || res || [], error: ()=> this.toastr.error('Failed to load sections') });
    this.academicApi.getIntakes().subscribe({ next: (res:any)=> this.intakes = res?.data || res || [], error: ()=> this.toastr.error('Failed to load intakes') });
  }

  loadAssignments(): void {
    const params: any = {};
    if (this.filter.type) params.types = this.filter.type;
    this.assignmentApi.getAll(params).subscribe({
      next: (res:any)=> this.assignments = res?.data?.assignments || res?.data || res || [],
      error: ()=> this.toastr.error('Failed to load assignments')
    });
  }

  resetFilters(): void { this.filter = { type: '' }; this.loadAssignments(); }

  createAssignment(): void {
    if (this.createForm.invalid) return;
    const payload = { ...this.createForm.value };
    if (payload.date instanceof Date) payload.date = payload.date.toISOString();
    this.assignmentApi.create(payload).subscribe({
      next: (res:any)=> { const created = res?.data || res; this.assignments.unshift(created); this.toastr.success('Assignment created'); this.createForm.reset({ types: 'Assignment', courseCode: '', courseTitle: '', assignmentTitle: '', detail: '', date: null, intake: null, department: null, section: null }); },
      error: ()=> this.toastr.error('Failed to create assignment')
    });
  }

  loadMyRooms(): void {
    this.roomApi.myRooms().subscribe({ next: (res:any)=> this.myRooms = res?.data?.rooms || res?.rooms || res?.data || res || [], error: ()=> {} });
  }

  loadRoomAssignments(): void {
    this.roomAssignments = [];
    if (!this.selectedRoomId) return;
    this.http.get<any>(`${environment.apiUrl}/classroom/${this.selectedRoomId}/assignments`).subscribe({ next: r=> this.roomAssignments = r.data?.assignments || [], error: ()=> this.toastr.error('Failed to load classwork') });
  }

  onSubFile(ev: Event){ const input = ev.target as HTMLInputElement; const f = (input.files && input.files[0]) || null; if (f) { (this.subForm as any)._file = f; } }
  submitWork(asgId: string){ const f = (this.subForm as any)._file as File | null; const linkUrl = this.subForm.value.linkUrl; const fd = new FormData(); fd.append('assignment', asgId); if (f) fd.append('submissionFile', f); if (linkUrl) fd.append('linkUrl', linkUrl); this.http.post<any>(`${environment.apiUrl}/classroom/submissions`, fd).subscribe({ next: ()=>{ this.toastr.success('Submitted'); this.subForm.reset(); (this.subForm as any)._file = null; }, error: ()=> this.toastr.error('Submission failed') }); }
}
