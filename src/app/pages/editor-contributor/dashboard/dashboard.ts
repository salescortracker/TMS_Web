import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminApi, DaySegment, Dashboard as DashboardData } from '../../../shared/api/admin.api';
import { errorMessage } from '../../../shared/api/api-helpers';
import { LookupItem, PublicApi } from '../../../shared/api/public.api';
import { AuthService } from '../../../shared/auth.service';

@Component({
  imports: [RouterLink, DatePipe],
  selector: 'app-editor-dashboard',
  templateUrl: './dashboard.html',
})
export class EditorDashboard implements OnInit {
  private readonly api = inject(AdminApi);
  private readonly lookupApi = inject(PublicApi);

  protected readonly home = inject(AuthService).homeRoute();
  protected readonly data = signal<DashboardData | null>(null);
  protected readonly companies = signal<LookupItem[]>([]);
  protected readonly teams = signal<LookupItem[]>([]);
  protected readonly companyId = signal<number | null>(null);
  protected readonly teamId = signal<number | null>(null);
  protected readonly loading = signal(true);
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
    this.api.dashboard({ companyId: this.companyId(), teamId: this.teamId() }).subscribe({
      next: (data) => {
        this.data.set(data);
        this.loading.set(false);
      },
      error: (error) => {
        this.errorText.set(errorMessage(error));
        this.loading.set(false);
      },
    });
  }

  onCompanyChange(value: string): void {
    this.companyId.set(value ? Number(value) : null);
    this.load();
  }

  onTeamChange(value: string): void {
    this.teamId.set(value ? Number(value) : null);
    this.load();
  }

  protected toneClass(prefix: string, tone: string | null | undefined): string {
    return tone ? `${prefix}--${tone}` : '';
  }

  protected dayTotal(segment: DaySegment): number {
    return segment.approved + segment.pending + segment.rejected + segment.notSubmitted;
  }

  protected segmentHeight(count: number, total: number): string {
    return `${total > 0 ? (count / total) * 100 : 0}%`;
  }

  protected rejectedClass(value: number): string {
    return value > 0 ? 'cell--danger' : '';
  }
}
