import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

interface DemoRole {
  label: string;
  email: string;
  route: string;
}

const DEMO_PASSWORD = 'Demo@123';

const DEMO_ROLES: DemoRole[] = [
  { label: 'Super Admin', email: 'superadmin@cortracker360.com', route: '/super-admin' },
  {
    label: 'Super Admin (Manager)',
    email: 'superadmin.manager@cortracker360.com',
    route: '/super-admin-manager',
  },
  { label: 'HR', email: 'hr@cortracker360.com', route: '/hr' },
  {
    label: 'Editor / Contributor',
    email: 'editor@cortracker360.com',
    route: '/editor-contributor',
  },
  {
    label: 'Contributor (View)',
    email: 'contributor.view@cortracker360.com',
    route: '/contributor-view',
  },
  { label: 'Candidate', email: 'candidate@cortracker360.com', route: '/candidate' },
  {
    label: 'Resource Manager (View)',
    email: 'resource.manager@cortracker360.com',
    route: '/resource-manager-view',
  },
];

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-login',
  templateUrl: './login.html',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  protected readonly demoRoles = DEMO_ROLES;
  protected readonly demoPassword = DEMO_PASSWORD;
  protected readonly showPassword = signal(false);
  protected readonly errorMessage = signal('');
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
    const matchedRole = this.demoRoles.find(
      (role) => role.email.toLowerCase() === email.toLowerCase(),
    );

    if (!matchedRole || password !== this.demoPassword) {
      this.errorMessage.set('Invalid work email or password. Try one of the demo accounts below.');
      return;
    }

    this.errorMessage.set('');
    this.router.navigateByUrl(matchedRole.route);
  }
}
