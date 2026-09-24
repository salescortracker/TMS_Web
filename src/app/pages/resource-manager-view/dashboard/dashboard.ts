import { Component } from '@angular/core';

type Tone = 'success' | 'warning' | 'danger' | 'neutral';

interface StatCard {
  label: string;
  value: number | string;
  tone?: Tone;
  highlight?: boolean;
}

interface CompanyTeamRow {
  name: string;
  candidates: number;
  clockedIn: number;
  submitted: number;
  pending: number;
  approved: number;
  rejected: number;
  notSubmitted: number;
}

interface AttendanceRow {
  name: string;
  team: string;
  timeRange: string;
  breakLabel: string;
  breakAlert?: boolean;
  status: 'Working' | 'On break' | 'Clocked out';
  statusTone: Tone;
}

interface DaySegment {
  day: string;
  total: number | null;
  approved: number;
  pending: number;
  rejected: number;
  notSubmitted: number;
  note: string;
}

interface WaitingItem {
  name: string;
  since: string;
  days: number;
}

interface ActivityItem {
  actor: string;
  action: string;
  time: string;
  tone: Tone;
}

const STAT_CARDS: StatCard[] = [
  { label: 'Days submitted this week', value: 23 },
  { label: 'Pending approval', value: 38, tone: 'warning', highlight: true },
  { label: 'Approved this week', value: 17, tone: 'success' },
  { label: 'Rejected — needs a fix', value: 1, tone: 'danger' },
  { label: 'Not submitted for Wednesday, Sep 23', value: 6 },
  { label: 'Onboarding pending', value: 6 },
  { label: 'Break-time alerts (2 weeks)', value: 1, tone: 'danger' },
  { label: 'Active candidates', value: 11 },
  { label: 'Clocked in now', value: 5, tone: 'success' },
  { label: 'On break now', value: 2, tone: 'warning' },
];

const COMPANY_TEAM_ROWS: CompanyTeamRow[] = [
  {
    name: 'Cortracker Inc · India team',
    candidates: 3,
    clockedIn: 2,
    submitted: 7,
    pending: 6,
    approved: 6,
    rejected: 1,
    notSubmitted: 2,
  },
  {
    name: 'Cortracker Inc · USA team',
    candidates: 5,
    clockedIn: 1,
    submitted: 10,
    pending: 20,
    approved: 7,
    rejected: 0,
    notSubmitted: 3,
  },
  {
    name: 'Perfect Solutions Group Inc · USA team',
    candidates: 3,
    clockedIn: 2,
    submitted: 6,
    pending: 12,
    approved: 4,
    rejected: 0,
    notSubmitted: 1,
  },
];

const ATTENDANCE_ROWS: AttendanceRow[] = [
  {
    name: 'Daniel Osei',
    team: 'Perfect Solutions Group Inc · USA team',
    timeRange: 'In 10:39 AM',
    breakLabel: 'Break 1h 10m — over 1 hour',
    breakAlert: true,
    status: 'On break',
    statusTone: 'warning',
  },
  {
    name: 'Wei Chen',
    team: 'Cortracker Inc · USA team',
    timeRange: 'In 11:09 AM',
    breakLabel: 'Break 25m',
    status: 'On break',
    statusTone: 'warning',
  },
  {
    name: 'Arjun Mehta',
    team: 'Cortracker Inc · India team',
    timeRange: 'In 12:04 PM',
    breakLabel: 'Break 0m',
    status: 'Working',
    statusTone: 'success',
  },
  {
    name: 'Mateo Fernandez',
    team: 'Perfect Solutions Group Inc · USA team',
    timeRange: 'In 1:09 PM',
    breakLabel: 'Break 0m',
    status: 'Working',
    statusTone: 'success',
  },
  {
    name: 'Priya Natarajan',
    team: 'Cortracker Inc · India team',
    timeRange: 'In 11:49 AM',
    breakLabel: 'Break 0m',
    status: 'Working',
    statusTone: 'success',
  },
  {
    name: 'Fatima Sheikh',
    team: 'Cortracker Inc · India team',
    timeRange: 'In 6:39 AM · out 2:39 PM',
    breakLabel: 'Break 45m',
    status: 'Clocked out',
    statusTone: 'neutral',
  },
];

const WEEK_SEGMENTS: DaySegment[] = [
  { day: 'Mon', total: 9, approved: 8, pending: 1, rejected: 0, notSubmitted: 2, note: '1 pending' },
  { day: 'Tue', total: 9, approved: 8, pending: 1, rejected: 0, notSubmitted: 2, note: '1 pending' },
  { day: 'Wed', total: 5, approved: 1, pending: 4, rejected: 0, notSubmitted: 6, note: '4 pending' },
  { day: 'Thu', total: null, approved: 0, pending: 0, rejected: 0, notSubmitted: 11, note: 'upcoming' },
  { day: 'Fri', total: null, approved: 0, pending: 0, rejected: 0, notSubmitted: 11, note: 'upcoming' },
];

const WAITING_ITEMS: WaitingItem[] = [
  { name: 'Jordan Alvarez', since: 'Sep 14', days: 8 },
  { name: 'Priya Natarajan', since: 'Sep 14', days: 6 },
  { name: 'Mateo Fernandez', since: 'Sep 14', days: 6 },
  { name: 'Wei Chen', since: 'Sep 14', days: 5 },
  { name: 'Daniel Osei', since: 'Sep 14', days: 5 },
  { name: 'Omar Haddad', since: 'Sep 14', days: 5 },
];

const RECENT_ACTIVITY: ActivityItem[] = [
  {
    actor: 'Wei Chen',
    action: 'exceeded a 1-hour break on Wednesday',
    time: 'Sep 23, 2:57 PM',
    tone: 'danger',
  },
  {
    actor: 'Srikanth Boora',
    action: "edited Jordan Alvarez's timesheet",
    time: 'Sep 23, 1:59 PM',
    tone: 'warning',
  },
  {
    actor: 'Mateo Fernandez',
    action: 'saved this week as a draft',
    time: 'Sep 23, 12:09 PM',
    tone: 'neutral',
  },
  {
    actor: 'Priya Natarajan',
    action: "submitted this week's timesheet",
    time: 'Sep 22, 1:09 PM',
    tone: 'success',
  },
  {
    actor: 'Naresh Kumar',
    action: 'approved candidate Priya Natarajan',
    time: 'Sep 22, 9:09 AM',
    tone: 'success',
  },
  {
    actor: 'Vijay Mohan',
    action: 'viewed the HR roster',
    time: 'Sep 21, 3:09 PM',
    tone: 'neutral',
  },
  {
    actor: 'Naresh Kumar',
    action: 'rejected candidate "qwerty asdf"',
    time: 'Sep 20, 3:09 PM',
    tone: 'danger',
  },
];

@Component({
  imports: [],
  selector: 'app-resource-manager-view-dashboard',
  templateUrl: './dashboard.html',
})
export class ResourceManagerViewDashboard {
  protected readonly statCards = STAT_CARDS;
  protected readonly companyTeamRows = COMPANY_TEAM_ROWS;
  protected readonly attendanceRows = ATTENDANCE_ROWS;
  protected readonly weekSegments = WEEK_SEGMENTS;
  protected readonly waitingItems = WAITING_ITEMS;
  protected readonly recentActivity = RECENT_ACTIVITY;

  protected toneClass(prefix: string, tone: Tone | undefined): string {
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
