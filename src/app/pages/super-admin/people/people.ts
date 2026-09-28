import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AdminApi, PersonDetail, PersonListItem } from '../../../shared/api/admin.api';
import { errorMessage } from '../../../shared/api/api-helpers';
import { LookupItem, PublicApi } from '../../../shared/api/public.api';

type PeopleTab = 'Candidates' | 'Staff';

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  company: string;
  team: string;
  since: string;
  accountStatus: string;
}

@Component({
  imports: [],
  selector: 'app-people',
  templateUrl: './people.html',
})
export class People implements OnInit {
  private readonly api = inject(AdminApi);
  private readonly lookupApi = inject(PublicApi);
  private readonly route = inject(ActivatedRoute);

  protected readonly activeTab = signal<PeopleTab>('Candidates');
  protected readonly companies = signal<LookupItem[]>([]);
  protected readonly teams = signal<LookupItem[]>([]);
  protected readonly companyId = signal<number | null>(null);
  protected readonly teamId = signal<number | null>(null);

  protected readonly candidates = signal<PersonListItem[]>([]);
  protected readonly staff = signal<StaffMember[]>([]);
  protected readonly candidateSearch = signal('');
  protected readonly staffSearch = signal('');
  protected readonly selectedCandidateId = signal<string | null>(null);
  protected readonly selectedStaffId = signal<string | null>(null);
  protected readonly detail = signal<PersonDetail | null>(null);
  protected readonly loading = signal(true);
  protected readonly detailLoading = signal(false);
  protected readonly errorText = signal('');

  protected readonly filteredCandidates = computed(() => {
    const query = this.candidateSearch().trim().toLowerCase();
    return query
      ? this.candidates().filter((c) => c.name.toLowerCase().includes(query))
      : this.candidates();
  });

  protected readonly filteredStaff = computed(() => {
    const query = this.staffSearch().trim().toLowerCase();
    return query ? this.staff().filter((m) => m.name.toLowerCase().includes(query)) : this.staff();
  });

  protected readonly selectedStaffMember = computed(
    () => this.staff().find((m) => m.id === this.selectedStaffId()) ?? this.staff()[0] ?? null,
  );

  ngOnInit(): void {
    this.lookupApi.lookups().subscribe({
      next: (lookups) => {
        this.companies.set(lookups.companies);
        this.teams.set(lookups.teams);
      },
    });
    this.loadCandidates(this.route.snapshot.queryParamMap.get('id'));
    this.api.staff().subscribe({
      next: (members) => this.staff.set(members),
      error: (error) => this.errorText.set(errorMessage(error)),
    });
  }

  private loadCandidates(preselect: string | null = null): void {
    this.loading.set(true);
    this.api.people({ companyId: this.companyId(), teamId: this.teamId() }).subscribe({
      next: (list) => {
        this.candidates.set(list);
        this.loading.set(false);
        const first = preselect ?? this.selectedCandidateId() ?? list[0]?.id ?? null;
        const target = list.find((c) => c.id === first)?.id ?? list[0]?.id ?? null;
        if (target) {
          this.selectCandidate(target);
        } else {
          this.selectedCandidateId.set(null);
          this.detail.set(null);
        }
      },
      error: (error) => {
        this.errorText.set(errorMessage(error));
        this.loading.set(false);
      },
    });
  }

  setTab(tab: PeopleTab): void {
    this.activeTab.set(tab);
  }

  onCompanyChange(value: string): void {
    this.companyId.set(value ? Number(value) : null);
    this.loadCandidates();
  }

  onTeamChange(value: string): void {
    this.teamId.set(value ? Number(value) : null);
    this.loadCandidates();
  }

  selectCandidate(id: string): void {
    this.selectedCandidateId.set(id);
    this.detailLoading.set(true);
    this.api.person(id).subscribe({
      next: (person) => {
        this.detail.set(person);
        this.detailLoading.set(false);
      },
      error: (error) => {
        this.errorText.set(errorMessage(error));
        this.detailLoading.set(false);
      },
    });
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
