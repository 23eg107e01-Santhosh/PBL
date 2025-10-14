import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  template: `
    <div class="page-container">
      <h1>Profile</h1>

      <mat-card>
        <mat-tab-group>
          <mat-tab label="Details">
            <div class="tab-content">
              <form [formGroup]="detailsForm" (ngSubmit)="saveDetails()">
                <div class="form-grid">
                  <mat-form-field appearance="outline">
                    <mat-label>Full Name</mat-label>
                    <input matInput formControlName="fullName" placeholder="Your full name" />
                    <mat-error *ngIf="detailsForm.controls['fullName'].hasError('required')">Full name is required</mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Email</mat-label>
                    <input matInput formControlName="email" placeholder="Email" />
                    <mat-error *ngIf="detailsForm.controls['email'].hasError('email')">Invalid email</mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Bio</mat-label>
                    <textarea matInput formControlName="bio" rows="4" placeholder="Tell others about you"></textarea>
                  </mat-form-field>
                </div>

                <button mat-raised-button color="primary" type="submit" [disabled]="detailsForm.invalid || saving">
                  Save Changes
                </button>
              </form>
            </div>
          </mat-tab>

          <mat-tab label="Avatar">
            <div class="tab-content">
              <div class="avatar-section">
                <img [src]="avatarPreview || currentAvatarUrl || defaultAvatar" class="avatar" alt="avatar" />
                <input type="file" accept="image/*" (change)="onAvatarSelected($event)" />
              </div>
              <button mat-raised-button color="primary" (click)="uploadAvatar()" [disabled]="!selectedAvatar || saving">
                Upload Avatar
              </button>
            </div>
          </mat-tab>

          <mat-tab label="Password">
            <div class="tab-content">
              <form [formGroup]="passwordForm" (ngSubmit)="changePassword()">
                <div class="form-grid">
                  <mat-form-field appearance="outline">
                    <mat-label>Current Password</mat-label>
                    <input matInput [type]="showPw ? 'text' : 'password'" formControlName="currentPassword" />
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>New Password</mat-label>
                    <input matInput [type]="showPw ? 'text' : 'password'" formControlName="password" />
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>Confirm Password</mat-label>
                    <input matInput [type]="showPw ? 'text' : 'password'" formControlName="confirmPassword" />
                  </mat-form-field>
                </div>
                <button mat-raised-button color="primary" type="submit" [disabled]="passwordForm.invalid || saving">
                  Change Password
                </button>
              </form>
            </div>
          </mat-tab>
        </mat-tab-group>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container { max-width: 1000px; margin: 0 auto; }
    h1 { font-size: 2rem; font-weight: 600; color: #ffffff; margin-bottom: 24px; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .full-width { grid-column: 1 / -1; }
    .tab-content { padding: 16px; }
    .avatar-section { display:flex; align-items:center; gap:16px; margin-bottom:12px; }
    .avatar { width:96px; height:96px; border-radius:50%; object-fit:cover; border: 2px solid var(--color-primary-500); }
  `],
  standalone: false
})
export class ProfileComponent implements OnInit {
  detailsForm!: FormGroup;
  passwordForm!: FormGroup;
  saving = false;
  showPw = false;
  selectedAvatar: File | null = null;
  avatarPreview: string | null = null;
  defaultAvatar = 'https://ui-avatars.com/api/?name=U&background=0D8ABC&color=fff&size=128';

  get currentAvatarUrl(): string | null {
    return this.auth.currentUserValue?.profile?.avatarUrl || null;
  }

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private auth: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    const user = this.auth.currentUserValue!;
    this.detailsForm = this.fb.group({
      fullName: [user.profile?.fullName || '', [Validators.required, Validators.minLength(2)]],
      email: [user.email, [Validators.required, Validators.email]],
      bio: [user.profile?.bio || '', [Validators.maxLength(500)]]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator = (g: FormGroup) => {
    return g.get('password')?.value === g.get('confirmPassword')?.value ? null : { mismatch: true };
  };

  saveDetails(): void {
    if (this.detailsForm.invalid) return;
    this.saving = true;
    this.userService.updateProfile(this.detailsForm.value).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('Profile updated');
          this.auth.updateUser(res.data.user);
          // Ensure fresh copy from server for consistency (e.g., id mapping)
          this.auth.refreshUserFromServer();
        }
        this.saving = false;
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Update failed');
        this.saving = false;
      }
    });
  }

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedAvatar = input.files[0];
      const reader = new FileReader();
      reader.onload = () => this.avatarPreview = reader.result as string;
      reader.readAsDataURL(this.selectedAvatar);
    }
  }

  uploadAvatar(): void {
    if (!this.selectedAvatar) return;
    this.saving = true;
    const fd = new FormData();
    fd.append('profileImage', this.selectedAvatar);
    this.userService.updateProfile(fd).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('Avatar updated');
          this.auth.updateUser(res.data.user);
          this.selectedAvatar = null;
          this.avatarPreview = null;
          this.auth.refreshUserFromServer();
        }
        this.saving = false;
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Upload failed');
        this.saving = false;
      }
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) return;
    this.saving = true;
    this.userService.updateProfile(this.passwordForm.value).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('Password changed');
          this.passwordForm.reset();
        }
        this.saving = false;
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Password change failed');
        this.saving = false;
      }
    });
  }
}
