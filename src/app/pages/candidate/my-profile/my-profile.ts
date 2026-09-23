import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TEAM_OPTIONS } from '../../../shared/reference-data';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-my-profile',
  templateUrl: './my-profile.html',
})
export class MyProfile {
  private readonly fb = inject(FormBuilder);

  protected readonly teamOptions = TEAM_OPTIONS;
  protected readonly statusMessage = signal('');

  protected readonly form = this.fb.nonNullable.group({
    firstName: ['Candidate', Validators.required],
    lastName: ['Demo', Validators.required],
    dateOfBirth: ['04/12/1996', Validators.required],
    joiningDate: ['03/03/2025', Validators.required],
    dialCode: [this.teamOptions[0].dialCode, Validators.required],
    phoneNumber: ['234-567-8910', Validators.required],
    email: ['candidate.demo@cortracker360.com', [Validators.required, Validators.email]],
    team: [this.teamOptions[0].value, Validators.required],
    companyName: ['Cortracker Inc', Validators.required],
  });

  onTeamChange(): void {
    const selectedTeam = this.teamOptions.find(
      (team) => team.value === this.form.controls.team.value,
    );
    if (selectedTeam) {
      this.form.controls.dialCode.setValue(selectedTeam.dialCode);
    }
  }

  saveChanges(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.statusMessage.set('Please fill in all required fields.');
      return;
    }

    this.statusMessage.set('Your profile has been updated.');
  }
}
