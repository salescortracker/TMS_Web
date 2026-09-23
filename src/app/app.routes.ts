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
    ],
  },
  // Legacy links from before the nested /super-admin/* routing existed.
  { path: 'onboarding-approvals', redirectTo: 'super-admin/onboarding' },
  { path: 'timesheet-approvals', redirectTo: 'super-admin/timesheet-approvals' },
  {
    path: 'super-admin-manager',
    loadComponent: () =>
      import('./pages/super-admin-manager/super-admin-manager').then((m) => m.SuperAdminManager),
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
    loadComponent: () => import('./pages/candidate/candidate').then((m) => m.Candidate),
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
