import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ClockCard } from '../clock-card/clock-card';

type DayStatus = 'Draft' | 'Not entered' | 'Upcoming' | 'Saved' | 'Pending' | 'Approved' | 'Rejected';

interface TimesheetDay {
  day: string;
  date: string;
  logIn: string;
  logOut: string;
  breakMinutes: number;
  task: string;
  description: string;
  status: DayStatus;
  editable: boolean;
}

const WEEK_LABEL = 'Week of Sep 21 – Sep 27, 2026';
const WEEK_TARGET_HOURS = 40;

const SEED_DAYS: TimesheetDay[] = [
  {
    day: 'Monday',
    date: 'Sep 21',
    logIn: '09:00',
    logOut: '16:30',
    breakMinutes: 30,
    task: 'Meeting',
    description: 'Sprint demo and requirement clarification with the client.',
    status: 'Draft',
    editable: true,
  },
  {
    day: 'Tuesday',
    date: 'Sep 22',
    logIn: '09:00',
    logOut: '17:30',
    breakMinutes: 30,
    task: 'Development',
    description: 'Built REST endpoints for the timesheet approval workflow.',
    status: 'Draft',
    editable: true,
  },
  {
    day: 'Wednesday',
    date: 'Sep 23',
    logIn: '',
    logOut: '',
    breakMinutes: 0,
    task: '',
    description: '',
    status: 'Not entered',
    editable: true,
  },
  {
    day: 'Thursday',
    date: 'Sep 24',
    logIn: '',
    logOut: '',
    breakMinutes: 0,
    task: '',
    description: '',
    status: 'Upcoming',
    editable: false,
  },
  {
    day: 'Friday',
    date: 'Sep 25',
    logIn: '',
    logOut: '',
    breakMinutes: 0,
    task: '',
    description: '',
    status: 'Upcoming',
    editable: false,
  },
  {
    day: 'Saturday',
    date: 'Sep 26',
    logIn: '',
    logOut: '',
    breakMinutes: 0,
    task: '',
    description: '',
    status: 'Upcoming',
    editable: false,
  },
  {
    day: 'Sunday',
    date: 'Sep 27',
    logIn: '',
    logOut: '',
    breakMinutes: 0,
    task: '',
    description: '',
    status: 'Upcoming',
    editable: false,
  },
];

const DECIDED_STATUSES: DayStatus[] = ['Pending', 'Approved', 'Rejected'];

@Component({
  imports: [ClockCard, RouterLink],
  selector: 'app-my-timesheet',
  templateUrl: './my-timesheet.html',
})
export class MyTimesheet {
  protected readonly weekLabel = WEEK_LABEL;
  protected readonly weekTargetHours = WEEK_TARGET_HOURS;
  protected readonly days = signal<TimesheetDay[]>(SEED_DAYS);

  protected readonly approvedCount = computed(
    () => this.days().filter((day) => day.status === 'Approved').length,
  );
  protected readonly pendingCount = computed(
    () => this.days().filter((day) => day.status === 'Pending').length,
  );
  protected readonly rejectedCount = computed(
    () => this.days().filter((day) => day.status === 'Rejected').length,
  );
  protected readonly savedCount = computed(
    () => this.days().filter((day) => day.status === 'Saved').length,
  );
  protected readonly draftCount = computed(
    () => this.days().filter((day) => day.status === 'Draft').length,
  );

  protected readonly weekLoggedHours = computed(() =>
    this.days().reduce((total, day) => total + this.hoursFor(day), 0),
  );

  protected readonly weekProgressPercent = computed(() =>
    Math.min(100, Math.round((this.weekLoggedHours() / this.weekTargetHours) * 100)),
  );

  protected readonly readyToSubmitCount = computed(
    () => this.days().filter((day) => this.isReadyToSubmit(day)).length,
  );

  hoursFor(day: TimesheetDay): number {
    if (!day.logIn || !day.logOut) {
      return 0;
    }
    const [inHour, inMinute] = day.logIn.split(':').map(Number);
    const [outHour, outMinute] = day.logOut.split(':').map(Number);
    const minutes = outHour * 60 + outMinute - (inHour * 60 + inMinute) - day.breakMinutes;
    return minutes > 0 ? minutes / 60 : 0;
  }

  hoursDisplay(day: TimesheetDay): string {
    if (!day.logIn || !day.logOut) {
      return '—';
    }
    return this.hoursFor(day).toFixed(2);
  }

  isReadyToSubmit(day: TimesheetDay): boolean {
    return (
      day.editable &&
      !DECIDED_STATUSES.includes(day.status) &&
      day.logIn !== '' &&
      day.logOut !== '' &&
      day.task.trim() !== '' &&
      day.description.trim() !== ''
    );
  }

  updateDay<K extends keyof TimesheetDay>(index: number, field: K, value: TimesheetDay[K]): void {
    this.days.update((days) =>
      days.map((day, i) => (i === index ? { ...day, [field]: value } : day)),
    );
  }

  submitDay(index: number): void {
    this.days.update((days) =>
      days.map((day, i) =>
        i === index && this.isReadyToSubmit(day) ? { ...day, status: 'Pending' } : day,
      ),
    );
  }

  saveAsDraft(): void {
    this.days.update((days) =>
      days.map((day) =>
        day.editable && !DECIDED_STATUSES.includes(day.status) && (day.logIn || day.task)
          ? { ...day, status: 'Draft' }
          : day,
      ),
    );
  }

  save(): void {
    this.days.update((days) =>
      days.map((day) =>
        this.isReadyToSubmit(day)
          ? { ...day, status: 'Saved' }
          : day.editable && !DECIDED_STATUSES.includes(day.status) && (day.logIn || day.task)
            ? { ...day, status: 'Draft' }
            : day,
      ),
    );
  }

  hintFor(day: TimesheetDay): string {
    switch (day.status) {
      case 'Pending':
        return 'Submitted — waiting for your manager to approve.';
      case 'Approved':
        return 'Approved by your manager.';
      case 'Rejected':
        return 'Rejected — edit and resubmit.';
      case 'Saved':
        return "Saved. Click Submit when you're ready.";
      default:
        return day.editable
          ? 'Not submitted yet. You can keep editing until you submit this day.'
          : 'Future days can be submitted once the day has happened.';
    }
  }

  submitReady(): void {
    this.days.update((days) =>
      days.map((day) => (this.isReadyToSubmit(day) ? { ...day, status: 'Pending' } : day)),
    );
  }
}
