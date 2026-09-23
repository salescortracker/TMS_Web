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
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        // Srikanth Boora is a second full Super Administrator account — same
        // dashboard content as /super-admin, just a different signed-in user.
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/super-admin/dashboard/dashboard').then((m) => m.Dashboard),
      },
    ],
  },
  {
    path: 'hr',
    loadComponent: () => import('./pages/hr/hr').then((m) => m.Hr),
  },
  {
    path: 'editor-contributor',
    loadComponent: () =>
      import('./pages/editor-contributor/editor-contributor').then((m) => m.EditorContributor),
  },
  {
    path: 'contributor-view',
    loadComponent: () =>
      import('./pages/contributor-view/contributor-view').then((m) => m.ContributorView),
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
      import('./pages/resource-manager-view/resource-manager-view').then(
        (m) => m.ResourceManagerView,
      ),
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];
