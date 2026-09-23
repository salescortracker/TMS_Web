import type { NavItem } from '../layout/layout';

export const SUPER_ADMIN_MANAGER_NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/super-admin-manager/dashboard' },
  { label: 'Onboarding', path: '/super-admin-manager/onboarding', disabled: true },
  { label: 'Timesheet Approvals', path: '/super-admin-manager/timesheet-approvals', disabled: true },
  { label: 'Timesheets', path: '/super-admin-manager/timesheets', disabled: true },
  { label: 'Bulk Upload', path: '/super-admin-manager/bulk-upload', disabled: true },
  { label: 'People', path: '/super-admin-manager/people', disabled: true },
  { label: 'Roles & Access', path: '/super-admin-manager/roles-access', disabled: true },
  { label: 'Activity Log', path: '/super-admin-manager/activity-log', disabled: true },
];
