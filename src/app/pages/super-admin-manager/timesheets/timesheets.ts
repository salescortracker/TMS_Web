import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminApi, TimesheetReport } from '../../../shared/api/admin.api';
import { errorMessage, saveBlob } from '../../../shared/api/api-helpers';
import { LookupItem, PublicApi } from '../../../shared/api/public.api';
import { AuthService } from '../../../shared/auth.service';

type ViewMode = 'weekly' | 'monthly';

@Component({
  imports: [RouterLink],
  selector: 'app-manager-timesheets',
  templateUrl: './timesheets.html',
})
export class ManagerTimesheets implements OnInit {
  private readonly api = inject(AdminApi);
  private readonly lookupApi = inject(PublicApi);
  private readonly auth = inject(AuthService);

  protected readonly home = this.auth.homeRoute();
  protected readonly canOpenPeople = this.auth.hasMenu('people');

  protected readonly report = signal<TimesheetReport | null>(null);
  protected readonly companies = signal<LookupItem[]>([]);
  protected readonly teams = signal<LookupItem[]>([]);
  protected readonly companyId = signal<number | null>(null);
  protected readonly teamId = signal<number | null>(null);
  protected readonly search = signal('');
  protected readonly period = signal<string | null>(null);
  protected readonly viewMode = signal<ViewMode>('weekly');
  protected readonly loading = signal(true);
  protected readonly exporting = signal(false);
  protected readonly errorText = signal('');

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
    this.errorText.set('');
    this.api.report(this.viewMode(), this.period(), this.filters()).subscribe({
      next: (report) => {
        this.report.set(report);
        this.period.set(report.periodValue);
        this.loading.set(false);
      },
      error: (error) => {
        this.errorText.set(errorMessage(error));
        this.loading.set(false);
      },
    });
  }

  private filters() {
    return { companyId: this.companyId(), teamId: this.teamId(), search: this.search().trim() };
  }

  setViewMode(mode: ViewMode): void {
    this.viewMode.set(mode);
    this.period.set(null);
    this.load();
  }

  onPeriodChange(value: string): void {
    this.period.set(value);
    this.load();
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
    this.search.set(value);
  }

  exportExcel(): void {
    this.exporting.set(true);
    this.api.exportReport(this.viewMode(), this.period(), this.filters()).subscribe({
      next: (blob) => {
        saveBlob(blob, `timesheets-${this.period() ?? 'report'}.xlsx`);
        this.exporting.set(false);
      },
      error: (error) => {
        this.exporting.set(false);
        this.errorText.set(errorMessage(error));
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
