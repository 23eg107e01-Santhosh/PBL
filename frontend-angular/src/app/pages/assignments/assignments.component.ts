import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
// import services used elsewhere removed for simplified UI
import { RoomService } from '../../core/services/room.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-assignments',
  template: `
    <div class="page-container">
      <h1>Assignments</h1>
      <div class="filters">
        <mat-form-field appearance="fill">
          <mat-label>Classroom</mat-label>
          <mat-select [(ngModel)]="selectedRoomId" (selectionChange)="onRoomChange()">
            <mat-option *ngFor="let r of myRooms" [value]="r._id">{{ r.title }}</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <ng-container *ngIf="isTeacher && selectedRoomId">
        <mat-card class="create-card">
          <mat-card-header><mat-card-title>Create assignment</mat-card-title></mat-card-header>
          <mat-card-content>
            <form [formGroup]="createForm" (ngSubmit)="createAssignment()" class="create-grid">
              <mat-form-field appearance="fill" class="col-span-2">
                <mat-label>Title</mat-label>
                <input matInput formControlName="title" />
              </mat-form-field>
              <mat-form-field appearance="fill" class="col-span-2">
                <mat-label>Instructions (optional)</mat-label>
                <textarea matInput formControlName="instructions" rows="2"></textarea>
              </mat-form-field>
              <mat-form-field appearance="fill">
                <mat-label>Due date</mat-label>
                <input matInput [matDatepicker]="picker" formControlName="dueDate" />
                <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
              </mat-form-field>
              <mat-form-field appearance="fill">
                <mat-label>Total points</mat-label>
                <input type="number" matInput formControlName="totalPoints" />
              </mat-form-field>

              <div class="questions col-span-2" formArrayName="questions">
                <div class="q-head">Questions</div>
                <div class="q-list">
                  <div class="q-row" *ngFor="let q of questions.controls; let i = index" [formGroupName]="i">
                    <mat-form-field appearance="fill" class="grow">
                      <mat-label>Question {{i+1}}</mat-label>
                      <textarea matInput formControlName="text" rows="2"></textarea>
                    </mat-form-field>
                    <mat-form-field appearance="fill" class="grow">
                      <mat-label>Correct answer</mat-label>
                      <input matInput formControlName="correctAnswer" />
                    </mat-form-field>
                    <mat-form-field appearance="fill" class="qpts">
                      <mat-label>Points</mat-label>
                      <input type="number" matInput formControlName="points" />
                    </mat-form-field>
                    <button type="button" mat-icon-button (click)="removeQuestion(i)" aria-label="Remove question"><mat-icon>delete</mat-icon></button>
                  </div>
                </div>
                <button mat-stroked-button type="button" (click)="addQuestion()"><mat-icon>add</mat-icon> Add question</button>
              </div>

              <mat-form-field appearance="fill" class="col-span-2">
                <mat-label>Assign to students</mat-label>
                <mat-select formControlName="assignedTo" multiple [disabled]="roomMembers.length===0">
                  <mat-option *ngFor="let m of roomMembers" [value]="m._id">{{ m.profile?.fullName || m.email }}</mat-option>
                </mat-select>
              </mat-form-field>

              <div class="col-span-2 actions">
                <button mat-raised-button color="primary" type="submit" [disabled]="createForm.invalid">Create</button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      </ng-container>

      <div *ngIf="!selectedRoomId" class="muted">Select a classroom to continue.</div>

      <div class="list" *ngIf="selectedRoomId">
        <mat-list>
          <mat-list-item *ngFor="let ca of roomAssignments">
            <div matListItemTitle>
              {{ ca.title }}
              <span class="due" *ngIf="ca.dueDate">Due: {{ ca.dueDate | date:'medium' }}</span>
              <span class="points" *ngIf="ca.totalPoints">• {{ ca.totalPoints }} pts</span>
            </div>
            <div matListItemMeta *ngIf="isTeacher">
              <button mat-icon-button color="warn" (click)="deleteAsg(ca)" aria-label="Delete assignment">
                <mat-icon>delete</mat-icon>
              </button>
            </div>
            <div matListItemMeta *ngIf="!isTeacher">
              <button mat-raised-button color="primary" (click)="toggleAttempt(ca)">{{ attemptOpen[ca._id] ? 'Hide' : 'Attempt' }}</button>
            </div>
            <div matListItemLine class="detail" *ngIf="ca.instructions">{{ ca.instructions }}</div>

            <!-- Student submission UI -->
            <ng-container *ngIf="!isTeacher">
              <div class="submission">
                <button mat-stroked-button type="button" (click)="toggleAttempt(ca)">{{ attemptOpen[ca._id] ? 'Hide' : 'Attempt' }}</button>
                <div class="attempt-area" *ngIf="attemptOpen[ca._id]">
                <form [formGroup]="getAnswerForm(ca._id)" (ngSubmit)="submitAnswers(ca)" class="answers-grid" *ngIf="getAnswerForm(ca._id)">
                  <div class="a-row" *ngFor="let q of (ca.questions||[]); let i = index">
                    <div class="qtext">Q{{i+1}}. {{ q.text }}</div>
                    <mat-form-field appearance="fill" class="grow">
                      <mat-label>Your answer</mat-label>
                      <textarea matInput [formControlName]="'q_'+i" rows="2"></textarea>
                    </mat-form-field>
                  </div>
                  <div class="a-row" *ngIf="(ca.questions||[]).length === 0">
                    <mat-form-field appearance="fill" class="grow">
                      <mat-label>Your answer</mat-label>
                      <textarea matInput formControlName="q_0" rows="3"></textarea>
                    </mat-form-field>
                  </div>
                  <div class="inline">
                    <button mat-raised-button color="primary" type="submit">Submit assignment</button>
                  </div>
                </form>
                </div>
                <div class="muted" *ngIf="mySubmissions[ca._id]?.grade !== undefined && mySubmissions[ca._id]?.grade !== null">
                  Your grade: {{ mySubmissions[ca._id].grade }} / {{ ca.totalPoints || 100 }}
                </div>
              </div>
            </ng-container>

            <!-- Teacher review UI -->
            <ng-container *ngIf="isTeacher">
              <div class="review">
                <div class="actions-row">
                  <button mat-raised-button color="primary" (click)="toggleReview(ca._id)">{{ reviewOpen[ca._id] ? 'Hide' : 'Review' }}</button>
                  <button mat-raised-button color="warn" (click)="deleteAsg(ca)">Delete</button>
                </div>
                <div class="review-panel" *ngIf="reviewOpen[ca._id]">
                  <div class="muted" *ngIf="!submissions[ca._id]">Loading submissions...</div>
                  <div class="sub-row" *ngFor="let s of (submissions[ca._id] || [])">
                    <div class="s-name">{{ s.student?.profile?.fullName || s.student?.email }}</div>
                    <div class="s-answers" *ngIf="s.answers?.length">
                      <div class="sa" *ngFor="let a of s.answers">Q{{a.questionIndex+1}}: {{a.answer}}</div>
                    </div>
                    <mat-form-field appearance="fill" class="s-grade">
                      <mat-label>Grade</mat-label>
                      <input type="number" matInput [(ngModel)]="s._gradeTemp" [ngModelOptions]="{standalone: true}" />
                    </mat-form-field>
                    <button mat-raised-button color="primary" (click)="gradeSubmission(s, s._gradeTemp)">Save</button>
                    <span class="muted" *ngIf="s.grade !== null">Current: {{s.grade}}</span>
                  </div>
                </div>
              </div>
            </ng-container>
          </mat-list-item>
        </mat-list>
      </div>
    </div>
  `,
  styles: [`
    .page-container { max-width: 1200px; margin: 0 auto; }
    h1 { font-size: 2rem; font-weight: 600; color: #ffffff; margin-bottom: 16px; }
    .filters { display: flex; gap: 12px; align-items: center; margin-bottom: 12px; }
    .muted { color: #94a3b8; }
    .list { background: #0f172a; border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; }
    .due { margin-left: 12px; color: #f59e0b; }
    .detail { margin-top: 6px; color: #cbd5e1; }
    .create-card { margin-bottom: 16px; }
    .create-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
    .col-span-2 { grid-column: span 2; }
    .actions { display: flex; justify-content: flex-end; }
    .questions .q-head { font-weight: 600; margin-bottom: 6px; }
    .q-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 8px; }
  .q-row { display: grid; grid-template-columns: 1fr 1fr 120px 48px; gap: 8px; align-items: center; }
  .qpts { width: 120px; }
    .answers-grid { display: flex; flex-direction: column; gap: 8px; margin-top: 8px; }
    .a-row { display: grid; grid-template-columns: auto 1fr; gap: 8px; align-items: start; }
    .qtext { color: #e2e8f0; }
  .inline { display: grid; grid-template-columns: auto; gap: 8px; align-items: center; }
    .review { margin-top: 8px; }
  .actions-row { display: flex; gap: 8px; margin-top: 8px; }
    .review-panel { margin-top: 8px; border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 8px; }
    .sub-row { display: grid; grid-template-columns: 1.2fr 1fr 140px auto auto; gap: 8px; align-items: center; }
    .s-name { color: #e2e8f0; }
    .s-answers { color: #cbd5e1; }
    .mat-mdc-list-item .mdc-list-item__end { display: flex; align-items: center; gap: 8px; }
    /* Make list items expand to show attempt form */
    .mat-mdc-list-item.mdc-list-item { height: auto !important; align-items: flex-start !important; }
    .attempt-area { margin-top: 8px; width: 100%; }
  `],
  standalone: false
})
export class AssignmentsComponent implements OnInit {
  // Create form (teacher)
  createForm!: FormGroup;
  get questions() { return this.createForm.get('questions') as FormArray; }

  // Room and members
  myRooms: any[] = [];
  selectedRoomId: string = '';
  roomMembers: any[] = [];
  roomAssignments: any[] = [];

  // Student answers per assignment
  answerForms: { [assignmentId: string]: FormGroup } = {};
  mySubmissions: { [assignmentId: string]: any } = {};
  attemptOpen: { [assignmentId: string]: boolean } = {};

  // Teacher review state
  submissions: { [assignmentId: string]: any[] } = {};
  reviewOpen: { [assignmentId: string]: boolean } = {};

  isTeacher = false;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private roomApi: RoomService,
    private http: HttpClient,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.isTeacher = this.auth.currentUserValue?.role === 'teacher';
    this.createForm = this.fb.group({
      title: ['', Validators.required],
      instructions: [''],
      dueDate: [null],
      totalPoints: [100, [Validators.min(0)]],
      questions: this.fb.array([]),
      assignedTo: [[]]
    });
    this.loadMyRooms();
  }

  createAssignment(): void {
    if (this.createForm.invalid || !this.selectedRoomId) return;
    const payload = { ...this.createForm.value, room: this.selectedRoomId };
    if (payload.dueDate instanceof Date) payload.dueDate = payload.dueDate.toISOString();
    this.http.post<any>(`${environment.apiUrl}/classroom/assignments`, payload).subscribe({
      next: (r)=>{
        const created = r?.data?.assignment || r?.data || r;
        this.roomAssignments.unshift(created);
        this.toastr.success('Assignment created');
        this.createForm.reset({ title: '', instructions: '', dueDate: null, totalPoints: 100, questions: [], assignedTo: [] });
        while(this.questions.length) this.questions.removeAt(0);
      },
      error: ()=> this.toastr.error('Failed to create assignment')
    });
  }

  loadMyRooms(): void {
    this.roomApi.myRooms().subscribe({ next: (res:any)=> this.myRooms = res?.data?.rooms || res?.rooms || res?.data || res || [], error: ()=> {} });
  }

  onRoomChange(): void {
    this.roomAssignments = [];
    this.roomMembers = [];
    if (!this.selectedRoomId) return;
    this.http.get<any>(`${environment.apiUrl}/classroom/${this.selectedRoomId}/assignments`).subscribe({ next: r=> {
      this.roomAssignments = r.data?.assignments || [];
      // Prepare answer forms for each assignment for students
      if (!this.isTeacher) {
        this.roomAssignments.forEach(a=> this.ensureAnswerForm(a));
      }
    }, error: ()=> this.toastr.error('Failed to load assignments') });
    // Load room members for teacher selection
    this.roomApi.get(this.selectedRoomId).subscribe({ next: (r:any)=> {
      const room = r?.data?.room || r?.room || r;
      const members = room?.members || [];
      this.roomMembers = members.filter((m:any)=> m.role === 'student');
    }, error: ()=> {} });
  }

  addQuestion(): void { this.questions.push(this.fb.group({ text: ['', Validators.required], correctAnswer: [''], points: [0] })); }
  removeQuestion(i: number): void { this.questions.removeAt(i); }

  ensureAnswerForm(asg: any): void {
    if (this.answerForms[asg._id]) return;
    const g: any = {};
    (asg.questions || []).forEach((q:any, idx:number)=> g['q_'+idx] = ['']);
    if ((asg.questions || []).length === 0) { g['q_0'] = ['']; }
    this.answerForms[asg._id] = this.fb.group(g);
    this.fetchMySubmission(asg._id);
  }
  toggleAttempt(asg: any){ const id = asg && asg._id ? asg._id : asg; this.attemptOpen[id] = !this.attemptOpen[id]; if (this.attemptOpen[id]) { this.ensureAnswerForm(asg); if (!this.answerForms[id]) { this.answerForms[id] = this.fb.group({ q_0: [''] }); } } }
  getAnswerForm(id: string): FormGroup { return this.answerForms[id]; }
  submitAnswers(asg: any){
    const form = this.answerForms[asg._id]; if (!form) return;
    const answers = (asg.questions || []).map((_:any, i:number)=> ({ questionIndex: i, answer: form.value['q_'+i] || '' }));
    this.http.post<any>(`${environment.apiUrl}/classroom/submissions`, { assignment: asg._id, answers }).subscribe({ next: (r)=>{ this.toastr.success('Submitted'); this.mySubmissions[asg._id] = r?.data?.submission || {}; }, error: ()=> this.toastr.error('Submission failed') });
  }

  fetchMySubmission(asgId: string){ this.http.get<any>(`${environment.apiUrl}/classroom/assignments/${asgId}/mine`).subscribe({ next: r=> this.mySubmissions[asgId] = r?.data?.submission || {}, error: ()=> {} }); }

  toggleReview(asgId: string){
    this.reviewOpen[asgId] = !this.reviewOpen[asgId];
    if (this.reviewOpen[asgId] && !this.submissions[asgId]) {
      this.http.get<any>(`${environment.apiUrl}/classroom/assignments/${asgId}/submissions`).subscribe({ next: r=> this.submissions[asgId] = r?.data?.submissions || [], error: ()=> this.toastr.error('Failed to load submissions') });
    }
  }
  gradeSubmission(sub: any, grade: number){
    this.http.post<any>(`${environment.apiUrl}/classroom/submissions/${sub._id}/grade`, { grade }).subscribe({ next: r=> { sub.grade = r?.data?.submission?.grade; this.toastr.success('Grade saved'); }, error: ()=> this.toastr.error('Failed to save grade') });
  }

  deleteAsg(ca: any){
    if (!confirm('Delete this assignment? This will remove all submissions.')) return;
    this.http.delete<any>(`${environment.apiUrl}/classroom/assignments/${ca._id}`).subscribe({ next: ()=>{
      this.roomAssignments = this.roomAssignments.filter(a=> a._id !== ca._id);
      delete this.submissions[ca._id];
      this.toastr.success('Assignment deleted');
    }, error: ()=> this.toastr.error('Failed to delete assignment') });
  }
}
