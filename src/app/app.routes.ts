import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./login/login').then((m) => m.Login) },
  {
    path: 'onboard',
    loadComponent: () => import('./onboarding/onboarding').then((m) => m.Onboarding),
  },
  {
    path: 'register-manager',
    loadComponent: () =>
      import('./register-manager/register-manager').then((m) => m.RegisterManager),
  },
  {
    path: 'super-admin',
    loadComponent: () =>
      import('./pages/super-admin/super-admin-shell').then((m) => m.SuperAdminShell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/super-admin/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'onboarding',
        loadComponent: () =>
          import('./pages/super-admin/onboarding/onboarding-approvals').then(
            (m) => m.OnboardingApprovals,
          ),
      },
      {
        path: 'timesheet-approvals',
        loadComponent: () =>
          import('./pages/super-admin/timesheet-approvals/timesheet-approvals').then(
            (m) => m.TimesheetApprovals,
          ),
      },
      {
        path: 'timesheets',
        loadComponent: () =>
          import('./pages/super-admin/timesheets/timesheets').then((m) => m.Timesheets),
      },
      {
        path: 'bulk-upload',
        loadComponent: () =>
          import('./pages/super-admin/bulk-upload/bulk-upload').then((m) => m.BulkUpload),
      },
      {
        path: 'people',
        loadComponent: () => import('./pages/super-admin/people/people').then((m) => m.People),
      },
      {
        path: 'roles-access',
        loadComponent: () =>
          import('./pages/super-admin/roles-access/roles-access').then((m) => m.RolesAccess),
      },
      {
        path: 'activity-log',
        loadComponent: () =>
          import('./pages/super-admin/activity-log/activity-log').then((m) => m.ActivityLog),
      },
    ],
  },
  // Legacy links from before the nested /super-admin/* routing existed.
  { path: 'onboarding-approvals', redirectTo: 'super-admin/onboarding' },
  { path: 'timesheet-approvals', redirectTo: 'super-admin/timesheet-approvals' },
  {
    path: 'super-admin-manager',
    loadComponent: () =>
      import('./pages/super-admin-manager/super-admin-manager-shell').then(
        (m) => m.SuperAdminManagerShell,
      ),
    // Independent copies of the Super Admin pages — edit these freely without
    // affecting /super-admin.
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/super-admin-manager/dashboard/dashboard').then(
            (m) => m.ManagerDashboard,
          ),
      },
      {
        path: 'onboarding',
        loadComponent: () =>
          import('./pages/super-admin-manager/onboarding/onboarding-approvals').then(
            (m) => m.ManagerOnboardingApprovals,
          ),
      },
      {
        path: 'timesheet-approvals',
        loadComponent: () =>
          import('./pages/super-admin-manager/timesheet-approvals/timesheet-approvals').then(
            (m) => m.ManagerTimesheetApprovals,
          ),
      },
      {
        path: 'timesheets',
        loadComponent: () =>
          import('./pages/super-admin-manager/timesheets/timesheets').then(
            (m) => m.ManagerTimesheets,
          ),
      },
      {
        path: 'bulk-upload',
        loadComponent: () =>
          import('./pages/super-admin-manager/bulk-upload/bulk-upload').then(
            (m) => m.ManagerBulkUpload,
          ),
      },
      {
        path: 'people',
        loadComponent: () =>
          import('./pages/super-admin-manager/people/people').then((m) => m.ManagerPeople),
      },
      {
        path: 'roles-access',
        loadComponent: () =>
          import('./pages/super-admin-manager/roles-access/roles-access').then(
            (m) => m.ManagerRolesAccess,
          ),
      },
      {
        path: 'activity-log',
        loadComponent: () =>
          import('./pages/super-admin-manager/activity-log/activity-log').then(
            (m) => m.ManagerActivityLog,
          ),
      },
    ],
  },
  {
    path: 'hr',
    loadComponent: () => import('./pages/hr/hr-shell').then((m) => m.HrShell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/hr/dashboard/dashboard').then((m) => m.HrDashboard),
      },
      {
        path: 'onboarding',
        loadComponent: () =>
          import('./pages/hr/onboarding/onboarding-approvals').then(
            (m) => m.HrOnboardingApprovals,
          ),
      },
      {
        path: 'timesheet-approvals',
        loadComponent: () =>
          import('./pages/hr/timesheet-approvals/timesheet-approvals').then(
            (m) => m.HrTimesheetApprovals,
          ),
      },
      {
        path: 'timesheets',
        loadComponent: () =>
          import('./pages/hr/timesheets/timesheets').then((m) => m.HrTimesheets),
      },
      {
        path: 'people',
        loadComponent: () => import('./pages/hr/people/people').then((m) => m.HrPeople),
      },
      {
        path: 'activity-log',
        loadComponent: () =>
          import('./pages/hr/activity-log/activity-log').then((m) => m.HrActivityLog),
      },
    ],
  },
  {
    path: 'editor-contributor',
    loadComponent: () =>
      import('./pages/editor-contributor/editor-contributor-shell').then(
        (m) => m.EditorContributorShell,
      ),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/editor-contributor/dashboard/dashboard').then(
            (m) => m.EditorDashboard,
          ),
      },
      {
        path: 'timesheet-approvals',
        loadComponent: () =>
          import('./pages/editor-contributor/timesheet-approvals/timesheet-approvals').then(
            (m) => m.EditorTimesheetApprovals,
          ),
      },
      {
        path: 'timesheets',
        loadComponent: () =>
          import('./pages/editor-contributor/timesheets/timesheets').then(
            (m) => m.EditorTimesheets,
          ),
      },
      {
        path: 'bulk-upload',
        loadComponent: () =>
          import('./pages/editor-contributor/bulk-upload/bulk-upload').then(
            (m) => m.EditorBulkUpload,
          ),
      },
      {
        path: 'activity-log',
        loadComponent: () =>
          import('./pages/editor-contributor/activity-log/activity-log').then(
            (m) => m.EditorActivityLog,
          ),
      },
    ],
  },
  {
    path: 'contributor-view',
    loadComponent: () =>
      import('./pages/contributor-view/contributor-view-shell').then(
        (m) => m.ContributorViewShell,
      ),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/contributor-view/dashboard/dashboard').then(
            (m) => m.ContributorViewDashboard,
          ),
      },
      {
        path: 'timesheet-approvals',
        loadComponent: () =>
          import('./pages/contributor-view/timesheet-approvals/timesheet-approvals').then(
            (m) => m.ContributorViewTimesheetApprovals,
          ),
      },
      {
        path: 'timesheets',
        loadComponent: () =>
          import('./pages/contributor-view/timesheets/timesheets').then(
            (m) => m.ContributorViewTimesheets,
          ),
      },
      {
        path: 'activity-log',
        loadComponent: () =>
          import('./pages/contributor-view/activity-log/activity-log').then(
            (m) => m.ContributorViewActivityLog,
          ),
      },
    ],
  },
  {
    path: 'candidate',
    loadComponent: () =>
      import('./pages/candidate/candidate-shell').then((m) => m.CandidateShell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/candidate/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'my-timesheet',
        loadComponent: () =>
          import('./pages/candidate/my-timesheet/my-timesheet').then((m) => m.MyTimesheet),
      },
      {
        path: 'upload-hours',
        loadComponent: () =>
          import('./pages/candidate/upload-hours/upload-hours').then((m) => m.UploadHours),
      },
      {
        path: 'my-history',
        loadComponent: () =>
          import('./pages/candidate/my-history/my-history').then((m) => m.MyHistory),
      },
      {
        path: 'my-profile',
        loadComponent: () =>
          import('./pages/candidate/my-profile/my-profile').then((m) => m.MyProfile),
      },
    ],
  },
  {
    path: 'resource-manager-view',
    loadComponent: () =>
      import('./pages/resource-manager-view/resource-manager-view-shell').then(
        (m) => m.ResourceManagerViewShell,
      ),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/resource-manager-view/dashboard/dashboard').then(
            (m) => m.ResourceManagerViewDashboard,
          ),
      },
      {
        path: 'timesheets',
        loadComponent: () =>
          import('./pages/resource-manager-view/timesheets/timesheets').then(
            (m) => m.ResourceManagerViewTimesheets,
          ),
      },
    ],
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];
