import type { NavItem } from '../layout/layout';

export const SUPER_ADMIN_NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/super-admin/dashboard' },
  { label: 'Onboarding', path: '/super-admin/onboarding' },
  { label: 'Timesheet Approvals', path: '/super-admin/timesheet-approvals' },
  { label: 'Timesheets', path: '/super-admin/timesheets' },
  { label: 'Bulk Upload', path: '/super-admin/bulk-upload' },
  { label: 'People', path: '/super-admin/people' },
  { label: 'Roles & Access', path: '/super-admin/roles-access' },
  { label: 'Activity Log', path: '/super-admin/activity-log' },
];
