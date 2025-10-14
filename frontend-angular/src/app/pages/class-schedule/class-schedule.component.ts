import { Component } from '@angular/core';

@Component({
  selector: 'app-class-schedule',
  template: `
    <div class="page-container">
      <h1>Class Schedule</h1>
      <mat-card>
        <mat-card-content>
          <p>Class schedule functionality will be implemented here.</p>
          <p>Features: Weekly schedule view, calendar view, class filtering</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container { max-width: 1400px; margin: 0 auto; }
    h1 { font-size: 2rem; font-weight: 600; color: #ffffff; margin-bottom: 24px; }
  `],
  standalone: false
})
export class ClassScheduleComponent {}
