import { Component, computed, signal } from '@angular/core';

type PeopleTab = 'Candidates' | 'Staff';
type MonthTone = 'success' | 'warning';

interface MonthSubmission {
  label: string;
  daysSubmitted: number;
  hours: string;
  approved: number;
  pending: number;
  lastSubmission: string;
  tone: MonthTone;
}

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  team: string;
  company: string;
  since: string;
  dateOfBirth: string;
  onboardedOn: string;
  approvedBy: string;
  accountStatus: string;
  timesheetsSummary: string;
  timeline: MonthSubmission[];
}

interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  team: string;
  company: string;
  since: string;
  accountStatus: string;
}

const CANDIDATES: Candidate[] = [
  {
    id: 'jordan-alvarez',
    name: 'Jordan Alvarez',
    email: 'jordan.alvarez@cortracker360.com',
    phone: '+1 234-567-8910',
    team: 'USA team',
    company: 'Cortracker Inc',
    since: 'Mar 3, 2025',
    dateOfBirth: '04/12/1996',
    onboardedOn: 'Feb 27, 2025',
    approvedBy: 'Naresh Kumar',
    accountStatus: 'Active',
    timesheetsSummary: '28 days in 2 months · 209.5 hrs',
    timeline: [
      {
        label: 'Sep 2026',
        daysSubmitted: 17,
        hours: '127 hrs',
        approved: 9,
        pending: 8,
        lastSubmission: 'Sep 23, 9:36 AM',
        tone: 'warning',
      },
      {
        label: 'Aug 2026',
        daysSubmitted: 11,
        hours: '82.5 hrs',
        approved: 11,
        pending: 0,
        lastSubmission: 'Sep 23, 9:36 AM',
        tone: 'success',
      },
    ],
  },
  {
    id: 'priya-natarajan',
    name: 'Priya Natarajan',
    email: 'priya.n@cortracker360.com',
    phone: '+91 987-654-3210',
    team: 'India team',
    company: 'Cortracker Inc',
    since: 'Jan 14, 2025',
    dateOfBirth: '11/02/1997',
    onboardedOn: 'Jan 10, 2025',
    approvedBy: 'HR',
    accountStatus: 'Active',
    timesheetsSummary: '19 days in 2 months · 142.5 hrs',
    timeline: [
      {
        label: 'Sep 2026',
        daysSubmitted: 9,
        hours: '67.5 hrs',
        approved: 8,
        pending: 1,
        lastSubmission: 'Sep 22, 1:09 PM',
        tone: 'warning',
      },
      {
        label: 'Aug 2026',
        daysSubmitted: 10,
        hours: '75 hrs',
        approved: 10,
        pending: 0,
        lastSubmission: 'Aug 29, 5:45 PM',
        tone: 'success',
      },
    ],
  },
  {
    id: 'mateo-fernandez',
    name: 'Mateo Fernandez',
    email: 'mateo.f@perfectsolutionsgroup.com',
    phone: '+1 234-567-8910',
    team: 'USA team',
    company: 'Perfect Solutions Group Inc',
    since: 'Jun 9, 2025',
    dateOfBirth: '07/19/1994',
    onboardedOn: 'Jun 4, 2025',
    approvedBy: 'Team Lead',
    accountStatus: 'Active',
    timesheetsSummary: '15 days in 2 months · 112.5 hrs',
    timeline: [
      {
        label: 'Sep 2026',
        daysSubmitted: 8,
        hours: '60 hrs',
        approved: 7,
        pending: 1,
        lastSubmission: 'Sep 23, 12:09 PM',
        tone: 'warning',
      },
      {
        label: 'Aug 2026',
        daysSubmitted: 7,
        hours: '52.5 hrs',
        approved: 7,
        pending: 0,
        lastSubmission: 'Aug 27, 4:10 PM',
        tone: 'success',
      },
    ],
  },
  {
    id: 'wei-chen',
    name: 'Wei Chen',
    email: 'wei.c@cortracker360.com',
    phone: '+1 234-567-8910',
    team: 'USA team',
    company: 'Cortracker Inc',
    since: 'Feb 20, 2025',
    dateOfBirth: '09/30/1995',
    onboardedOn: 'Feb 15, 2025',
    approvedBy: 'Naresh Kumar',
    accountStatus: 'Active',
    timesheetsSummary: '21 days in 2 months · 165 hrs',
    timeline: [
      {
        label: 'Sep 2026',
        daysSubmitted: 10,
        hours: '80 hrs',
        approved: 9,
        pending: 1,
        lastSubmission: 'Sep 23, 2:57 PM',
        tone: 'warning',
      },
      {
        label: 'Aug 2026',
        daysSubmitted: 11,
        hours: '85 hrs',
        approved: 11,
        pending: 0,
        lastSubmission: 'Aug 30, 6:02 PM',
        tone: 'success',
      },
    ],
  },
  {
    id: 'fatima-sheikh',
    name: 'Fatima Sheikh',
    email: 'fatima.s@cortracker360.com',
    phone: '+91 987-654-3210',
    team: 'India team',
    company: 'Cortracker Inc',
    since: 'Apr 7, 2025',
    dateOfBirth: '01/23/1998',
    onboardedOn: 'Apr 2, 2025',
    approvedBy: 'HR',
    accountStatus: 'Active',
    timesheetsSummary: '18 days in 2 months · 135 hrs',
    timeline: [
      {
        label: 'Sep 2026',
        daysSubmitted: 8,
        hours: '60 hrs',
        approved: 8,
        pending: 0,
        lastSubmission: 'Sep 21, 4:20 PM',
        tone: 'success',
      },
      {
        label: 'Aug 2026',
        daysSubmitted: 10,
        hours: '75 hrs',
        approved: 10,
        pending: 0,
        lastSubmission: 'Aug 28, 3:15 PM',
        tone: 'success',
      },
    ],
  },
  {
    id: 'daniel-osei',
    name: 'Daniel Osei',
    email: 'daniel.o@perfectsolutionsgroup.com',
    phone: '+1 234-567-8910',
    team: 'USA team',
    company: 'Perfect Solutions Group Inc',
    since: 'Jul 21, 2025',
    dateOfBirth: '05/08/1993',
    onboardedOn: 'Jul 16, 2025',
    approvedBy: 'Team Lead',
    accountStatus: 'Active',
    timesheetsSummary: '12 days in 2 months · 90 hrs',
    timeline: [
      {
        label: 'Sep 2026',
        daysSubmitted: 5,
        hours: '37.5 hrs',
        approved: 4,
        pending: 1,
        lastSubmission: 'Sep 23, 10:39 AM',
        tone: 'warning',
      },
      {
        label: 'Aug 2026',
        daysSubmitted: 7,
        hours: '52.5 hrs',
        approved: 7,
        pending: 0,
        lastSubmission: 'Aug 25, 5:00 PM',
        tone: 'success',
      },
    ],
  },
  {
    id: 'sara-whitmore',
    name: 'Sara Whitmore',
    email: 'sara.w@cortracker360.com',
    phone: '+1 234-567-8910',
    team: 'USA team',
    company: 'Cortracker Inc',
    since: 'Oct 1, 2024',
    dateOfBirth: '03/14/1992',
    onboardedOn: 'Sep 26, 2024',
    approvedBy: 'Naresh Kumar',
    accountStatus: 'Active',
    timesheetsSummary: '32 days in 2 months · 239 hrs',
    timeline: [
      {
        label: 'Sep 2026',
        daysSubmitted: 16,
        hours: '119 hrs',
        approved: 15,
        pending: 1,
        lastSubmission: 'Sep 23, 8:55 AM',
        tone: 'warning',
      },
      {
        label: 'Aug 2026',
        daysSubmitted: 16,
        hours: '120 hrs',
        approved: 16,
        pending: 0,
        lastSubmission: 'Aug 31, 6:40 PM',
        tone: 'success',
      },
    ],
  },
  {
    id: 'arjun-mehta',
    name: 'Arjun Mehta',
    email: 'arjun.m@cortracker360.com',
    phone: '+91 987-654-3210',
    team: 'India team',
    company: 'Cortracker Inc',
    since: 'May 12, 2025',
    dateOfBirth: '08/02/1996',
    onboardedOn: 'May 7, 2025',
    approvedBy: 'HR',
    accountStatus: 'Active',
    timesheetsSummary: '14 days in 2 months · 105 hrs',
    timeline: [
      {
        label: 'Sep 2026',
        daysSubmitted: 7,
        hours: '52.5 hrs',
        approved: 7,
        pending: 0,
        lastSubmission: 'Sep 22, 6:04 PM',
        tone: 'success',
      },
      {
        label: 'Aug 2026',
        daysSubmitted: 7,
        hours: '52.5 hrs',
        approved: 7,
        pending: 0,
        lastSubmission: 'Aug 29, 5:30 PM',
        tone: 'success',
      },
    ],
  },
  {
    id: 'nikhil-rao',
    name: 'Nikhil Rao',
    email: 'nikhil.r@cortracker360.com',
    phone: '+91 987-654-3210',
    team: 'India team',
    company: 'Cortracker Inc',
    since: 'Sep 12, 2025',
    dateOfBirth: '12/17/1999',
    onboardedOn: 'Sep 12, 2025',
    approvedBy: 'Naresh Kumar',
    accountStatus: 'Active',
    timesheetsSummary: '4 days in 1 month · 30 hrs',
    timeline: [
      {
        label: 'Sep 2026',
        daysSubmitted: 4,
        hours: '30 hrs',
        approved: 2,
        pending: 2,
        lastSubmission: 'Sep 20, 11:15 AM',
        tone: 'warning',
      },
    ],
  },
  {
    id: 'tomas-silva',
    name: 'Tomas Silva',
    email: 'tomas.s@cortracker360.com',
    phone: '+1 234-567-8910',
    team: 'USA team',
    company: 'Cortracker Inc',
    since: 'Aug 4, 2025',
    dateOfBirth: '02/28/1995',
    onboardedOn: 'Jul 30, 2025',
    approvedBy: 'Team Lead',
    accountStatus: 'Active',
    timesheetsSummary: '13 days in 2 months · 97.5 hrs',
    timeline: [
      {
        label: 'Sep 2026',
        daysSubmitted: 6,
        hours: '45 hrs',
        approved: 6,
        pending: 0,
        lastSubmission: 'Sep 19, 3:40 PM',
        tone: 'success',
      },
      {
        label: 'Aug 2026',
        daysSubmitted: 7,
        hours: '52.5 hrs',
        approved: 7,
        pending: 0,
        lastSubmission: 'Aug 26, 4:50 PM',
        tone: 'success',
      },
    ],
  },
  {
    id: 'grace-kim',
    name: 'Grace Kim',
    email: 'grace.k@cortracker360.com',
    phone: '+1 234-567-8910',
    team: 'USA team',
    company: 'Cortracker Inc',
    since: 'Nov 18, 2024',
    dateOfBirth: '06/06/1994',
    onboardedOn: 'Nov 13, 2024',
    approvedBy: 'Naresh Kumar',
    accountStatus: 'Active',
    timesheetsSummary: '24 days in 2 months · 180 hrs',
    timeline: [
      {
        label: 'Sep 2026',
        daysSubmitted: 12,
        hours: '90 hrs',
        approved: 12,
        pending: 0,
        lastSubmission: 'Sep 18, 2:25 PM',
        tone: 'success',
      },
      {
        label: 'Aug 2026',
        daysSubmitted: 12,
        hours: '90 hrs',
        approved: 12,
        pending: 0,
        lastSubmission: 'Aug 29, 6:15 PM',
        tone: 'success',
      },
    ],
  },
  {
    id: 'omar-haddad',
    name: 'Omar Haddad',
    email: 'omar.h@perfectsolutionsgroup.com',
    phone: '+1 234-567-8910',
    team: 'USA team',
    company: 'Perfect Solutions Group Inc',
    since: 'Dec 2, 2024',
    dateOfBirth: '10/11/1993',
    onboardedOn: 'Nov 27, 2024',
    approvedBy: 'Team Lead',
    accountStatus: 'Suspended',
    timesheetsSummary: '9 days in 2 months · 76.5 hrs',
    timeline: [
      {
        label: 'Sep 2026',
        daysSubmitted: 2,
        hours: '17 hrs',
        approved: 0,
        pending: 0,
        lastSubmission: 'Sep 17, 9:00 AM',
        tone: 'warning',
      },
      {
        label: 'Aug 2026',
        daysSubmitted: 7,
        hours: '59.5 hrs',
        approved: 6,
        pending: 0,
        lastSubmission: 'Aug 24, 4:45 PM',
        tone: 'success',
      },
    ],
  },
];

const STAFF: StaffMember[] = [
  {
    id: 'naresh-kumar',
    name: 'Naresh Kumar',
    email: 'naresh.kumar@cortracker360.com',
    phone: '+91 987-654-3210',
    role: 'Super Administrator',
    team: 'India team',
    company: 'Cortracker Inc',
    since: 'Jan 6, 2023',
    accountStatus: 'Active',
  },
  {
    id: 'hr-lead',
    name: 'Vijay Mohan',
    email: 'vijay.m@cortracker360.com',
    phone: '+91 987-654-3210',
    role: 'HR',
    team: 'India team',
    company: 'Cortracker Inc',
    since: 'Mar 11, 2023',
    accountStatus: 'Active',
  },
  {
    id: 'manager-usa',
    name: 'Grace Okafor',
    email: 'grace.o@cortracker360.com',
    phone: '+1 234-567-8910',
    role: 'Super Administrator (Manager)',
    team: 'USA team',
    company: 'Cortracker Inc',
    since: 'Jun 2, 2023',
    accountStatus: 'Active',
  },
  {
    id: 'manager-psg',
    name: 'Marcus Lee',
    email: 'marcus.l@perfectsolutionsgroup.com',
    phone: '+1 234-567-8910',
    role: 'Super Administrator (Manager)',
    team: 'USA team',
    company: 'Perfect Solutions Group Inc',
    since: 'Aug 14, 2023',
    accountStatus: 'Active',
  },
  {
    id: 'editor-1',
    name: 'Ananya Iyer',
    email: 'ananya.i@cortracker360.com',
    phone: '+91 987-654-3210',
    role: 'Editor / Contributor',
    team: 'India team',
    company: 'Cortracker Inc',
    since: 'Oct 9, 2023',
    accountStatus: 'Active',
  },
  {
    id: 'editor-2',
    name: 'Ben Carter',
    email: 'ben.c@cortracker360.com',
    phone: '+1 234-567-8910',
    role: 'Editor / Contributor',
    team: 'USA team',
    company: 'Cortracker Inc',
    since: 'Feb 3, 2024',
    accountStatus: 'Active',
  },
  {
    id: 'contributor-view-1',
    name: 'Elena Petrova',
    email: 'elena.p@perfectsolutionsgroup.com',
    phone: '+1 234-567-8910',
    role: 'Contributor (View)',
    team: 'USA team',
    company: 'Perfect Solutions Group Inc',
    since: 'May 20, 2024',
    accountStatus: 'Active',
  },
  {
    id: 'resource-manager-view-1',
    name: 'Anita Verma',
    email: 'anita.v@cortracker360.com',
    phone: '+91 987-654-3210',
    role: 'Resource Manager (View)',
    team: 'India team',
    company: 'Cortracker Inc',
    since: 'Sep 12, 2026',
    accountStatus: 'Active',
  },
];

@Component({
  imports: [],
  selector: 'app-hr-people',
  templateUrl: './people.html',
})
export class HrPeople {
  protected readonly activeTab = signal<PeopleTab>('Candidates');
  protected readonly candidates = CANDIDATES;
  protected readonly staff = STAFF;

  protected readonly candidateSearch = signal('');
  protected readonly selectedCandidateId = signal(CANDIDATES[0].id);

  protected readonly staffSearch = signal('');
  protected readonly selectedStaffId = signal(STAFF[0].id);

  protected readonly filteredCandidates = computed(() => {
    const query = this.candidateSearch().trim().toLowerCase();
    if (!query) {
      return this.candidates;
    }
    return this.candidates.filter((candidate) => candidate.name.toLowerCase().includes(query));
  });

  protected readonly selectedCandidate = computed(
    () =>
      this.candidates.find((candidate) => candidate.id === this.selectedCandidateId()) ??
      this.candidates[0],
  );

  protected readonly filteredStaff = computed(() => {
    const query = this.staffSearch().trim().toLowerCase();
    if (!query) {
      return this.staff;
    }
    return this.staff.filter((member) => member.name.toLowerCase().includes(query));
  });

  protected readonly selectedStaffMember = computed(
    () => this.staff.find((member) => member.id === this.selectedStaffId()) ?? this.staff[0],
  );

  setTab(tab: PeopleTab): void {
    this.activeTab.set(tab);
  }

  selectCandidate(id: string): void {
    this.selectedCandidateId.set(id);
  }

  onCandidateSearch(value: string): void {
    this.candidateSearch.set(value);
  }

  selectStaff(id: string): void {
    this.selectedStaffId.set(id);
  }

  onStaffSearch(value: string): void {
    this.staffSearch.set(value);
  }

  initials(name: string): string {
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.charAt(0) ?? '';
    const second = parts.length > 1 ? (parts[parts.length - 1]?.charAt(0) ?? '') : '';
    return (first + second).toUpperCase();
  }
}
