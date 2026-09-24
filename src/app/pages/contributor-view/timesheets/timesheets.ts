import { Component, computed, signal } from '@angular/core';

type ViewMode = 'Weekly' | 'Monthly';

interface TeamSummaryRow {
  name: string;
  candidates: number;
  hours: string;
  submitted: number;
  approved: number;
  pending: number;
  rejected: number;
}

interface CandidateRow {
  name: string;
  team: string;
  weekHours: string;
  submitted: number;
  approved: number;
  pending: number;
  rejected: number;
}

const TEAM_SUMMARY_ROWS: TeamSummaryRow[] = [
  {
    name: 'Cortracker Inc · India team',
    candidates: 3,
    hours: '51.5 hrs',
    submitted: 7,
    approved: 6,
    pending: 1,
    rejected: 0,
  },
  {
    name: 'Cortracker Inc · USA team',
    candidates: 5,
    hours: '76 hrs',
    submitted: 10,
    approved: 7,
    pending: 3,
    rejected: 0,
  },
  {
    name: 'Perfect Solutions Group Inc · USA team',
    candidates: 3,
    hours: '45 hrs',
    submitted: 6,
    approved: 4,
    pending: 2,
    rejected: 0,
  },
];

const CANDIDATE_ROWS: CandidateRow[] = [
  {
    name: 'Jordan Alvarez',
    team: 'Cortracker Inc · USA team',
    weekHours: '22.5 hrs',
    submitted: 3,
    approved: 0,
    pending: 3,
    rejected: 0,
  },
  {
    name: 'Priya Natarajan',
    team: 'Cortracker Inc · India team',
    weekHours: '22.5 hrs',
    submitted: 3,
    approved: 2,
    pending: 1,
    rejected: 0,
  },
  {
    name: 'Mateo Fernandez',
    team: 'Perfect Solutions Group Inc · USA team',
    weekHours: '22.5 hrs',
    submitted: 3,
    approved: 2,
    pending: 1,
    rejected: 0,
  },
  {
    name: 'Arjun Mehta',
    team: 'Cortracker Inc · India team',
    weekHours: '22.5 hrs',
    submitted: 2,
    approved: 2,
    pending: 0,
    rejected: 0,
  },
  {
    name: 'Fatima Sheikh',
    team: 'Cortracker Inc · India team',
    weekHours: '22.5 hrs',
    submitted: 2,
    approved: 2,
    pending: 0,
    rejected: 0,
  },
  {
    name: 'Wei Chen',
    team: 'Cortracker Inc · USA team',
    weekHours: '22.5 hrs',
    submitted: 2,
    approved: 2,
    pending: 0,
    rejected: 0,
  },
  {
    name: 'Tomas Silva',
    team: 'Cortracker Inc · USA team',
    weekHours: '22.5 hrs',
    submitted: 2,
    approved: 2,
    pending: 0,
    rejected: 0,
  },
  {
    name: 'Grace Kim',
    team: 'Cortracker Inc · USA team',
    weekHours: '22.5 hrs',
    submitted: 2,
    approved: 2,
    pending: 0,
    rejected: 0,
  },
  {
    name: "Liam O'Connor",
    team: 'Cortracker Inc · USA team',
    weekHours: '22.5 hrs',
    submitted: 1,
    approved: 1,
    pending: 0,
    rejected: 0,
  },
  {
    name: 'Lena Kowalski',
    team: 'Perfect Solutions Group Inc · USA team',
    weekHours: '22.5 hrs',
    submitted: 2,
    approved: 1,
    pending: 1,
    rejected: 0,
  },
  {
    name: 'Daniel Osei',
    team: 'Perfect Solutions Group Inc · USA team',
    weekHours: '22.5 hrs',
    submitted: 1,
    approved: 1,
    pending: 0,
    rejected: 0,
  },
];

@Component({
  imports: [],
  selector: 'app-contributor-view-timesheets',
  templateUrl: './timesheets.html',
})
export class ContributorViewTimesheets {
  protected readonly teamSummaryRows = TEAM_SUMMARY_ROWS;
  protected readonly candidateRows = signal<CandidateRow[]>(CANDIDATE_ROWS);
  protected readonly viewMode = signal<ViewMode>('Weekly');
  protected readonly searchQuery = signal('');

  protected readonly filteredCandidateRows = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    if (!query) {
      return this.candidateRows();
    }
    return this.candidateRows().filter(
      (row) => row.name.toLowerCase().includes(query) || row.team.toLowerCase().includes(query),
    );
  });

  protected readonly totals = computed(() =>
    this.teamSummaryRows.reduce(
      (acc, row) => ({
        submitted: acc.submitted + row.submitted,
        approved: acc.approved + row.approved,
        pending: acc.pending + row.pending,
        rejected: acc.rejected + row.rejected,
      }),
      { submitted: 0, approved: 0, pending: 0, rejected: 0 },
    ),
  );

  setViewMode(mode: ViewMode): void {
    this.viewMode.set(mode);
  }

  onSearchInput(value: string): void {
    this.searchQuery.set(value);
  }

  initials(name: string): string {
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.charAt(0) ?? '';
    const second = parts.length > 1 ? (parts[parts.length - 1]?.charAt(0) ?? '') : '';
    return (first + second).toUpperCase();
  }
}
