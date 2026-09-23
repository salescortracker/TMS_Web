import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

type BadgeTone = 'success' | 'warning' | 'danger' | 'neutral';

interface WeekBadge {
  label: string;
  tone: BadgeTone;
}

interface WeekHistory {
  weekLabel: string;
  hours: string;
  badges: WeekBadge[];
  isCurrent?: boolean;
}

const WEEK_HISTORY: WeekHistory[] = [
  {
    weekLabel: 'Sep 21 – Sep 27, 2026',
    hours: '15 hrs',
    badges: [
      { label: '0 approved', tone: 'success' },
      { label: '2 drafts', tone: 'neutral' },
    ],
    isCurrent: true,
  },
  {
    weekLabel: 'Sep 14 – Sep 20, 2026',
    hours: '37 hrs',
    badges: [{ label: '5 approved', tone: 'success' }],
  },
  {
    weekLabel: 'Sep 7 – Sep 13, 2026',
    hours: '38 hrs',
    badges: [{ label: '5 approved', tone: 'success' }],
  },
  {
    weekLabel: 'Aug 31 – Sep 6, 2026',
    hours: '37.5 hrs',
    badges: [{ label: '5 approved', tone: 'success' }],
  },
  {
    weekLabel: 'Aug 24 – Aug 30, 2026',
    hours: '37 hrs',
    badges: [{ label: '5 approved', tone: 'success' }],
  },
  {
    weekLabel: 'Aug 17 – Aug 23, 2026',
    hours: '38 hrs',
    badges: [{ label: '5 approved', tone: 'success' }],
  },
];

@Component({
  imports: [RouterLink],
  selector: 'app-my-history',
  templateUrl: './my-history.html',
})
export class MyHistory {
  protected readonly weeks = WEEK_HISTORY;
}
