import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AcademicService, ScheduleService } from '../../core/services/api.service';

@Component({
  selector: 'app-teacher-schedule-manager',
  template: `
    <div class="page-container">
      <h1>Manage Schedules</h1>
      
      <mat-tab-group>
        <!-- Schedule List Tab -->
        <mat-tab label="My Schedules">
          <div class="tab-content">
            <div class="filters">
              <mat-form-field appearance="fill">
                <mat-label>Filter by Section</mat-label>
                <mat-select [(ngModel)]="filterSection" (selectionChange)="loadSchedules()">
                  <mat-option [value]="''">All Sections</mat-option>
                  <mat-option *ngFor="let s of sections" [value]="s._id">{{ s.section }}</mat-option>
                </mat-select>
              </mat-form-field>
              <button mat-stroked-button (click)="resetFilters()">Reset</button>
            </div>

            <div class="schedules-grid">
              <mat-card *ngFor="let schedule of schedules" class="schedule-card">
                <mat-card-header>
                  <mat-card-title>{{ schedule.title }}</mat-card-title>
                  <mat-card-subtitle>{{ schedule.courseCode }} - {{ schedule.courseTitle }}</mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                  <div class="schedule-info">
                    <div><strong>Duration:</strong> {{ schedule.startDate | date:'shortDate' }} - {{ schedule.endDate | date:'shortDate' }}</div>
                    <div><strong>Sections:</strong> {{ getSectionNames(schedule.sections) }}</div>
                    <div><strong>Time Slots:</strong> {{ schedule.timeSlots.length }}</div>
                  </div>
                </mat-card-content>
                <mat-card-actions>
                  <button mat-button color="primary" (click)="viewSchedule(schedule)">View</button>
                  <button mat-button color="accent" (click)="editSchedule(schedule)">Edit</button>
                  <button mat-button color="warn" (click)="deleteSchedule(schedule._id)">Delete</button>
                </mat-card-actions>
              </mat-card>
            </div>
          </div>
        </mat-tab>

        <!-- Create/Edit Schedule Tab -->
        <mat-tab label="Create Schedule">
          <div class="tab-content">
            <form [formGroup]="scheduleForm" (ngSubmit)="saveSchedule()" class="schedule-form">
              <div class="form-section">
                <h3>Basic Information</h3>
                <div class="form-row">
                  <mat-form-field appearance="fill" class="grow">
                    <mat-label>Schedule Title</mat-label>
                    <input matInput formControlName="title" />
                  </mat-form-field>
                  <mat-form-field appearance="fill">
                    <mat-label>Course Code</mat-label>
                    <input matInput formControlName="courseCode" />
                  </mat-form-field>
                  <mat-form-field appearance="fill" class="grow">
                    <mat-label>Course Title</mat-label>
                    <input matInput formControlName="courseTitle" />
                  </mat-form-field>
                </div>
                
                <mat-form-field appearance="fill" class="full-width">
                  <mat-label>Description</mat-label>
                  <textarea matInput formControlName="description" rows="3"></textarea>
                </mat-form-field>

                <div class="form-row">
                  <mat-form-field appearance="fill">
                    <mat-label>Start Date</mat-label>
                    <input matInput [matDatepicker]="startPicker" formControlName="startDate" />
                    <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
                    <mat-datepicker #startPicker></mat-datepicker>
                  </mat-form-field>
                  <mat-form-field appearance="fill">
                    <mat-label>End Date</mat-label>
                    <input matInput [matDatepicker]="endPicker" formControlName="endDate" />
                    <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
                    <mat-datepicker #endPicker></mat-datepicker>
                  </mat-form-field>
                </div>
              </div>

              <div class="form-section">
                <h3>Section Assignment</h3>
                <mat-form-field appearance="fill" class="full-width">
                  <mat-label>Select Sections</mat-label>
                  <mat-select formControlName="sections" multiple>
                    <mat-option *ngFor="let section of sections" [value]="section._id">
                      {{ section.section }}
                    </mat-option>
                  </mat-select>
                </mat-form-field>
              </div>

              <div class="form-section">
                <h3>Time Slots</h3>
                <div formArrayName="timeSlots">
                  <div *ngFor="let timeSlot of timeSlotsArray.controls; let i = index" [formGroupName]="i" class="time-slot">
                    <div class="form-row">
                      <mat-form-field appearance="fill">
                        <mat-label>Day</mat-label>
                        <mat-select formControlName="day">
                          <mat-option value="monday">Monday</mat-option>
                          <mat-option value="tuesday">Tuesday</mat-option>
                          <mat-option value="wednesday">Wednesday</mat-option>
                          <mat-option value="thursday">Thursday</mat-option>
                          <mat-option value="friday">Friday</mat-option>
                          <mat-option value="saturday">Saturday</mat-option>
                          <mat-option value="sunday">Sunday</mat-option>
                        </mat-select>
                      </mat-form-field>
                      <mat-form-field appearance="fill">
                        <mat-label>Start Time</mat-label>
                        <input matInput type="time" formControlName="startTime" />
                      </mat-form-field>
                      <mat-form-field appearance="fill">
                        <mat-label>End Time</mat-label>
                        <input matInput type="time" formControlName="endTime" />
                      </mat-form-field>
                      <mat-form-field appearance="fill">
                        <mat-label>Room</mat-label>
                        <input matInput formControlName="room" />
                      </mat-form-field>
                      <button mat-icon-button color="warn" type="button" (click)="removeTimeSlot(i)">
                        <mat-icon>delete</mat-icon>
                      </button>
                    </div>
                  </div>
                </div>
                <button mat-stroked-button type="button" (click)="addTimeSlot()">Add Time Slot</button>
              </div>

              <div class="form-actions">
                <button mat-raised-button color="primary" type="submit" [disabled]="scheduleForm.invalid">
                  {{ editingSchedule ? 'Update Schedule' : 'Create Schedule' }}
                </button>
                <button mat-button type="button" (click)="cancelEdit()" *ngIf="editingSchedule">Cancel</button>
              </div>
            </form>
          </div>
        </mat-tab>

        <!-- Calendar View Tab -->
        <mat-tab label="Calendar View">
          <div class="tab-content">
            <div class="calendar-controls">
              <mat-form-field appearance="fill">
                <mat-label>View Month</mat-label>
                <input matInput [matDatepicker]="monthPicker" [(ngModel)]="selectedMonth" (ngModelChange)="loadCalendarData()" />
                <mat-datepicker-toggle matSuffix [for]="monthPicker"></mat-datepicker-toggle>
                <mat-datepicker #monthPicker startView="year"></mat-datepicker>
              </mat-form-field>
            </div>

            <div class="calendar-grid">
              <div class="calendar-day" *ngFor="let day of calendarDays" [class.has-events]="day.schedules.length > 0">
                <div class="day-header">{{ day.date | date:'d' }}</div>
                <div class="day-schedules">
                  <div *ngFor="let schedule of day.schedules" class="schedule-event">
                    <div class="event-title">{{ schedule.title }}</div>
                    <div class="event-time">{{ schedule.timeSlots[0].startTime }} - {{ schedule.timeSlots[0].endTime }}</div>
                    <div class="event-sections">{{ getSectionNames(schedule.sections) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .page-container { max-width: 1400px; margin: 0 auto; }
    h1 { font-size: 2rem; font-weight: 600; color: #ffffff; margin-bottom: 24px; }
    .tab-content { padding: 16px; }
    .filters { display: flex; gap: 16px; align-items: center; margin-bottom: 16px; }
    .schedules-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 16px; }
    .schedule-card { background: #1e293b; border: 1px solid rgba(255,255,255,0.1); }
    .schedule-info { color: #cbd5e1; }
    .schedule-form { display: flex; flex-direction: column; gap: 24px; }
    .form-section { background: #1e293b; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 16px; }
    .form-section h3 { color: #e2e8f0; margin-bottom: 16px; }
    .form-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; align-items: center; }
    .form-row .grow { grid-column: span 2; }
    .full-width { width: 100%; }
    .time-slot { background: #0f172a; border: 1px solid rgba(255,255,255,0.05); border-radius: 6px; padding: 12px; margin-bottom: 12px; }
    .form-actions { display: flex; gap: 12px; justify-content: flex-end; }
    .calendar-controls { margin-bottom: 16px; }
    .calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 1px; background: rgba(255,255,255,0.1); }
    .calendar-day { background: #1e293b; min-height: 120px; padding: 8px; border: 1px solid rgba(255,255,255,0.1); }
    .calendar-day.has-events { background: #1f2937; }
    .day-header { font-weight: 600; color: #e2e8f0; margin-bottom: 4px; }
    .schedule-event { background: #3b82f6; border-radius: 4px; padding: 4px; margin-bottom: 4px; font-size: 12px; }
    .event-title { font-weight: 600; color: white; }
    .event-time, .event-sections { color: #e0e7ff; font-size: 10px; }
  `],
  standalone: false
})
export class TeacherScheduleManagerComponent implements OnInit {
  scheduleForm!: FormGroup;
  schedules: any[] = [];
  sections: any[] = [];
  editingSchedule: any = null;
  filterSection = '';
  selectedMonth = new Date();
  calendarDays: any[] = [];

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private academicService: AcademicService,
    private scheduleService: ScheduleService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadSections();
    this.loadSchedules();
    this.generateCalendarDays();
  }

  initializeForm(): void {
    this.scheduleForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      courseCode: ['', Validators.required],
      courseTitle: ['', Validators.required],
      startDate: [null, Validators.required],
      endDate: [null, Validators.required],
      sections: [[], Validators.required],
      timeSlots: this.fb.array([])
    });
  }

  get timeSlotsArray(): FormArray {
    return this.scheduleForm.get('timeSlots') as FormArray;
  }

  loadSections(): void {
    this.academicService.getSections().subscribe({
      next: (res: any) => this.sections = res?.data || res || [],
      error: () => this.toastr.error('Failed to load sections')
    });
  }

  loadSchedules(): void {
    const params: any = {};
    if (this.filterSection) params.section = this.filterSection;
    
    this.scheduleService.getAll(params).subscribe({
      next: (res: any) => this.schedules = res?.data?.schedules || res?.data || res || [],
      error: () => this.toastr.error('Failed to load schedules')
    });
  }

  resetFilters(): void {
    this.filterSection = '';
    this.loadSchedules();
  }

  addTimeSlot(): void {
    const timeSlot = this.fb.group({
      day: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      room: ['']
    });
    this.timeSlotsArray.push(timeSlot);
  }

  removeTimeSlot(index: number): void {
    this.timeSlotsArray.removeAt(index);
  }

  saveSchedule(): void {
    if (this.scheduleForm.invalid) return;

    const formData = { ...this.scheduleForm.value };
    
    if (this.editingSchedule) {
      this.scheduleService.update(this.editingSchedule._id, formData).subscribe({
        next: (res: any) => {
          this.toastr.success('Schedule updated successfully');
          this.loadSchedules();
          this.cancelEdit();
        },
        error: () => this.toastr.error('Failed to update schedule')
      });
    } else {
      this.scheduleService.create(formData).subscribe({
        next: (res: any) => {
          this.toastr.success('Schedule created successfully');
          this.loadSchedules();
          this.scheduleForm.reset();
          this.timeSlotsArray.clear();
        },
        error: () => this.toastr.error('Failed to create schedule')
      });
    }
  }

  editSchedule(schedule: any): void {
    this.editingSchedule = schedule;
    this.scheduleForm.patchValue({
      title: schedule.title,
      description: schedule.description,
      courseCode: schedule.courseCode,
      courseTitle: schedule.courseTitle,
      startDate: new Date(schedule.startDate),
      endDate: new Date(schedule.endDate),
      sections: schedule.sections.map((s: any) => s._id)
    });

    // Clear and populate time slots
    this.timeSlotsArray.clear();
    schedule.timeSlots.forEach((slot: any) => {
      const timeSlot = this.fb.group({
        day: [slot.day, Validators.required],
        startTime: [slot.startTime, Validators.required],
        endTime: [slot.endTime, Validators.required],
        room: [slot.room || '']
      });
      this.timeSlotsArray.push(timeSlot);
    });
  }

  viewSchedule(schedule: any): void {
    // Implementation for detailed view
    console.log('View schedule:', schedule);
  }

  deleteSchedule(id: string): void {
    if (confirm('Are you sure you want to delete this schedule?')) {
      this.scheduleService.delete(id).subscribe({
        next: () => {
          this.toastr.success('Schedule deleted successfully');
          this.loadSchedules();
        },
        error: () => this.toastr.error('Failed to delete schedule')
      });
    }
  }

  cancelEdit(): void {
    this.editingSchedule = null;
    this.scheduleForm.reset();
    this.timeSlotsArray.clear();
  }

  getSectionNames(sections: any[]): string {
    return sections.map(s => s.section || s).join(', ');
  }

  loadCalendarData(): void {
    const startDate = new Date(this.selectedMonth.getFullYear(), this.selectedMonth.getMonth(), 1);
    const endDate = new Date(this.selectedMonth.getFullYear(), this.selectedMonth.getMonth() + 1, 0);
    
    this.scheduleService.getCalendarView({ startDate: startDate.toISOString(), endDate: endDate.toISOString() }).subscribe({
      next: (res: any) => {
        const schedules = res?.data || [];
        this.populateCalendarDays(schedules);
      },
      error: () => this.toastr.error('Failed to load calendar data')
    });
  }

  generateCalendarDays(): void {
    const year = this.selectedMonth.getFullYear();
    const month = this.selectedMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    this.calendarDays = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      this.calendarDays.push({ date, schedules: [] });
    }
    this.loadCalendarData();
  }

  populateCalendarDays(schedules: any[]): void {
    this.calendarDays.forEach(day => {
      day.schedules = schedules.filter(schedule => {
        const scheduleStart = new Date(schedule.startDate);
        const scheduleEnd = new Date(schedule.endDate);
        return day.date >= scheduleStart && day.date <= scheduleEnd;
      });
    });
  }
}
