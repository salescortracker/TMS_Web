import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable, concat, last, of } from 'rxjs';
import { errorMessage } from '../../../shared/api/api-helpers';
import { CandidateApi, Day, Week } from '../../../shared/api/candidate.api';
import { ClockCard } from '../clock-card/clock-card';

const DECIDED = ['Pending', 'Approved', 'Rejected'];

@Component({
  imports: [ClockCard, RouterLink],
  selector: 'app-my-timesheet',
  templateUrl: './my-timesheet.html',
})
export class MyTimesheet implements OnInit {
  private readonly api = inject(CandidateApi);
  private readonly route = inject(ActivatedRoute);

  protected readonly week = signal<Week | null>(null);
  protected readonly days = signal<Day[]>([]);
  protected readonly dirty = signal<Set<string>>(new Set());
  protected readonly rowErrors = signal<Record<string, string>>({});
  protected readonly loading = signal(true);
  protected readonly busy = signal(false);
  protected readonly errorText = signal('');
  protected readonly infoText = signal('');

  protected readonly weekLoggedHours = computed(() =>
    this.days().reduce((total, day) => total + this.hoursFor(day), 0),
  );

  protected readonly weekProgressPercent = computed(() => {
    const target = this.week()?.targetHours ?? 40;
    return Math.min(100, Math.round((this.weekLoggedHours() / target) * 100));
  });

  protected readonly readyToSubmitCount = computed(
    () => this.days().filter((day) => this.isReadyToSubmit(day)).length,
  );

  protected count(status: string): number {
    return this.days().filter((day) => day.status === status).length;
  }

  ngOnInit(): void {
    this.load(this.route.snapshot.queryParamMap.get('week'));
  }

  load(weekStart: string | null): void {
    this.loading.set(true);
    this.errorText.set('');
    this.api.week(weekStart).subscribe({
      next: (week) => {
        this.week.set(week);
        this.days.set(week.days);
        this.dirty.set(new Set());
        this.rowErrors.set({});
        this.loading.set(false);
      },
      error: (error) => {
        this.errorText.set(errorMessage(error));
        this.loading.set(false);
      },
    });
  }

  shiftWeek(offsetWeeks: number): void {
    const current = this.week();
    if (!current) {
      return;
    }
    const date = new Date(current.weekStart + 'T00:00:00');
    date.setDate(date.getDate() + offsetWeeks * 7);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    this.load(`${y}-${m}-${d}`);
  }

  // ---------- live calculations ----------

  hoursFor(day: Day): number {
    if (!day.logIn || !day.logOut) {
      return 0;
    }
    const [inHour, inMinute] = day.logIn.split(':').map(Number);
    const [outHour, outMinute] = day.logOut.split(':').map(Number);
    const minutes = outHour * 60 + outMinute - (inHour * 60 + inMinute) - (day.breakMinutes || 0);
    return minutes > 0 ? minutes / 60 : 0;
  }

  hoursDisplay(day: Day): string {
    return day.logIn && day.logOut ? this.hoursFor(day).toFixed(2) : '—';
  }

  /** Returns the first problem with a day, or null when it can be submitted. */
  problemWith(day: Day): string | null {
    if (!day.logIn || !day.logOut) {
      return 'Enter both log-in and log-out.';
    }
    if (day.logOut <= day.logIn) {
      return 'Log-out must be after log-in.';
    }
    if (day.breakMinutes < 0 || day.breakMinutes > 600) {
      return 'Break must be between 0 and 600 minutes.';
    }
    if (!day.task.trim()) {
      return 'Task is required.';
    }
    if (day.task.trim().length > 80) {
      return 'Task can be at most 80 characters.';
    }
    const length = day.description.trim().length;
    if (length < 10 || length > 500) {
      return 'Description needs 10 to 500 characters.';
    }
    return null;
  }

  isReadyToSubmit(day: Day): boolean {
    return day.editable && !DECIDED.includes(day.status) && this.problemWith(day) === null;
  }

  canEdit(day: Day): boolean {
    return day.editable && day.status !== 'Pending' && day.status !== 'Approved';
  }

  hasContent(day: Day): boolean {
    return !!(day.logIn || day.logOut || day.task || day.description);
  }

  // ---------- editing ----------

  updateDay<K extends keyof Day>(date: string, field: K, value: Day[K]): void {
    this.days.update((days) => days.map((day) => (day.date === date ? { ...day, [field]: value } : day)));
    this.dirty.update((set) => new Set(set).add(date));
    this.setRowError(date, null);
  }

  private setRowError(date: string, message: string | null): void {
    this.rowErrors.update((errors) => {
      const next = { ...errors };
      if (message) {
        next[date] = message;
      } else {
        delete next[date];
      }
      return next;
    });
  }

  private saveRequest(day: Day, saveAs: 'Draft' | 'Saved') {
    return this.api.saveDay(day.date, {
      logIn: day.logIn || null,
      logOut: day.logOut || null,
      breakMinutes: Number(day.breakMinutes) || 0,
      task: day.task || null,
      description: day.description || null,
      saveAs,
    });
  }

  private replaceDay(updated: Day): void {
    this.days.update((days) => days.map((day) => (day.date === updated.date ? updated : day)));
    this.dirty.update((set) => {
      const next = new Set(set);
      next.delete(updated.date);
      return next;
    });
  }

  private reloadSummary(): void {
    this.api.week(this.week()?.weekStart).subscribe({
      next: (week) => this.week.set({ ...week }),
    });
  }

  // ---------- actions ----------

  submitDay(day: Day): void {
    const problem = this.problemWith(day);
    if (problem) {
      this.setRowError(day.date, problem);
      return;
    }
    this.busy.set(true);
    this.infoText.set('');
    const save$: Observable<unknown> = this.dirty().has(day.date) ? this.saveRequest(day, 'Saved') : of(day);
    save$.subscribe({
      next: () => {
        this.api.submitDay(day.date).subscribe({
          next: (updated) => {
            this.replaceDay(updated);
            this.busy.set(false);
            this.infoText.set(`${day.dayName} submitted for approval.`);
            this.reloadSummary();
          },
          error: (error) => this.failRow(day.date, error),
        });
      },
      error: (error) => this.failRow(day.date, error),
    });
  }

  saveAll(asDraft: boolean): void {
    const toSave = this.days().filter(
      (day) => this.dirty().has(day.date) && this.canEdit(day) && this.hasContent(day),
    );
    if (toSave.length === 0) {
      this.infoText.set('Nothing new to save.');
      return;
    }
    this.busy.set(true);
    this.infoText.set('');
    this.errorText.set('');
    const requests = toSave.map((day) => {
      const saveAs = !asDraft && this.problemWith(day) === null ? 'Saved' : 'Draft';
      return this.saveRequest(day, saveAs);
    });
    concat(...requests)
      .pipe(last())
      .subscribe({
        next: () => {
          this.busy.set(false);
          this.infoText.set(asDraft ? 'Saved as draft.' : 'Saved.');
          this.load(this.week()?.weekStart ?? null);
        },
        error: (error) => {
          this.busy.set(false);
          this.errorText.set(errorMessage(error));
        },
      });
  }

  submitReady(): void {
    const ready = this.days().filter((day) => this.isReadyToSubmit(day));
    if (ready.length === 0) {
      this.errorText.set('No day is ready yet. Fill in log-in, log-out, task and a description.');
      return;
    }
    this.busy.set(true);
    this.errorText.set('');
    this.infoText.set('');
    const saves = ready.filter((day) => this.dirty().has(day.date)).map((day) => this.saveRequest(day, 'Saved'));
    const saved$: Observable<unknown> = saves.length ? concat(...saves).pipe(last()) : of(null);
    saved$.subscribe({
      next: () => {
        this.api.submitReady(this.week()?.weekStart).subscribe({
          next: (result) => {
            this.busy.set(false);
            this.infoText.set(
              `${result.submitted} day(s) submitted.` +
                (result.skipped.length ? ` Skipped: ${result.skipped.join('; ')}` : ''),
            );
            this.load(this.week()?.weekStart ?? null);
          },
          error: (error) => {
            this.busy.set(false);
            this.errorText.set(errorMessage(error));
          },
        });
      },
      error: (error) => {
        this.busy.set(false);
        this.errorText.set(errorMessage(error));
      },
    });
  }

  private failRow(date: string, error: unknown): void {
    this.busy.set(false);
    this.setRowError(date, errorMessage(error));
  }

  hintFor(day: Day): string {
    switch (day.status) {
      case 'Pending':
        return 'Submitted — waiting for your manager to approve.';
      case 'Approved':
        return 'Approved by your manager.';
      case 'Rejected':
        return 'Rejected' + (day.rejectionReason ? `: ${day.rejectionReason}` : '') + ' — edit and resubmit.';
      case 'Saved':
        return "Saved. Click Submit when you're ready.";
      default:
        return day.editable
          ? 'Not submitted yet. You can keep editing until you submit this day.'
          : 'Future days can be submitted once the day has happened.';
    }
  }
}
