import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { errorMessage } from '../shared/api/api-helpers';
import { LookupItem, PublicApi } from '../shared/api/public.api';
import { APPROVERS } from '../shared/reference-data';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-onboarding',
  templateUrl: './onboarding.html',
})
export class Onboarding implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(PublicApi);

  protected readonly approvers = APPROVERS;
  protected readonly teams = signal<LookupItem[]>([]);
  protected readonly companies = signal<LookupItem[]>([]);
  protected readonly statusMessage = signal('');
  protected readonly statusIsError = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly isDone = signal(false);
  protected readonly today = new Date().toISOString().slice(0, 10);

  protected readonly form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    lastName: ['', [Validators.required, Validators.maxLength(100)]],
    dateOfBirth: ['', Validators.required],
    joiningDate: ['', Validators.required],
    teamId: [0, [Validators.required, Validators.min(1)]],
    companyId: [0, [Validators.required, Validators.min(1)]],
    dialCode: ['', Validators.required],
    phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9 \-()]{7,20}$/)]],
    email: ['', [Validators.required, Validators.email]],
  });

  ngOnInit(): void {
    this.api.lookups().subscribe({
      next: (lookups) => {
        this.teams.set(lookups.teams);
        this.companies.set(lookups.companies);
        this.form.patchValue({
          teamId: lookups.teams[0]?.id ?? 0,
          companyId: lookups.companies[0]?.id ?? 0,
          dialCode: lookups.teams[0]?.extra ?? '',
        });
      },
      error: (error) => this.fail(errorMessage(error)),
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

  saveDraft(): void {
    const { firstName, lastName, email } = this.form.controls;
    if (firstName.invalid || lastName.invalid || email.invalid) {
      [firstName, lastName, email].forEach((control) => control.markAsTouched());
      this.fail('Enter at least your name and a valid email to save a draft.');
      return;
    }
    this.send(false);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.fail('Please fix the highlighted fields before submitting.');
      return;
    }
    this.send(true);
  }

  private send(submitForApproval: boolean): void {
    const v = this.form.getRawValue();
    this.isSaving.set(true);
    this.statusMessage.set('');
    this.api
      .submitCandidate({
        firstName: v.firstName.trim(),
        lastName: v.lastName.trim(),
        dateOfBirth: v.dateOfBirth || null,
        joiningDate: v.joiningDate || null,
        teamId: Number(v.teamId) || null,
        companyId: Number(v.companyId) || null,
        phoneDialCode: v.dialCode,
        phoneNumber: v.phoneNumber.trim() || null,
        email: v.email.trim(),
        submitForApproval,
      })
      .subscribe({
        next: (result) => {
          this.isSaving.set(false);
          this.statusIsError.set(false);
          this.statusMessage.set(result.message);
          this.isDone.set(submitForApproval);
        },
        error: (error) => {
          this.isSaving.set(false);
          this.fail(errorMessage(error));
        },
      });
  }

  private fail(message: string): void {
    this.statusIsError.set(true);
    this.statusMessage.set(message);
  }
}
