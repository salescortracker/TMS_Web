import { Component, OnDestroy, OnInit, computed, inject, output, signal } from '@angular/core';
import { errorMessage } from '../../../shared/api/api-helpers';
import { CandidateApi, ClockState } from '../../../shared/api/candidate.api';

@Component({
  imports: [],
  selector: 'app-clock-card',
  templateUrl: './clock-card.html',
})
export class ClockCard implements OnInit, OnDestroy {
  private readonly api = inject(CandidateApi);
  private readonly now = signal(new Date());
  private readonly tickHandle = setInterval(() => this.now.set(new Date()), 1000);

  /** Tells the parent page to refresh its numbers after a clock action. */
  readonly changed = output<void>();

  protected readonly state = signal<ClockState | null>(null);
  protected readonly busy = signal(false);
  protected readonly errorText = signal('');

  private readonly zone = computed(() => this.state()?.timeZoneId ?? undefined);

  protected readonly status = computed(() => this.state()?.status ?? 'NotClockedIn');

  protected readonly statusLabel = computed(() => {
    switch (this.status()) {
      case 'Working':
        return 'Clocked in';
      case 'OnBreak':
        return 'On break';
      case 'ClockedOut':
        return 'Clocked out';
      default:
        return 'Not clocked in';
    }
  });

  protected readonly formattedDate = computed(() =>
    this.now().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: this.zone(),
    }),
  );

  protected readonly formattedTime = computed(() =>
    this.now().toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      timeZone: this.zone(),
    }),
  );

  protected readonly clockInDisplay = computed(() => this.formatClock(this.state()?.clockInAt));
  protected readonly clockOutDisplay = computed(() => this.formatClock(this.state()?.clockOutAt));

  protected readonly breakDisplay = computed(() => {
    const s = this.state();
    if (!s) {
      return '0m';
    }
    let minutes = s.breakMinutes;
    if (s.onBreakSince) {
      minutes += Math.max(0, Math.floor((this.now().getTime() - this.asUtc(s.onBreakSince)) / 60000));
    }
    return this.formatMinutes(minutes);
  });

  protected readonly workedSoFarDisplay = computed(() => {
    const s = this.state();
    if (!s?.clockInAt) {
      return '0m';
    }
    if (s.status === 'ClockedOut') {
      return this.formatMinutes(s.workedMinutes);
    }
    const end = s.onBreakSince ? this.asUtc(s.onBreakSince) : this.now().getTime();
    const total = Math.max(0, Math.floor((end - this.asUtc(s.clockInAt)) / 60000));
    return this.formatMinutes(Math.max(0, total - s.breakMinutes));
  });

  ngOnInit(): void {
    this.api.clock().subscribe({
      next: (state) => this.state.set(state),
      error: (error) => this.errorText.set(errorMessage(error)),
    });
  }

  ngOnDestroy(): void {
    clearInterval(this.tickHandle);
  }

  clock(action: 'in' | 'out' | 'break-start' | 'break-end'): void {
    this.busy.set(true);
    this.errorText.set('');
    this.api.clockAction(action).subscribe({
      next: (state) => {
        this.state.set(state);
        this.busy.set(false);
        this.changed.emit();
      },
      error: (error) => {
        this.busy.set(false);
        this.errorText.set(errorMessage(error));
      },
    });
  }

  // The API sends UTC timestamps without a "Z"; treat them as UTC.
  private asUtc(value: string): number {
    return new Date(/[zZ]|[+-]\d\d:\d\d$/.test(value) ? value : value + 'Z').getTime();
  }

  private formatClock(value: string | null | undefined): string {
    if (!value) {
      return '—';
    }
    return new Date(this.asUtc(value)).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: this.zone(),
    });
  }

  private formatMinutes(total: number): string {
    const hours = Math.floor(total / 60);
    const minutes = total % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  }
}
