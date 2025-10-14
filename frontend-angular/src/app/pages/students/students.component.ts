import { Component } from '@angular/core';

@Component({
  selector: 'app-students',
  template: `
    <div class="page-container">
      <h1>Students</h1>
      <mat-card>
        <mat-card-content>
          <p>Student management functionality will be implemented here.</p>
          <p>Features: View/Edit students, Approve registrations, Filter by class</p>
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
export class StudentsComponent {}
