import { Component, computed, signal } from '@angular/core';

type ApplicantType = 'Candidate' | 'Resource Manager';
type ApplicantStatus = 'Pending' | 'Approved' | 'Rejected';
type FilterTab = ApplicantStatus | 'All';

interface Applicant {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: ApplicantType;
  team: string;
  company: string;
  submitted: string;
  flag?: string;
  status: ApplicantStatus;
}


const SEED_APPLICANTS: Applicant[] = [
  {
    id: 'jordan-alvarez',
    name: 'Jordan Alvarez',
    email: 'jordan.alvarez2@cortracker360.com',
    phone: '+1 234-567-8910',
    type: 'Candidate',
    team: 'USA team',
    company: 'Cortracker Inc',
    submitted: 'Sep 12, 2026',
    status: 'Pending',
  },
  {
    id: 'nikhil-rao',
    name: 'Nikhil Rao',
    email: 'nikhil.r@cortracker360.com',
    phone: '+91 987-654-3210',
    type: 'Candidate',
    team: 'India team',
    company: 'Cortracker Inc',
    submitted: 'Sep 12, 2026',
    status: 'Pending',
  },
  {
    id: 'aaa-test123',
    name: 'aaa test123',
    email: 'aaatest@gmail.com',
    phone: '+1 234-567-8910',
    type: 'Candidate',
    team: 'USA team',
    company: 'Others',
    submitted: 'Sep 11, 2026',
    flag: 'Name contains digits',
    status: 'Pending',
  },
  {
    id: 'tomas-silva',
    name: 'Tomas Silva',
    email: 'tomas.s@cortracker360.com',
    phone: '+1 234-567-8910',
    type: 'Candidate',
    team: 'USA team',
    company: 'Cortracker Inc',
    submitted: 'Sep 10, 2026',
    status: 'Pending',
  },
  {
    id: 'qwerty-asdf',
    name: 'qwerty asdf',
    email: 'qwerty@tempmail.com',
    phone: '+1 234-567-8910',
    type: 'Candidate',
    team: 'USA team',
    company: 'Others',
    submitted: 'Sep 9, 2026',
    flag: 'Personal or temporary email domain',
    status: 'Pending',
  },
  {
    id: 'anita-verma',
    name: 'Anita Verma',
    email: 'anita.v@cortracker360.com',
    phone: '+91 987-654-3210',
    type: 'Resource Manager',
    team: 'India team',
    company: 'Cortracker Inc',
    submitted: 'Sep 12, 2026',
    status: 'Pending',
  },
  {
    id: 'priya-natarajan',
    name: 'Priya Natarajan',
    email: 'priya.n@cortracker360.com',
    phone: '+91 987-654-3210',
    type: 'Candidate',
    team: 'India team',
    company: 'Cortracker Inc',
    submitted: 'Sep 5, 2026',
    status: 'Approved',
  },
  {
    id: 'mateo-fernandez',
    name: 'Mateo Fernandez',
    email: 'mateo.f@cortracker360.com',
    phone: '+1 234-567-8910',
    type: 'Candidate',
    team: 'USA team',
    company: 'Perfect Solutions Group Inc',
    submitted: 'Sep 4, 2026',
    status: 'Approved',
  },
  {
    id: 'wei-chen',
    name: 'Wei Chen',
    email: 'wei.c@cortracker360.com',
    phone: '+1 234-567-8910',
    type: 'Candidate',
    team: 'USA team',
    company: 'Cortracker Inc',
    submitted: 'Sep 3, 2026',
    status: 'Approved',
  },
  {
    id: 'omar-haddad',
    name: 'Omar Haddad',
    email: 'omar.h@cortracker360.com',
    phone: '+1 234-567-8910',
    type: 'Candidate',
    team: 'USA team',
    company: 'Perfect Solutions Group Inc',
    submitted: 'Sep 2, 2026',
    flag: 'Duplicate submission',
    status: 'Rejected',
  },
];

@Component({
  imports: [],
  selector: 'app-manager-onboarding-approvals',
  templateUrl: './onboarding-approvals.html',
})
export class ManagerOnboardingApprovals {
  protected readonly seatsUsed = 2;
  protected readonly seatsTotal = 10;

  protected readonly applicants = signal<Applicant[]>(SEED_APPLICANTS);
  protected readonly activeTab = signal<FilterTab>('Pending');

  protected readonly pendingCount = computed(
    () => this.applicants().filter((applicant) => applicant.status === 'Pending').length,
  );
  protected readonly approvedCount = computed(
    () => this.applicants().filter((applicant) => applicant.status === 'Approved').length,
  );
  protected readonly rejectedCount = computed(
    () => this.applicants().filter((applicant) => applicant.status === 'Rejected').length,
  );
  protected readonly allCount = computed(() => this.applicants().length);

  protected readonly filteredApplicants = computed(() => {
    const tab = this.activeTab();
    return tab === 'All'
      ? this.applicants()
      : this.applicants().filter((applicant) => applicant.status === tab);
  });

  setTab(tab: FilterTab): void {
    this.activeTab.set(tab);
  }

  initials(name: string): string {
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.charAt(0) ?? '';
    const second = parts.length > 1 ? (parts[parts.length - 1]?.charAt(0) ?? '') : '';
    return (first + second).toUpperCase();
  }

  approve(id: string): void {
    this.updateStatus(id, 'Approved');
  }

  reject(id: string): void {
    this.updateStatus(id, 'Rejected');
  }

  approveAllPending(): void {
    this.applicants.update((rows) =>
      rows.map((row) => (row.status === 'Pending' ? { ...row, status: 'Approved' } : row)),
    );
  }

  private updateStatus(id: string, status: ApplicantStatus): void {
    this.applicants.update((rows) =>
      rows.map((row) => (row.id === id ? { ...row, status } : row)),
    );
  }
}
