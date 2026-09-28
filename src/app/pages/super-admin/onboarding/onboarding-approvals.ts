import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { AdminApi, Applicant } from '../../../shared/api/admin.api';
import { errorMessage } from '../../../shared/api/api-helpers';
import { AlertService } from '../../../shared/alert.service';
import { AuthService } from '../../../shared/auth.service';

type FilterTab = 'Pending' | 'Approved' | 'Rejected' | 'All';

@Component({
  imports: [],
  selector: 'app-onboarding-approvals',
  templateUrl: './onboarding-approvals.html',
})
export class OnboardingApprovals implements OnInit {
  private readonly api = inject(AdminApi);
  private readonly alerts = inject(AlertService);

  protected readonly canDecide = inject(AuthService).can('approve_onboarding');
  protected readonly applicants = signal<Applicant[]>([]);
  protected readonly seatsUsed = signal(0);
  protected readonly seatsTotal = signal(10);
  protected readonly activeTab = signal<FilterTab>('Pending');
  protected readonly loading = signal(true);
  protected readonly busyId = signal<string | null>(null);
  protected readonly errorText = signal('');

  protected readonly pendingCount = computed(() => this.count('Pending'));
  protected readonly approvedCount = computed(() => this.count('Approved'));
  protected readonly rejectedCount = computed(() => this.count('Rejected'));
  protected readonly allCount = computed(() => this.applicants().length);

  protected readonly filteredApplicants = computed(() => {
    const tab = this.activeTab();
    return tab === 'All' ? this.applicants() : this.applicants().filter((a) => a.status === tab);
  });

  ngOnInit(): void {
    this.load();
  }

  private count(status: string): number {
    return this.applicants().filter((a) => a.status === status).length;
  }

  load(): void {
    this.api.applicants().subscribe({
      next: (list) => {
        this.applicants.set(list.items);
        this.seatsUsed.set(list.seatsUsed);
        this.seatsTotal.set(list.seatsTotal);
        this.loading.set(false);
      },
      error: (error) => {
        this.errorText.set(errorMessage(error));
        this.loading.set(false);
      },
    });
  }

  setTab(tab: FilterTab): void {
    this.activeTab.set(tab);
  }

  initials(name: string): string {
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.charAt(0) ?? '';
    const second = parts.length > 1 ? (parts[parts.length - 1]?.charAt(0) ?? '') : '';
    return (first + second).toUpperCase();
  }

  async approve(applicant: Applicant): Promise<void> {
    if (!(await this.alerts.confirm('Approve this request?', `${applicant.name} will get an active account.`, 'Approve'))) {
      return;
    }
    this.busyId.set(applicant.id);
    this.api.approveApplicant(applicant.id).subscribe({
      next: (result) => {
        this.busyId.set(null);
        if (result.temporaryPassword) {
          this.alerts.credentials(`${result.name} approved`, result.email, result.temporaryPassword);
        } else {
          this.alerts.success('Approved', result.message);
        }
        this.load();
      },
      error: (error) => {
        this.busyId.set(null);
        this.alerts.error('Could not approve', errorMessage(error));
      },
    });
  }

  async reject(applicant: Applicant): Promise<void> {
    const reason = await this.alerts.askReason(`Reject ${applicant.name}?`, 'Reason (optional)', false);
    if (reason === null) {
      return;
    }
    this.busyId.set(applicant.id);
    this.api.rejectApplicant(applicant.id, reason || null).subscribe({
      next: () => {
        this.busyId.set(null);
        this.alerts.success('Rejected', `${applicant.name}'s request was rejected.`);
        this.load();
      },
      error: (error) => {
        this.busyId.set(null);
        this.alerts.error('Could not reject', errorMessage(error));
      },
    });
  }

  async approveAllPending(): Promise<void> {
    if (this.pendingCount() === 0) {
      return;
    }
    if (!(await this.alerts.confirm('Approve all pending?', 'Flagged requests are skipped and must be reviewed one by one.', 'Approve all'))) {
      return;
    }
    this.busyId.set('all');
    this.api.approveAllApplicants().subscribe({
      next: (result) => {
        this.busyId.set(null);
        const passwords = result.results
          .filter((r) => r.temporaryPassword)
          .map((r) => `${r.email} — ${r.temporaryPassword}`)
          .join(', ');
        const skipped = result.skippedFlagged ? `${result.skippedFlagged} flagged request(s) were skipped. ` : '';
        this.alerts.success(`${result.approved} approved`, `${skipped}${passwords}`);
        this.load();
      },
      error: (error) => {
        this.busyId.set(null);
        this.alerts.error('Could not approve all', errorMessage(error));
      },
    });
  }
}
