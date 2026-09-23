import { Component, computed, signal } from '@angular/core';

type LogCategory = 'Submissions' | 'Approvals' | 'Edits & roles' | 'Alerts';
type LogFilter = LogCategory | 'Everything';
type LogTone = 'success' | 'warning' | 'danger' | 'neutral';
type LogTab = 'Activity' | 'Email alerts';

interface ActivityEntry {
  actor: string;
  action: string;
  description: string;
  timestamp: string;
  tone: LogTone;
  category: LogCategory;
}

interface EmailAlert {
  recipient: string;
  subject: string;
  timestamp: string;
}

const FILTERS: LogFilter[] = ['Everything', 'Submissions', 'Approvals', 'Edits & roles', 'Alerts'];

const ACTIVITY: ActivityEntry[] = [
  {
    actor: 'Wei Chen',
    action: 'exceeded a 1-hour break on Wednesday',
    description: 'Break logged as 1h 15m. The candidate and Srikanth were alerted automatically.',
    timestamp: 'Sep 23, 4:15 PM',
    tone: 'danger',
    category: 'Alerts',
  },
  {
    actor: 'Srikanth Boora',
    action: "edited Jordan Alvarez's timesheet",
    description: 'Tuesday log-out changed from 05:00 PM to 05:30 PM.',
    timestamp: 'Sep 23, 3:17 PM',
    tone: 'warning',
    category: 'Edits & roles',
  },
  {
    actor: 'Mateo Fernandez',
    action: 'saved this week as a draft',
    description: '32 hrs logged so far, not yet submitted.',
    timestamp: 'Sep 23, 1:27 PM',
    tone: 'neutral',
    category: 'Submissions',
  },
  {
    actor: 'Priya Natarajan',
    action: "submitted this week's timesheet",
    description: '40 hrs across 5 days, no flags.',
    timestamp: 'Sep 22, 2:27 PM',
    tone: 'success',
    category: 'Submissions',
  },
  {
    actor: 'Naresh Kumar',
    action: 'approved candidate Priya Natarajan',
    description: 'Onboarding approved.',
    timestamp: 'Sep 22, 10:27 AM',
    tone: 'success',
    category: 'Approvals',
  },
  {
    actor: 'Vijay Mohan',
    action: 'viewed the HR roster',
    description: '',
    timestamp: 'Sep 21, 4:27 PM',
    tone: 'neutral',
    category: 'Edits & roles',
  },
  {
    actor: 'Naresh Kumar',
    action: 'rejected candidate "qwerty asdf"',
    description: 'Suspicious registration (temporary email domain).',
    timestamp: 'Sep 20, 4:27 PM',
    tone: 'danger',
    category: 'Approvals',
  },
];

const EMAIL_ALERTS: EmailAlert[] = [
  {
    recipient: 'Wei Chen',
    subject: 'Your break exceeded 1 hour on Wednesday',
    timestamp: 'Sep 23, 4:15 PM',
  },
  {
    recipient: 'Srikanth Boora',
    subject: "Timesheet edited for Jordan Alvarez",
    timestamp: 'Sep 23, 3:17 PM',
  },
  {
    recipient: '"qwerty asdf"',
    subject: 'Your onboarding request was not approved',
    timestamp: 'Sep 20, 4:27 PM',
  },
];

@Component({
  imports: [],
  selector: 'app-activity-log',
  templateUrl: './activity-log.html',
})
export class ActivityLog {
  protected readonly filters = FILTERS;
  protected readonly activity = ACTIVITY;
  protected readonly emailAlerts = EMAIL_ALERTS;

  protected readonly tab = signal<LogTab>('Activity');
  protected readonly activeFilter = signal<LogFilter>('Everything');
  protected readonly searchQuery = signal('');

  protected readonly filteredActivity = computed(() => {
    const filter = this.activeFilter();
    const query = this.searchQuery().trim().toLowerCase();

    return this.activity.filter((entry) => {
      const matchesFilter = filter === 'Everything' || entry.category === filter;
      const matchesQuery =
        !query ||
        entry.actor.toLowerCase().includes(query) ||
        entry.action.toLowerCase().includes(query) ||
        entry.description.toLowerCase().includes(query);
      return matchesFilter && matchesQuery;
    });
  });

  setTab(tab: LogTab): void {
    this.tab.set(tab);
  }

  setFilter(filter: LogFilter): void {
    this.activeFilter.set(filter);
  }

  onSearchInput(value: string): void {
    this.searchQuery.set(value);
  }
}
