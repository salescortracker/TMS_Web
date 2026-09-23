import { Component, OnDestroy, computed, signal } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-clock-card',
  templateUrl: './clock-card.html',
})
export class ClockCard implements OnDestroy {
  private readonly demoOffsetMs = signal(0);
  private readonly now = signal(new Date());
  private readonly tickHandle = setInterval(() => this.now.set(new Date()), 1000);

  protected readonly displayNow = computed(
    () => new Date(this.now().getTime() + this.demoOffsetMs()),
  );

  protected readonly clockInAt = signal<Date | null>(null);
  protected readonly clockOutAt = signal<Date | null>(null);

  protected readonly isClockedIn = computed(
    () => this.clockInAt() !== null && this.clockOutAt() === null,
  );

  protected readonly statusLabel = computed(() => {
    if (this.clockOutAt()) {
      return 'Clocked out';
    }
    return this.isClockedIn() ? 'Clocked in' : 'Not clocked in';
  });

  protected readonly clockButtonLabel = computed(() =>
    this.isClockedIn() ? 'Clock out' : 'Clock in',
  );

  protected readonly formattedDate = computed(() =>
    this.displayNow().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
  );

  protected readonly formattedTime = computed(() =>
    this.displayNow().toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
    }),
  );

  protected readonly clockInDisplay = computed(() => this.formatClockTime(this.clockInAt()));
  protected readonly clockOutDisplay = computed(() => this.formatClockTime(this.clockOutAt()));

  protected readonly workedSoFarDisplay = computed(() => {
    const start = this.clockInAt();
    if (!start) {
      return '0m';
    }
    const end = this.clockOutAt() ?? this.displayNow();
    return this.formatDuration(end.getTime() - start.getTime());
  });

  ngOnDestroy(): void {
    clearInterval(this.tickHandle);
  }

  toggleClock(): void {
    if (this.isClockedIn()) {
      this.clockOutAt.set(this.displayNow());
      return;
    }
    this.clockInAt.set(this.displayNow());
    this.clockOutAt.set(null);
  }

  skipAhead15Minutes(): void {
    this.demoOffsetMs.update((ms) => ms + 15 * 60 * 1000);
  }

  private formatClockTime(date: Date | null): string {
    if (!date) {
      return '—';
    }
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }

  private formatDuration(ms: number): string {
    const totalMinutes = Math.max(0, Math.floor(ms / 60000));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  }
}
