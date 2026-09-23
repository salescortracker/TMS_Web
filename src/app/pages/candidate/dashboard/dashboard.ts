import { Component } from '@angular/core';
import { ClockCard } from '../clock-card/clock-card';

type DayStatus = 'Draft' | 'Not entered' | 'Upcoming';

interface DayCard {
  day: string;
  date: string;
  status: DayStatus;
  hours?: string;
  task?: string;
  isToday?: boolean;
}

const DAY_CARDS: DayCard[] = [
  { day: 'Mon', date: 'Sep 21', status: 'Draft', hours: '7 hrs', task: 'Meeting' },
  { day: 'Tue', date: 'Sep 22', status: 'Draft', hours: '8 hrs', task: 'Development' },
  { day: 'Wed', date: 'Sep 23', status: 'Not entered', isToday: true },
  { day: 'Thu', date: 'Sep 24', status: 'Upcoming' },
  { day: 'Fri', date: 'Sep 25', status: 'Upcoming' },
];

const WEEK_TARGET_HOURS = 40;
const WEEK_LOGGED_HOURS = 15;

@Component({
  imports: [ClockCard],
  selector: 'app-candidate-dashboard',
  templateUrl: './dashboard.html',
})
export class Dashboard {
  protected readonly dayCards = DAY_CARDS;
  protected readonly weekTargetHours = WEEK_TARGET_HOURS;
  protected readonly weekLoggedHours = WEEK_LOGGED_HOURS;
  protected readonly weekProgressPercent = Math.round(
    (WEEK_LOGGED_HOURS / WEEK_TARGET_HOURS) * 100,
  );

  protected readonly submittedThisWeek = 0;
  protected readonly pendingApproval = 0;
  protected readonly approvedThisWeek = 0;
  protected readonly rejectedThisWeek = 0;
  protected readonly draftsCount = 2;
}
