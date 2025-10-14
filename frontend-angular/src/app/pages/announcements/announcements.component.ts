import { Component } from '@angular/core';

@Component({
  selector: 'app-announcements',
  template: `
    <div class="page-container">
      <h1>Announcements</h1>
      <mat-card>
        <mat-card-content>
          <p>Announcement management functionality will be implemented here.</p>
          <p>Features: Create/View/Edit announcements, File attachments, Class filtering</p>
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
export class AnnouncementsComponent {}
