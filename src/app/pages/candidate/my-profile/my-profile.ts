import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { errorMessage } from '../../../shared/api/api-helpers';
import { CandidateApi } from '../../../shared/api/candidate.api';
import { LookupItem, PublicApi } from '../../../shared/api/public.api';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-my-profile',
  templateUrl: './my-profile.html',
})
export class MyProfile implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(CandidateApi);
  private readonly lookupApi = inject(PublicApi);

  protected readonly teams = signal<LookupItem[]>([]);
  protected readonly companies = signal<LookupItem[]>([]);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly statusMessage = signal('');
  protected readonly statusIsError = signal(false);
  protected readonly today = new Date().toISOString().slice(0, 10);

  protected readonly form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    lastName: ['', [Validators.required, Validators.maxLength(100)]],
    dateOfBirth: ['', Validators.required],
    joiningDate: ['', Validators.required],
    dialCode: ['', Validators.required],
    phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9 \-()]{7,20}$/)]],
    email: ['', [Validators.required, Validators.email]],
    teamId: [0, Validators.min(1)],
    companyId: [0, Validators.min(1)],
  });

  ngOnInit(): void {
    this.lookupApi.lookups().subscribe({
      next: (lookups) => {
        this.teams.set(lookups.teams);
        this.companies.set(lookups.companies);
      },
    });
    this.api.profile().subscribe({
      next: (p) => {
        this.form.patchValue({
          firstName: p.firstName,
          lastName: p.lastName,
          dateOfBirth: p.dateOfBirth ?? '',
          joiningDate: p.joiningDate ?? '',
          dialCode: p.phoneDialCode ?? '',
          phoneNumber: p.phoneNumber ?? '',
          email: p.email,
          teamId: p.teamId ?? 0,
          companyId: p.companyId ?? 0,
        });
        this.loading.set(false);
      },
      error: (error) => {
        this.fail(errorMessage(error));
        this.loading.set(false);
      },
    });
  }

  onTeamChange(): void {
    const team = this.teams().find((t) => t.id === Number(this.form.controls.teamId.value));
    if (team) {
      this.form.controls.dialCode.setValue(team.extra ?? '');
    }
  }

  showError(name: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[name];
    return control.invalid && (control.touched || control.dirty);
  }

  saveChanges(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.fail('Please fix the highlighted fields.');
      return;
    }

    const v = this.form.getRawValue();
    this.saving.set(true);
    this.api
      .updateProfile({
        firstName: v.firstName.trim(),
        lastName: v.lastName.trim(),
        dateOfBirth: v.dateOfBirth || null,
        joiningDate: v.joiningDate || null,
        phoneDialCode: v.dialCode,
        phoneNumber: v.phoneNumber.trim(),
        email: v.email.trim(),
        teamId: Number(v.teamId) || null,
        companyId: Number(v.companyId) || null,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.statusIsError.set(false);
          this.statusMessage.set('Your profile has been updated.');
        },
        error: (error) => {
          this.saving.set(false);
          this.fail(errorMessage(error));
        },
      });
  }

  private fail(message: string): void {
    this.statusIsError.set(true);
    this.statusMessage.set(message);
  }
}
