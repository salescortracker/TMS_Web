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
    loadComponent: () => import('./pages/super-admin/super-admin').then((m) => m.SuperAdmin),
  },
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
