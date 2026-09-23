import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { APPROVERS, TEAM_OPTIONS } from '../shared/reference-data';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-register-manager',
  templateUrl: './register-manager.html',
})
export class RegisterManager {
  private readonly fb = inject(FormBuilder);

  protected readonly teamOptions = TEAM_OPTIONS;
  protected readonly approvers = APPROVERS;
  protected readonly seatsAvailable = 8;
  protected readonly seatsTotal = 10;
  protected readonly statusMessage = signal('');

  protected readonly form = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    team: [this.teamOptions[0].value, Validators.required],
    companyName: ['Cortracker Inc', Validators.required],
    dialCode: [this.teamOptions[0].dialCode, Validators.required],
    phoneNumber: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
  });

  onTeamChange(): void {
    const selectedTeam = this.teamOptions.find(
      (team) => team.value === this.form.controls.team.value,
    );
    if (selectedTeam) {
      this.form.controls.dialCode.setValue(selectedTeam.dialCode);
    }
  }

  saveDraft(): void {
    this.statusMessage.set('Draft saved. You can come back and finish this anytime.');
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.statusMessage.set('Please fill in all required fields before submitting.');
      return;
    }

    this.statusMessage.set('Submitted for approval. You will get an email once it is reviewed.');
  }
}
