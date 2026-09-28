import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { toParams } from './api-helpers';

// ---------- Onboarding approvals ----------
export interface Applicant {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: string;
  team: string;
  company: string;
  submitted: string;
  flag: string | null;
  status: string;
}

export interface ApplicantList {
  items: Applicant[];
  seatsUsed: number;
  seatsTotal: number;
}

export interface ActivationResult {
  id: string;
  name: string;
  email: string;
  status: string;
  temporaryPassword: string | null;
  message: string;
}

export interface BulkActivationResult {
  approved: number;
  skippedFlagged: number;
  results: ActivationResult[];
}

// ---------- Timesheet approvals ----------
export interface ApprovalEntry {
  id: string;
  candidateId: number;
  candidate: string;
  email: string;
  team: string;
  company: string;
  day: string;
  workDate: string;
  timeRange: string;
  logIn: string;
  logOut: string;
  breakMinutes: number;
  task: string;
  description: string;
  hours: string;
  weekProgress: string;
  checks: string;
  flagReason: string | null;
  decision: string;
  rejectionReason: string | null;
}

export interface ApprovalEdit {
  logIn: string;
  logOut: string;
  breakMinutes: number;
  task: string | null;
  description: string | null;
}

export interface ApproveManyResult {
  approved: number;
  skipped: string[];
}

// ---------- Dashboard ----------
export interface StatCard {
  label: string;
  value: number;
  tone: string | null;
  highlight: boolean;
}

export interface CompanyTeamRow {
  name: string;
  candidates: number;
  clockedIn: number;
  submitted: number;
  pending: number;
  approved: number;
  rejected: number;
  notSubmitted: number;
}

export interface AttendanceRow {
  name: string;
  team: string;
  timeRange: string;
  breakLabel: string;
  breakAlert: boolean;
  status: string;
  statusTone: string;
}

export interface DaySegment {
  day: string;
  total: number | null;
  approved: number;
  pending: number;
  rejected: number;
  notSubmitted: number;
  note: string;
}

export interface WaitingItem {
  name: string;
  since: string;
  days: number;
}

export interface ActivityItem {
  actor: string;
  action: string;
  description: string | null;
  category: string;
  time: string;
  tone: string;
}

export interface Dashboard {
  weekLabel: string;
  scopeLabel: string;
  stats: StatCard[];
  teamRows: CompanyTeamRow[];
  attendance: AttendanceRow[];
  weekSegments: DaySegment[];
  waiting: WaitingItem[];
  recent: ActivityItem[];
}

// ---------- Timesheets report ----------
export interface TeamSummaryRow {
  name: string;
  candidates: number;
  hours: string;
  submitted: number;
  approved: number;
  pending: number;
  rejected: number;
}

export interface CandidateSummaryRow {
  candidateId: number;
  name: string;
  team: string;
  weekHours: string;
  submitted: number;
  approved: number;
  pending: number;
  rejected: number;
}

export interface PeriodOption {
  value: string;
  label: string;
}

export interface TimesheetReport {
  mode: 'weekly' | 'monthly';
  periodLabel: string;
  periodValue: string;
  periods: PeriodOption[];
  totalSubmitted: number;
  totalApproved: number;
  totalPending: number;
  totalRejected: number;
  teamRows: TeamSummaryRow[];
  candidates: CandidateSummaryRow[];
}

// ---------- People ----------
export interface PersonListItem {
  id: string;
  name: string;
  team: string;
  company: string;
  since: string;
  role: string;
}

export interface MonthSubmission {
  label: string;
  daysSubmitted: number;
  hours: string;
  approved: number;
  pending: number;
  lastSubmission: string;
  tone: string;
}

export interface PersonDetail {
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
  role: string;
  timesheetsSummary: string;
  timeline: MonthSubmission[];
}

export interface StaffMemberInfo {
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

// ---------- Activity ----------
export interface ActivityEntry {
  id: number;
  actor: string;
  action: string;
  description: string;
  category: string;
  tone: string;
  time: string;
}

export interface EmailAlert {
  id: number;
  recipient: string;
  subject: string;
  time: string;
}

export interface AppNotification {
  id: number;
  title: string;
  message: string | null;
  linkUrl: string | null;
  isRead: boolean;
  time: string;
}

export interface Notifications {
  unread: number;
  items: AppNotification[];
}

// ---------- Roles & access ----------
export interface MenuItem {
  code: string;
  name: string;
}

export interface PermissionItem {
  code: string;
  description: string;
}

export interface RoleSummary {
  roleId: number;
  name: string;
  description: string;
  isBuiltIn: boolean;
  people: number;
  menus: string[];
  permissions: string[];
}

export interface RolesOverview {
  roles: RoleSummary[];
  allMenus: MenuItem[];
  allPermissions: PermissionItem[];
}

export interface RoleSave {
  name: string;
  description: string | null;
  menus: string[];
  permissions: string[];
}

export interface StaffUser {
  appUserId: number;
  name: string;
  email: string;
  role: string;
  scope: string;
  status: string;
  lastLogin: string;
  isCandidate: boolean;
}

export interface UserAdd {
  fullName: string;
  email: string;
  roleId: number;
  companyId: number | null;
  teamId: number | null;
}

export interface UserCreated {
  appUserId: number;
  name: string;
  email: string;
  temporaryPassword: string;
}

// ---------- Bulk upload ----------
export interface UploadRowResult {
  row: number;
  candidate: string;
  date: string;
  status: 'Valid' | 'Error';
  message: string | null;
}

export interface UploadResult {
  batchId: number;
  fileName: string;
  total: number;
  imported: number;
  errors: number;
  status: string;
  rows: UploadRowResult[];
}

export interface UploadBatch {
  batchId: number;
  fileName: string;
  uploadedBy: string;
  uploadedAt: string;
  total: number;
  imported: number;
  errors: number;
  status: string;
}

export interface Filters {
  companyId?: number | null;
  teamId?: number | null;
  search?: string | null;
}

/** All staff-facing calls (approvals, dashboard, reports, people, access, activity, uploads). */
@Injectable({ providedIn: 'root' })
export class AdminApi {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;

  // onboarding
  applicants() {
    return this.http.get<ApplicantList>(`${this.base}/onboarding`);
  }
  approveApplicant(id: string) {
    return this.http.post<ActivationResult>(`${this.base}/onboarding/${id}/approve`, {});
  }
  rejectApplicant(id: string, reason: string | null) {
    return this.http.post<ActivationResult>(`${this.base}/onboarding/${id}/reject`, { reason });
  }
  approveAllApplicants() {
    return this.http.post<BulkActivationResult>(`${this.base}/onboarding/approve-all`, {});
  }

  // timesheet approvals
  approvals(filters: Filters) {
    return this.http.get<{ items: ApprovalEntry[] }>(`${this.base}/approvals`, { params: toParams({ ...filters }) });
  }
  approveDay(id: string) {
    return this.http.post<void>(`${this.base}/approvals/${id}/approve`, {});
  }
  rejectDay(id: string, reason: string) {
    return this.http.post<void>(`${this.base}/approvals/${id}/reject`, { reason });
  }
  editDay(id: string, body: ApprovalEdit) {
    return this.http.put<ApprovalEntry>(`${this.base}/approvals/${id}`, body);
  }
  approveMany(ids: number[]) {
    return this.http.post<ApproveManyResult>(`${this.base}/approvals/approve-many`, { ids });
  }

  // dashboard + reports
  dashboard(filters: Filters) {
    return this.http.get<Dashboard>(`${this.base}/dashboard`, { params: toParams({ ...filters }) });
  }
  report(mode: string, period: string | null, filters: Filters) {
    return this.http.get<TimesheetReport>(`${this.base}/timesheets`, {
      params: toParams({ mode, period, ...filters }),
    });
  }
  exportReport(mode: string, period: string | null, filters: Filters) {
    return this.http.get(`${this.base}/timesheets/export`, {
      params: toParams({ mode, period, ...filters }),
      responseType: 'blob',
    });
  }

  // people
  people(filters: Filters) {
    return this.http.get<PersonListItem[]>(`${this.base}/people`, { params: toParams({ ...filters }) });
  }
  staff() {
    return this.http.get<StaffMemberInfo[]>(`${this.base}/people/staff`);
  }
  person(id: string) {
    return this.http.get<PersonDetail>(`${this.base}/people/${id}`);
  }

  // activity + notifications
  activity(category: string | null, search: string | null) {
    return this.http.get<ActivityEntry[]>(`${this.base}/activity`, { params: toParams({ category, search }) });
  }
  emails() {
    return this.http.get<EmailAlert[]>(`${this.base}/activity/emails`);
  }
  notifications() {
    return this.http.get<Notifications>(`${this.base}/notifications`);
  }
  markAllNotificationsRead() {
    return this.http.post<void>(`${this.base}/notifications/read`, {});
  }

  // roles & access
  roles() {
    return this.http.get<RolesOverview>(`${this.base}/access/roles`);
  }
  createRole(body: RoleSave) {
    return this.http.post<RoleSummary>(`${this.base}/access/roles`, body);
  }
  updateRole(id: number, body: RoleSave) {
    return this.http.put<RoleSummary>(`${this.base}/access/roles/${id}`, body);
  }
  deleteRole(id: number) {
    return this.http.delete<void>(`${this.base}/access/roles/${id}`);
  }
  users(search: string | null) {
    return this.http.get<StaffUser[]>(`${this.base}/access/users`, { params: toParams({ search }) });
  }
  addUser(body: UserAdd) {
    return this.http.post<UserCreated>(`${this.base}/access/users`, body);
  }
  changeUserRole(id: number, roleId: number, companyId: number | null, teamId: number | null) {
    return this.http.put<void>(`${this.base}/access/users/${id}/role`, { roleId, companyId, teamId });
  }
  setUserActive(id: number, active: boolean) {
    return this.http.post<void>(`${this.base}/access/users/${id}/${active ? 'activate' : 'deactivate'}`, {});
  }
  resetPassword(id: number) {
    return this.http.post<UserCreated>(`${this.base}/access/users/${id}/reset-password`, {});
  }

  // bulk upload
  upload(file: File) {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<UploadResult>(`${this.base}/uploads`, form);
  }
  uploadHistory() {
    return this.http.get<UploadBatch[]>(`${this.base}/uploads/history`);
  }
  template(kind: 'blank' | 'valid' | 'errors') {
    return this.http.get(`${this.base}/uploads/template`, { params: { kind }, responseType: 'blob' });
  }
}
