import { Component } from '@angular/core';

@Component({
  selector: 'app-assignments',
  template: `
    <div class="page-container">
      <h1>Assignments</h1>
      <mat-card>
        <mat-card-content>
          <p>Assignment management functionality will be implemented here.</p>
          <p>Features: Create/View/Submit assignments, Due date tracking, Grading</p>
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
export class AssignmentsComponent {}
