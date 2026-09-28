import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { toParams } from './api-helpers';

export interface Day {
  date: string;
  dayName: string;
  dateLabel: string;
  logIn: string;
  logOut: string;
  breakMinutes: number;
  task: string;
  description: string;
  status: string;
  editable: boolean;
  hours: number | null;
  rejectionReason: string | null;
  flagReason: string | null;
}

export interface Week {
  weekStart: string;
  weekEnd: string;
  label: string;
  targetHours: number;
  loggedHours: number;
  approved: number;
  pending: number;
  rejected: number;
  saved: number;
  drafts: number;
  readyToSubmit: number;
  hasNext: boolean;
  days: Day[];
}

export interface SaveDayRequest {
  logIn: string | null;
  logOut: string | null;
  breakMinutes: number;
  task: string | null;
  description: string | null;
  saveAs: 'Draft' | 'Saved';
}

export interface SubmitResult {
  submitted: number;
  skipped: string[];
}

export interface Badge {
  label: string;
  tone: string;
}

export interface HistoryWeek {
  weekStart: string;
  weekLabel: string;
  hours: string;
  badges: Badge[];
  isCurrent: boolean;
}

export interface DashboardDay {
  day: string;
  date: string;
  status: string;
  hours: string | null;
  task: string | null;
  isToday: boolean;
}

export interface CandidateDashboard {
  fullName: string;
  weekLabel: string;
  submitted: number;
  pending: number;
  approved: number;
  rejected: number;
  drafts: number;
  weekLoggedHours: number;
  weekTargetHours: number;
  todayNotSubmitted: boolean;
  days: DashboardDay[];
}

export interface ClockState {
  status: 'NotClockedIn' | 'Working' | 'OnBreak' | 'ClockedOut';
  clockInAt: string | null;
  clockOutAt: string | null;
  onBreakSince: string | null;
  breakMinutes: number;
  breakCount: number;
  workedMinutes: number;
  localDate: string;
  timeZoneId: string;
  message: string | null;
}

export interface Profile {
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  joiningDate: string | null;
  phoneDialCode: string | null;
  phoneNumber: string | null;
  email: string;
  teamId: number | null;
  companyId: number | null;
}

/** Everything a signed-in candidate does with their own timesheet. */
@Injectable({ providedIn: 'root' })
export class CandidateApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/my`;

  week(weekStart?: string | null) {
    return this.http.get<Week>(`${this.base}/week`, { params: toParams({ weekStart }) });
  }

  saveDay(date: string, body: SaveDayRequest) {
    return this.http.put<Day>(`${this.base}/days/${date}`, body);
  }

  submitDay(date: string) {
    return this.http.post<Day>(`${this.base}/days/${date}/submit`, {});
  }

  submitReady(weekStart?: string | null) {
    return this.http.post<SubmitResult>(`${this.base}/submit-ready`, {}, { params: toParams({ weekStart }) });
  }

  history() {
    return this.http.get<HistoryWeek[]>(`${this.base}/history`);
  }

  dashboard() {
    return this.http.get<CandidateDashboard>(`${this.base}/dashboard`);
  }

  profile() {
    return this.http.get<Profile>(`${this.base}/profile`);
  }

  updateProfile(body: Profile) {
    return this.http.put<Profile>(`${this.base}/profile`, body);
  }

  clock() {
    return this.http.get<ClockState>(`${this.base}/clock`);
  }

  clockAction(action: 'in' | 'out' | 'break-start' | 'break-end') {
    return this.http.post<ClockState>(`${this.base}/clock/${action}`, {});
  }
}
