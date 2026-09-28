import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface LoginResponse {
  token: string;
  expiresAt: string;
  appUserId: number;
  fullName: string;
  email: string;
  mustChangePassword: boolean;
  roles: string[];
  permissions: string[];
  menus: string[];
}

const STORAGE_KEY = 'tms_auth';

// Maps a Role.RoleName from the JWT to the Angular route for that role.
export const ROLE_HOME_ROUTES: Record<string, string> = {
  Admin: '/super-admin',
  Manager: '/super-admin-manager',
  HR: '/hr',
  Editor: '/editor-contributor',
  'Contributor View': '/contributor-view',
  'Resource Manager View': '/resource-manager-view',
  Candidate: '/candidate',
};

const ROLE_TITLES: Record<string, string> = {
  Admin: 'Super Administrator',
  Manager: 'Super Administrator (Manager)',
  HR: 'HR',
  Editor: 'Editor / Contributor',
  'Contributor View': 'Contributor (View)',
  'Resource Manager View': 'Resource Manager (View)',
  Candidate: 'Candidate',
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  readonly currentUser = signal<LoginResponse | null>(this.readStoredUser());

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiBaseUrl}/auth/login`, { email, password })
      .pipe(tap((response) => this.store(response)));
  }

  changePassword(currentPassword: string, newPassword: string): Observable<void> {
    return this.http
      .post<void>(`${environment.apiBaseUrl}/auth/change-password`, { currentPassword, newPassword })
      .pipe(
        tap(() => {
          const user = this.currentUser();
          if (user) {
            this.store({ ...user, mustChangePassword: false });
          }
        }),
      );
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.currentUser.set(null);
  }

  get token(): string | null {
    return this.currentUser()?.token ?? null;
  }

  get isLoggedIn(): boolean {
    const user = this.currentUser();
    return !!user && new Date(user.expiresAt).getTime() > Date.now();
  }

  hasRole(role: string): boolean {
    return this.currentUser()?.roles.includes(role) ?? false;
  }

  /** True when the JWT carries the permission, e.g. can('approve_timesheets'). */
  can(permission: string): boolean {
    return this.currentUser()?.permissions.includes(permission) ?? false;
  }

  hasMenu(menu: string): boolean {
    return this.currentUser()?.menus.includes(menu) ?? false;
  }

  homeRoute(): string {
    const roles = this.currentUser()?.roles ?? [];
    return roles.map((role) => ROLE_HOME_ROUTES[role]).find(Boolean) ?? '/login';
  }

  roleTitle(): string {
    const role = this.currentUser()?.roles[0] ?? '';
    return ROLE_TITLES[role] ?? role;
  }

  private store(response: LoginResponse): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(response));
    this.currentUser.set(response);
  }

  private readStoredUser(): LoginResponse | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as LoginResponse) : null;
    } catch {
      return null;
    }
  }
}
