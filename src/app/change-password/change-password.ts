import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { errorMessage } from '../shared/api/api-helpers';
import { AuthService } from '../shared/auth.service';

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const next = group.get('newPassword')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return next === confirm ? null : { mismatch: true };
}

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-change-password',
  templateUrl: './change-password.html',
})
export class ChangePassword {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  protected readonly errorText = signal('');
  protected readonly isSubmitting = signal(false);
  protected readonly currentYear = new Date().getFullYear();

  protected readonly form = this.fb.nonNullable.group(
    {
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordsMatch },
  );

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { currentPassword, newPassword } = this.form.getRawValue();
    this.errorText.set('');
    this.isSubmitting.set(true);
    this.authService.changePassword(currentPassword, newPassword).subscribe({
      next: () => this.router.navigateByUrl(this.authService.homeRoute()),
      error: (error) => {
        this.isSubmitting.set(false);
        this.errorText.set(errorMessage(error));
      },
    });
  }

  logOut(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }
}
