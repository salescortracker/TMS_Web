import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { errorMessage } from '../../../shared/api/api-helpers';
import { CandidateApi, HistoryWeek } from '../../../shared/api/candidate.api';

@Component({
  imports: [RouterLink],
  selector: 'app-my-history',
  templateUrl: './my-history.html',
})
export class MyHistory implements OnInit {
  private readonly api = inject(CandidateApi);

  protected readonly weeks = signal<HistoryWeek[]>([]);
  protected readonly loading = signal(true);
  protected readonly errorText = signal('');

  ngOnInit(): void {
    this.api.history().subscribe({
      next: (weeks) => {
        this.weeks.set(weeks);
        this.loading.set(false);
      },
      error: (error) => {
        this.errorText.set(errorMessage(error));
        this.loading.set(false);
      },
    });
  }
}
