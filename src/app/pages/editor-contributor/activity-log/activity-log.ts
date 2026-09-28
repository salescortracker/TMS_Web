import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivityEntry, AdminApi, EmailAlert } from '../../../shared/api/admin.api';
import { errorMessage } from '../../../shared/api/api-helpers';

type LogFilter = 'Everything' | 'Submissions' | 'Approvals' | 'Edits & roles' | 'Alerts';
type LogTab = 'Activity' | 'Email alerts';

const FILTERS: LogFilter[] = ['Everything', 'Submissions', 'Approvals', 'Edits & roles', 'Alerts'];

@Component({
  imports: [DatePipe],
  selector: 'app-editor-activity-log',
  templateUrl: './activity-log.html',
})
export class EditorActivityLog implements OnInit {
  private readonly api = inject(AdminApi);

  protected readonly filters = FILTERS;
  protected readonly activity = signal<ActivityEntry[]>([]);
  protected readonly emailAlerts = signal<EmailAlert[]>([]);
  protected readonly loading = signal(true);
  protected readonly errorText = signal('');

  protected readonly tab = signal<LogTab>('Activity');
  protected readonly activeFilter = signal<LogFilter>('Everything');
  protected readonly searchQuery = signal('');

  ngOnInit(): void {
    this.loadActivity();
    this.api.emails().subscribe({
      next: (alerts) => this.emailAlerts.set(alerts),
      error: (error) => this.errorText.set(errorMessage(error)),
    });
  }

  private loadActivity(): void {
    this.loading.set(true);
    const filter = this.activeFilter();
    this.api.activity(filter === 'Everything' ? null : filter, this.searchQuery().trim() || null).subscribe({
      next: (entries) => {
        this.activity.set(entries);
        this.loading.set(false);
      },
      error: (error) => {
        this.errorText.set(errorMessage(error));
        this.loading.set(false);
      },
    });
  }

  setTab(tab: LogTab): void {
    this.tab.set(tab);
  }

  setFilter(filter: LogFilter): void {
    this.activeFilter.set(filter);
    this.loadActivity();
  }

  onSearchInput(value: string): void {
    this.searchQuery.set(value);
  }

  search(): void {
    this.loadActivity();
  }
}
