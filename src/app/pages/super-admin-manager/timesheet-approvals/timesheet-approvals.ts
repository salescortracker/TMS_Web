import { Component, computed, signal } from '@angular/core';

type EntryChecks = 'Clean' | 'Flagged';
type EntryDecision = 'Pending' | 'Approved' | 'Rejected';
type FilterTab = EntryDecision | 'Flagged' | 'All';

interface TimesheetEntry {
  id: string;
  candidate: string;
  email: string;
  team: string;
  company: string;
  day: string;
  timeRange: string;
  task: string;
  description: string;
  hours: string;
  weekProgress: string;
  checks: EntryChecks;
  flagReason?: string;
  decision: EntryDecision;
}

const SEED_ENTRIES: TimesheetEntry[] = [
  {
    id: 'jordan-wed',
    candidate: 'Jordan Alvarez',
    email: 'jordan.alvarez2@cortracker360.com',
    team: 'USA team',
    company: 'Cortracker Inc',
    day: 'Wed, Sep 23',
    timeRange: '09:00 AM – 04:30 PM',
    task: 'Testing / QA',
    description: 'Wrote and ran regression tests for the reports module.',
    hours: '7 hrs',
    weekProgress: 'Week 22.5 / 40',
    checks: 'Clean',
    decision: 'Pending',
  },
  {
    id: 'lena-wed',
    candidate: 'Lena Kowalski',
    email: 'lena.k@perfectsolutionsgroup.com',
    team: 'USA team',
    company: 'Perfect Solutions Group Inc',
    day: 'Wed, Sep 23',
    timeRange: '09:00 AM – 05:00 PM',
    task: 'Documentation',
    description: 'Updated user guides and release notes for the sprint.',
    hours: '7.5 hrs',
    weekProgress: 'Week 22.5 / 40',
    checks: 'Clean',
    decision: 'Pending',
  },
  {
    id: 'mateo-wed',
    candidate: 'Mateo Fernandez',
    email: 'mateo.f@perfectsolutionsgroup.com',
    team: 'USA team',
    company: 'Perfect Solutions Group Inc',
    day: 'Wed, Sep 23',
    timeRange: '09:00 AM – 05:00 PM',
    task: 'Documentation',
    description: 'Updated user guides and release notes for the sprint.',
    hours: '7.5 hrs',
    weekProgress: 'Week 22.5 / 40',
    checks: 'Clean',
    decision: 'Pending',
  },
  {
    id: 'priya-wed',
    candidate: 'Priya Natarajan',
    email: 'priya.n@cortracker360.com',
    team: 'India team',
    company: 'Cortracker Inc',
    day: 'Wed, Sep 23',
    timeRange: '09:00 AM – 05:30 PM',
    task: 'Code review',
    description: 'Reviewed pull requests and paired with the team on fixes.',
    hours: '8 hrs',
    weekProgress: 'Week 22.5 / 40',
    checks: 'Clean',
    decision: 'Pending',
  },
  {
    id: 'jordan-tue',
    candidate: 'Jordan Alvarez',
    email: 'jordan.alvarez2@cortracker360.com',
    team: 'USA team',
    company: 'Cortracker Inc',
    day: 'Tue, Sep 22',
    timeRange: '09:00 AM – 05:00 PM',
    task: 'Bug fixing',
    description: 'Fixed validation issues reported in the onboarding form.',
    hours: '7.5 hrs',
    weekProgress: 'Week 22.5 / 40',
    checks: 'Clean',
    decision: 'Pending',
  },
  {
    id: 'jordan-mon',
    candidate: 'Jordan Alvarez',
    email: 'jordan.alvarez2@cortracker360.com',
    team: 'USA team',
    company: 'Cortracker Inc',
    day: 'Mon, Sep 21',
    timeRange: '09:00 AM – 05:30 PM',
    task: 'Development',
    description: 'Built REST endpoints for the timesheet approval workflow.',
    hours: '8 hrs',
    weekProgress: 'Week 22.5 / 40',
    checks: 'Clean',
    decision: 'Pending',
  },
  {
    id: 'wei-wed',
    candidate: 'Wei Chen',
    email: 'wei.c@cortracker360.com',
    team: 'USA team',
    company: 'Cortracker Inc',
    day: 'Wed, Sep 23',
    timeRange: '09:00 AM – 06:30 PM',
    task: 'Development',
    description: 'Refactored the login form and added validation.',
    hours: '9 hrs',
    weekProgress: 'Week 22.5 / 40',
    checks: 'Flagged',
    flagReason: 'Exceeds the 8-hour daily cap',
    decision: 'Pending',
  },
  {
    id: 'arjun-tue',
    candidate: 'Arjun Mehta',
    email: 'arjun.m@cortracker360.com',
    team: 'India team',
    company: 'Cortracker Inc',
    day: 'Tue, Sep 22',
    timeRange: '09:30 AM – 06:00 PM',
    task: 'Support',
    description: 'Resolved onboarding tickets for new candidates.',
    hours: '8 hrs',
    weekProgress: 'Week 20 / 40',
    checks: 'Clean',
    decision: 'Approved',
  },
  {
    id: 'fatima-mon',
    candidate: 'Fatima Sheikh',
    email: 'fatima.s@cortracker360.com',
    team: 'India team',
    company: 'Cortracker Inc',
    day: 'Mon, Sep 21',
    timeRange: '08:00 AM – 04:00 PM',
    task: 'Design',
    description: 'Refined the onboarding approvals table layout.',
    hours: '7.5 hrs',
    weekProgress: 'Week 18.5 / 40',
    checks: 'Clean',
    decision: 'Approved',
  },
  {
    id: 'daniel-fri',
    candidate: 'Daniel Osei',
    email: 'daniel.o@perfectsolutionsgroup.com',
    team: 'USA team',
    company: 'Perfect Solutions Group Inc',
    day: 'Fri, Sep 18',
    timeRange: '09:00 AM – 05:00 PM',
    task: 'Testing / QA',
    description: 'Smoke-tested the release candidate build.',
    hours: '7.5 hrs',
    weekProgress: 'Week 15 / 40',
    checks: 'Clean',
    decision: 'Approved',
  },
  {
    id: 'omar-thu',
    candidate: 'Omar Haddad',
    email: 'omar.h@perfectsolutionsgroup.com',
    team: 'USA team',
    company: 'Perfect Solutions Group Inc',
    day: 'Thu, Sep 17',
    timeRange: '09:00 AM – 06:00 PM',
    task: 'Development',
    description: 'Submitted hours did not match the clock-in/out log.',
    hours: '8.5 hrs',
    weekProgress: 'Week 12.5 / 40',
    checks: 'Clean',
    decision: 'Rejected',
  },
];

@Component({
  imports: [],
  selector: 'app-manager-timesheet-approvals',
  templateUrl: './timesheet-approvals.html',
})
export class ManagerTimesheetApprovals {

  protected readonly entries = signal<TimesheetEntry[]>(SEED_ENTRIES);
  protected readonly activeTab = signal<FilterTab>('Pending');
  protected readonly searchQuery = signal('');
  protected readonly selectedIds = signal<ReadonlySet<string>>(new Set());

  protected readonly pendingCount = computed(
    () => this.entries().filter((entry) => entry.decision === 'Pending').length,
  );
  protected readonly flaggedCount = computed(
    () => this.entries().filter((entry) => entry.checks === 'Flagged').length,
  );
  protected readonly approvedCount = computed(
    () => this.entries().filter((entry) => entry.decision === 'Approved').length,
  );
  protected readonly rejectedCount = computed(
    () => this.entries().filter((entry) => entry.decision === 'Rejected').length,
  );
  protected readonly allCount = computed(() => this.entries().length);

  protected readonly filteredEntries = computed(() => {
    const tab = this.activeTab();
    const query = this.searchQuery().trim().toLowerCase();

    return this.entries().filter((entry) => {
      const matchesTab =
        tab === 'All'
          ? true
          : tab === 'Flagged'
            ? entry.checks === 'Flagged'
            : entry.decision === tab;
      const matchesQuery =
        !query ||
        entry.candidate.toLowerCase().includes(query) ||
        entry.email.toLowerCase().includes(query);
      return matchesTab && matchesQuery;
    });
  });

  protected readonly allVisibleSelected = computed(() => {
    const visible = this.filteredEntries();
    return visible.length > 0 && visible.every((entry) => this.selectedIds().has(entry.id));
  });

  setTab(tab: FilterTab): void {
    this.activeTab.set(tab);
  }

  onSearchInput(value: string): void {
    this.searchQuery.set(value);
  }

  isSelected(id: string): boolean {
    return this.selectedIds().has(id);
  }

  toggleSelected(id: string): void {
    this.selectedIds.update((ids) => {
      const next = new Set(ids);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  toggleSelectAllVisible(): void {
    const visible = this.filteredEntries();
    const shouldSelect = !this.allVisibleSelected();

    this.selectedIds.update((ids) => {
      const next = new Set(ids);
      for (const entry of visible) {
        if (shouldSelect) {
          next.add(entry.id);
        } else {
          next.delete(entry.id);
        }
      }
      return next;
    });
  }

  approve(id: string): void {
    this.entries.update((rows) =>
      rows.map((row) => (row.id === id ? { ...row, decision: 'Approved' } : row)),
    );
  }

  approveAllInView(): void {
    const visibleIds = new Set(this.filteredEntries().map((entry) => entry.id));
    this.entries.update((rows) =>
      rows.map((row) =>
        visibleIds.has(row.id) && row.decision === 'Pending'
          ? { ...row, decision: 'Approved' }
          : row,
      ),
    );
  }

  initials(name: string): string {
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.charAt(0) ?? '';
    const second = parts.length > 1 ? (parts[parts.length - 1]?.charAt(0) ?? '') : '';
    return (first + second).toUpperCase();
  }
}
