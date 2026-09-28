import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { AdminApi, MenuItem, PermissionItem, RoleSummary, StaffUser, UserCreated } from '../../../shared/api/admin.api';
import { errorMessage } from '../../../shared/api/api-helpers';
import { LookupItem, PublicApi } from '../../../shared/api/public.api';
import { AuthService } from '../../../shared/auth.service';

type PeopleTab = 'Staff' | 'Candidates';

interface RoleDraft {
  roleId: number | null; // null = a role that has not been saved yet
  name: string;
  description: string;
  isBuiltIn: boolean;
  menus: string[];
  permissions: string[];
}

@Component({
  imports: [],
  selector: 'app-roles-access',
  templateUrl: './roles-access.html',
})
export class RolesAccess implements OnInit {
  private readonly api = inject(AdminApi);
  private readonly lookupApi = inject(PublicApi);
  private readonly auth = inject(AuthService);

  protected readonly currentUserId = this.auth.currentUser()?.appUserId ?? 0;

  protected readonly roles = signal<RoleSummary[]>([]);
  protected readonly allMenus = signal<MenuItem[]>([]);
  protected readonly allPermissions = signal<PermissionItem[]>([]);
  protected readonly companies = signal<LookupItem[]>([]);
  protected readonly teams = signal<LookupItem[]>([]);
  protected readonly draft = signal<RoleDraft | null>(null);
  protected readonly roleError = signal('');
  protected readonly roleInfo = signal('');

  protected readonly users = signal<StaffUser[]>([]);
  protected readonly peopleTab = signal<PeopleTab>('Staff');
  protected readonly notices = signal<UserCreated[]>([]);
  protected readonly errorText = signal('');
  protected readonly busy = signal(false);

  protected readonly isAddingUser = signal(false);
  protected readonly newUserName = signal('');
  protected readonly newUserEmail = signal('');
  protected readonly newUserRoleId = signal<number | null>(null);
  protected readonly newUserCompanyId = signal<number | null>(null);
  protected readonly newUserTeamId = signal<number | null>(null);
  protected readonly addUserError = signal('');

  protected readonly staffAccounts = computed(() => this.users().filter((u) => !u.isCandidate));
  protected readonly candidateAccounts = computed(() => this.users().filter((u) => u.isCandidate));
  protected readonly assignableRoles = computed(() => this.roles().filter((r) => r.name !== 'Candidate'));

  ngOnInit(): void {
    this.lookupApi.lookups().subscribe({
      next: (lookups) => {
        this.companies.set(lookups.companies);
        this.teams.set(lookups.teams);
      },
    });
    this.loadRoles(null);
    this.loadUsers();
  }

  // ---------- roles ----------

  private loadRoles(selectId: number | null): void {
    this.api.roles().subscribe({
      next: (overview) => {
        this.roles.set(overview.roles);
        this.allMenus.set(overview.allMenus);
        this.allPermissions.set(overview.allPermissions);
        const current = selectId ?? this.draft()?.roleId ?? overview.roles[0]?.roleId ?? null;
        const role = overview.roles.find((r) => r.roleId === current) ?? overview.roles[0];
        if (role && !(this.draft() && this.draft()!.roleId === null && selectId === null)) {
          this.draft.set(this.toDraft(role));
        }
      },
      error: (error) => this.errorText.set(errorMessage(error)),
    });
  }

  private toDraft(role: RoleSummary): RoleDraft {
    return {
      roleId: role.roleId,
      name: role.name,
      description: role.description,
      isBuiltIn: role.isBuiltIn,
      menus: [...role.menus],
      permissions: [...role.permissions],
    };
  }

  selectRole(roleId: number): void {
    const role = this.roles().find((r) => r.roleId === roleId);
    if (role) {
      this.draft.set(this.toDraft(role));
      this.roleError.set('');
      this.roleInfo.set('');
    }
  }

  addNewRole(): void {
    this.draft.set({ roleId: null, name: '', description: '', isBuiltIn: false, menus: [], permissions: [] });
    this.roleError.set('');
    this.roleInfo.set('');
  }

  updateDraft<K extends keyof RoleDraft>(field: K, value: RoleDraft[K]): void {
    this.draft.update((d) => (d ? { ...d, [field]: value } : d));
  }

  toggleMenu(code: string): void {
    const d = this.draft();
    if (d) {
      this.updateDraft('menus', d.menus.includes(code) ? d.menus.filter((m) => m !== code) : [...d.menus, code]);
    }
  }

  togglePermission(code: string): void {
    const d = this.draft();
    if (d) {
      this.updateDraft(
        'permissions',
        d.permissions.includes(code) ? d.permissions.filter((p) => p !== code) : [...d.permissions, code],
      );
    }
  }

  saveRole(): void {
    const d = this.draft();
    if (!d) {
      return;
    }
    const name = d.name.trim();
    if (!name) {
      this.roleError.set('Give the role a name.');
      return;
    }
    if (d.menus.length === 0) {
      this.roleError.set('Choose at least one menu, otherwise this role can open nothing.');
      return;
    }
    const body = { name, description: d.description.trim() || null, menus: d.menus, permissions: d.permissions };
    this.busy.set(true);
    this.roleError.set('');
    const request = d.roleId === null ? this.api.createRole(body) : this.api.updateRole(d.roleId, body);
    request.subscribe({
      next: (saved) => {
        this.busy.set(false);
        this.roleInfo.set(`Role "${saved.name}" saved. People with this role get the change at their next sign-in.`);
        this.draft.set(null);
        this.loadRoles(saved.roleId);
      },
      error: (error) => {
        this.busy.set(false);
        this.roleError.set(errorMessage(error));
      },
    });
  }

  deleteRole(): void {
    const d = this.draft();
    if (!d?.roleId || d.isBuiltIn || !confirm(`Delete the role "${d.name}"?`)) {
      return;
    }
    this.busy.set(true);
    this.api.deleteRole(d.roleId).subscribe({
      next: () => {
        this.busy.set(false);
        this.draft.set(null);
        this.loadRoles(null);
      },
      error: (error) => {
        this.busy.set(false);
        this.roleError.set(errorMessage(error));
      },
    });
  }

  // ---------- users ----------

  private loadUsers(): void {
    this.api.users(null).subscribe({
      next: (users) => this.users.set(users),
      error: (error) => this.errorText.set(errorMessage(error)),
    });
  }

  roleIdOf(user: StaffUser): number | null {
    return this.roles().find((r) => r.name === user.role)?.roleId ?? null;
  }

  setPeopleTab(tab: PeopleTab): void {
    this.peopleTab.set(tab);
  }

  openAddUser(): void {
    this.peopleTab.set('Staff');
    this.newUserName.set('');
    this.newUserEmail.set('');
    this.newUserRoleId.set(this.assignableRoles()[0]?.roleId ?? null);
    this.newUserCompanyId.set(null);
    this.newUserTeamId.set(null);
    this.addUserError.set('');
    this.isAddingUser.set(true);
  }

  cancelAddUser(): void {
    this.isAddingUser.set(false);
  }

  saveNewUser(): void {
    const name = this.newUserName().trim();
    const email = this.newUserEmail().trim();
    const roleId = this.newUserRoleId();
    if (name.length < 2) {
      this.addUserError.set('Enter the full name.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.addUserError.set('Enter a valid email address.');
      return;
    }
    if (!roleId) {
      this.addUserError.set('Choose a role.');
      return;
    }
    this.busy.set(true);
    this.addUserError.set('');
    this.api
      .addUser({ fullName: name, email, roleId, companyId: this.newUserCompanyId(), teamId: this.newUserTeamId() })
      .subscribe({
        next: (created) => {
          this.busy.set(false);
          this.isAddingUser.set(false);
          this.notices.update((list) => [created, ...list]);
          this.loadUsers();
          this.loadRoles(null);
        },
        error: (error) => {
          this.busy.set(false);
          this.addUserError.set(errorMessage(error));
        },
      });
  }

  setStaffRole(user: StaffUser, value: string): void {
    this.act(this.api.changeUserRole(user.appUserId, Number(value), null, null));
  }

  toggleActive(user: StaffUser): void {
    this.act(this.api.setUserActive(user.appUserId, user.status !== 'Active'));
  }

  resetPassword(user: StaffUser): void {
    if (!confirm(`Reset the password for ${user.name}? They must change it at next sign-in.`)) {
      return;
    }
    this.busy.set(true);
    this.errorText.set('');
    this.api.resetPassword(user.appUserId).subscribe({
      next: (created) => {
        this.busy.set(false);
        this.notices.update((list) => [created, ...list]);
      },
      error: (error) => {
        this.busy.set(false);
        this.errorText.set(errorMessage(error));
      },
    });
  }

  private act(request: ReturnType<AdminApi['setUserActive']>): void {
    this.busy.set(true);
    this.errorText.set('');
    request.subscribe({
      next: () => {
        this.busy.set(false);
        this.loadUsers();
        this.loadRoles(null);
      },
      error: (error) => {
        this.busy.set(false);
        this.errorText.set(errorMessage(error));
        this.loadUsers();
      },
    });
  }

  dismissNotice(index: number): void {
    this.notices.update((list) => list.filter((_, i) => i !== index));
  }

  initials(name: string): string {
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.charAt(0) ?? '';
    const second = parts.length > 1 ? (parts[parts.length - 1]?.charAt(0) ?? '') : '';
    return (first + second).toUpperCase();
  }
}
