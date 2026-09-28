import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { errorMessage } from '../../../shared/api/api-helpers';
import { CandidateApi, CandidateDashboard } from '../../../shared/api/candidate.api';
import { ClockCard } from '../clock-card/clock-card';

@Component({
  imports: [ClockCard, RouterLink],
  selector: 'app-candidate-dashboard',
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  private readonly api = inject(CandidateApi);

  protected readonly data = signal<CandidateDashboard | null>(null);
  protected readonly loading = signal(true);
  protected readonly errorText = signal('');

  protected readonly progressPercent = computed(() => {
    const d = this.data();
    return d && d.weekTargetHours > 0
      ? Math.min(100, Math.round((d.weekLoggedHours / d.weekTargetHours) * 100))
      : 0;
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.api.dashboard().subscribe({
      next: (data) => {
        this.data.set(data);
        this.loading.set(false);
      },
      error: (error) => {
        this.errorText.set(errorMessage(error));
        this.loading.set(false);
      },
    });
  }
}
