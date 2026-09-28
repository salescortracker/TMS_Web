import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { errorMessage } from '../shared/api/api-helpers';
import { AuthService } from '../shared/auth.service';

interface DemoRole {
  label: string;
  email: string;
}

const DEMO_PASSWORD = 'Demo@123';

// Only the Super Admin is seeded by the SQL script. Every other login is created
// from Roles & Access (staff) or Onboarding approvals (candidates).
const DEMO_ROLES: DemoRole[] = [{ label: 'Super Admin', email: 'superadmin@cortracker360.com' }];

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-login',
  templateUrl: './login.html',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  protected readonly demoRoles = DEMO_ROLES;
  protected readonly demoPassword = DEMO_PASSWORD;
  protected readonly showPassword = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly isSubmitting = signal(false);
  protected readonly currentYear = new Date().getFullYear();

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  togglePasswordVisibility(): void {
    this.showPassword.update((visible) => !visible);
  }

  fillDemoRole(role: DemoRole): void {
    this.errorMessage.set('');
    this.form.setValue({ email: role.email, password: this.demoPassword });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password } = this.form.getRawValue();
    this.errorMessage.set('');
    this.isSubmitting.set(true);

    this.authService.login(email, password).subscribe({
      next: (response) => {
        this.isSubmitting.set(false);
        this.router.navigateByUrl(
          response.mustChangePassword ? '/change-password' : this.authService.homeRoute(),
        );
      },
      error: (error) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(
          error.status === 401
            ? 'Invalid work email or password.'
            : errorMessage(error, 'Could not sign in. Please try again.'),
        );
      },
    });
  }
}
