import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { AdminApi, ApprovalEntry } from '../../../shared/api/admin.api';
import { errorMessage } from '../../../shared/api/api-helpers';
import { LookupItem, PublicApi } from '../../../shared/api/public.api';
import { AlertService } from '../../../shared/alert.service';
import { AuthService } from '../../../shared/auth.service';

type FilterTab = 'Pending' | 'Flagged' | 'Approved' | 'Rejected' | 'All';

interface EditForm {
  logIn: string;
  logOut: string;
  breakMinutes: number;
  task: string;
  description: string;
}

@Component({
  imports: [],
  selector: 'app-contributor-view-timesheet-approvals',
  templateUrl: './timesheet-approvals.html',
})
export class ContributorViewTimesheetApprovals implements OnInit {
  private readonly api = inject(AdminApi);
  private readonly lookupApi = inject(PublicApi);
  private readonly auth = inject(AuthService);
  private readonly alerts = inject(AlertService);

  protected readonly canApprove = this.auth.can('approve_timesheets');
  protected readonly canEdit = this.auth.can('edit_timesheets');

  protected readonly entries = signal<ApprovalEntry[]>([]);
  protected readonly companies = signal<LookupItem[]>([]);
  protected readonly teams = signal<LookupItem[]>([]);
  protected readonly companyId = signal<number | null>(null);
  protected readonly teamId = signal<number | null>(null);
  protected readonly activeTab = signal<FilterTab>('Pending');
  protected readonly searchQuery = signal('');
  protected readonly selectedIds = signal<ReadonlySet<string>>(new Set());
  protected readonly loading = signal(true);
  protected readonly busy = signal(false);
  protected readonly errorText = signal('');
  protected readonly infoText = signal('');

  protected readonly editingId = signal<string | null>(null);
  protected readonly edit = signal<EditForm>({ logIn: '', logOut: '', breakMinutes: 0, task: '', description: '' });
  protected readonly editError = signal('');

  protected readonly pendingCount = computed(() => this.entries().filter((e) => e.decision === 'Pending').length);
  protected readonly flaggedCount = computed(() => this.entries().filter((e) => e.checks === 'Flagged').length);
  protected readonly approvedCount = computed(() => this.entries().filter((e) => e.decision === 'Approved').length);
  protected readonly rejectedCount = computed(() => this.entries().filter((e) => e.decision === 'Rejected').length);
  protected readonly allCount = computed(() => this.entries().length);

  protected readonly filteredEntries = computed(() => {
    const tab = this.activeTab();
    return this.entries().filter((entry) =>
      tab === 'All' ? true : tab === 'Flagged' ? entry.checks === 'Flagged' : entry.decision === tab,
    );
  });

  protected readonly pendingInView = computed(() => this.filteredEntries().filter((e) => e.decision === 'Pending'));

  protected readonly allVisibleSelected = computed(() => {
    const visible = this.filteredEntries();
    return visible.length > 0 && visible.every((entry) => this.selectedIds().has(entry.id));
  });

  ngOnInit(): void {
    this.lookupApi.lookups().subscribe({
      next: (lookups) => {
        this.companies.set(lookups.companies);
        this.teams.set(lookups.teams);
      },
    });
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.api
      .approvals({ companyId: this.companyId(), teamId: this.teamId(), search: this.searchQuery().trim() })
      .subscribe({
        next: (result) => {
          this.entries.set(result.items);
          this.selectedIds.set(new Set());
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

  onCompanyChange(value: string): void {
    this.companyId.set(value ? Number(value) : null);
    this.load();
  }

  onTeamChange(value: string): void {
    this.teamId.set(value ? Number(value) : null);
    this.load();
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

  // ---------- decisions ----------

  approve(entry: ApprovalEntry): void {
    this.run(this.api.approveDay(entry.id), 'Approved', `${entry.candidate} — ${entry.day} approved.`);
  }

  async reject(entry: ApprovalEntry): Promise<void> {
    const reason = await this.alerts.askReason(
      `Reject ${entry.candidate} — ${entry.day}?`,
      'Reason (the candidate will see this)',
      true,
    );
    if (reason === null) {
      return;
    }
    this.run(this.api.rejectDay(entry.id, reason), 'Rejected', 'The candidate has been notified.');
  }

  /** Approves the selected pending rows, or every pending row in the current view. */
  async approveMany(): Promise<void> {
    const selected = this.selectedIds();
    const targets = this.pendingInView().filter((e) => selected.size === 0 || selected.has(e.id));
    if (targets.length === 0) {
      this.alerts.warning('Nothing to approve', 'There are no pending days in this view.');
      return;
    }
    if (!(await this.alerts.confirm('Approve these days?', `${targets.length} day(s) will be approved.`, 'Approve'))) {
      return;
    }
    this.busy.set(true);
    this.api.approveMany(targets.map((e) => Number(e.id))).subscribe({
      next: (result) => {
        this.busy.set(false);
        this.alerts.success(
          `${result.approved} day(s) approved`,
          result.skipped.length ? `Skipped: ${result.skipped.join('; ')}` : undefined,
        );
        this.load();
      },
      error: (error) => {
        this.busy.set(false);
        this.alerts.error('Could not approve', errorMessage(error));
      },
    });
  }

  private run(request: ReturnType<AdminApi['approveDay']>, title: string, text: string): void {
    this.busy.set(true);
    request.subscribe({
      next: () => {
        this.busy.set(false);
        this.alerts.success(title, text);
        this.load();
      },
      error: (error) => {
        this.busy.set(false);
        this.alerts.error('Something went wrong', errorMessage(error));
      },
    });
  }

  // ---------- editing times ----------

  startEdit(entry: ApprovalEntry): void {
    this.editingId.set(entry.id);
    this.editError.set('');
    this.edit.set({
      logIn: entry.logIn,
      logOut: entry.logOut,
      breakMinutes: entry.breakMinutes,
      task: entry.task,
      description: entry.description,
    });
  }

  cancelEdit(): void {
    this.editingId.set(null);
  }

  setEdit<K extends keyof EditForm>(field: K, value: EditForm[K]): void {
    this.edit.update((form) => ({ ...form, [field]: value }));
  }

  saveEdit(): void {
    const id = this.editingId();
    const form = this.edit();
    if (!id) {
      return;
    }
    if (!form.logIn || !form.logOut || form.logOut <= form.logIn) {
      this.editError.set('Log-out must be after log-in.');
      return;
    }
    if (form.breakMinutes < 0 || form.breakMinutes > 600) {
      this.editError.set('Break must be between 0 and 600 minutes.');
      return;
    }
    if (form.task.trim().length > 80) {
      this.editError.set('Task can be at most 80 characters.');
      return;
    }
    this.busy.set(true);
    this.api
      .editDay(id, {
        logIn: form.logIn,
        logOut: form.logOut,
        breakMinutes: form.breakMinutes,
        task: form.task.trim() || null,
        description: form.description.trim() || null,
      })
      .subscribe({
        next: () => {
          this.busy.set(false);
          this.editingId.set(null);
          this.alerts.success('Changes saved', 'The edit was logged in the Activity Log.');
          this.load();
        },
        error: (error) => {
          this.busy.set(false);
          this.editError.set(errorMessage(error));
        },
      });
  }

  initials(name: string): string {
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.charAt(0) ?? '';
    const second = parts.length > 1 ? (parts[parts.length - 1]?.charAt(0) ?? '') : '';
    return (first + second).toUpperCase();
  }
}
