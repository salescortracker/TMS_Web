import { Component, computed, signal } from '@angular/core';

type PeopleTab = 'Staff' | 'Candidates';

interface MenuOption {
  key: string;
  label: string;
  description: string;
}

interface PermissionOption {
  key: string;
  label: string;
  description: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  builtIn: boolean;
  menuKeys: string[];
  permissionKeys: string[];
}

interface StaffAccount {
  id: string;
  name: string;
  email: string;
  roleId: string;
  active: boolean;
  isCurrentUser?: boolean;
}

interface CandidateAccount {
  id: string;
  name: string;
  email: string;
  active: boolean;
}

const ALL_MENUS: MenuOption[] = [
  { key: 'dashboard', label: 'Dashboard', description: 'Submitted, pending and approved counts' },
  {
    key: 'onboarding',
    label: 'Onboarding',
    description: 'Review self-registered candidates',
  },
  {
    key: 'timesheet-approvals',
    label: 'Timesheet Approvals',
    description: 'Daily timesheets waiting for a manager',
  },
  {
    key: 'timesheets',
    label: 'Timesheets',
    description: 'Weekly and monthly totals per candidate',
  },
  {
    key: 'bulk-upload',
    label: 'Bulk Upload',
    description: "Upload many candidates' hours from Excel",
  },
  { key: 'people', label: 'People', description: 'Candidate details and submission timeline' },
  {
    key: 'roles-access',
    label: 'Roles & Access',
    description: 'Create users, roles, menus and permissions',
  },
  {
    key: 'activity-log',
    label: 'Activity Log',
    description: 'Every change and simulated email alerts',
  },
];

const ALL_PERMISSIONS: PermissionOption[] = [
  {
    key: 'approve-timesheets',
    label: 'Approve timesheets',
    description: 'Approve or reject submitted days',
  },
  {
    key: 'edit-timesheets',
    label: 'Edit timesheets',
    description: "Correct a candidate's time entries",
  },
  { key: 'bulk-upload', label: 'Bulk upload', description: 'Import days for any candidate' },
  {
    key: 'approve-onboarding',
    label: 'Approve onboarding',
    description: 'Approve or reject new candidates',
  },
  {
    key: 'manage-roles-users',
    label: 'Manage roles & users',
    description: 'Create users, roles and permissions',
  },
];

const SEED_ROLES: Role[] = [
  {
    id: 'super-administrator',
    name: 'Super Administrator',
    description: 'Naresh and Srikanth — full control',
    builtIn: true,
    menuKeys: ALL_MENUS.map((menu) => menu.key),
    permissionKeys: ALL_PERMISSIONS.map((permission) => permission.key),
  },
  {
    id: 'editor',
    name: 'Editor',
    description: 'Can edit day-to-day timesheet entries and review onboarding',
    builtIn: false,
    menuKeys: ['dashboard', 'onboarding', 'timesheet-approvals', 'timesheets', 'people'],
    permissionKeys: ['edit-timesheets', 'approve-onboarding'],
  },
  {
    id: 'contributor',
    name: 'Contributor',
    description: 'Logs and edits their own timesheet entries',
    builtIn: false,
    menuKeys: ['dashboard', 'timesheets', 'onboarding', 'people'],
    permissionKeys: ['edit-timesheets'],
  },
  {
    id: 'hr',
    name: 'HR',
    description: 'Reviews onboarding and oversees candidate records',
    builtIn: false,
    menuKeys: [
      'dashboard',
      'onboarding',
      'timesheets',
      'people',
      'activity-log',
      'roles-access',
    ],
    permissionKeys: ['approve-onboarding', 'edit-timesheets'],
  },
  {
    id: 'resource-manager',
    name: 'Resource Manager',
    description: 'Read-only visibility into resourcing and onboarding',
    builtIn: false,
    menuKeys: ['dashboard', 'people'],
    permissionKeys: [],
  },
  {
    id: 'candidate',
    name: 'Candidate',
    description: 'Self-service — log time and track onboarding status',
    builtIn: true,
    menuKeys: ['dashboard', 'onboarding', 'timesheets', 'people', 'activity-log'],
    permissionKeys: [],
  },
];

const SEED_STAFF: StaffAccount[] = [
  {
    id: 'naresh-kumar',
    name: 'Naresh Kumar',
    email: 'naresh@cortracker360.com',
    roleId: 'super-administrator',
    active: true,
    isCurrentUser: true,
  },
  {
    id: 'srikanth-boora',
    name: 'Srikanth Boora',
    email: 'srikanth@cortracker360.com',
    roleId: 'super-administrator',
    active: true,
  },
  {
    id: 'vijay-mohan',
    name: 'Vijay Mohan',
    email: 'vijay.mohan@cortracker360.com',
    roleId: 'hr',
    active: true,
  },
  {
    id: 'deena-florence-geddam',
    name: 'Deena Florence Geddam',
    email: 'deena@cortracker360.com',
    roleId: 'editor',
    active: true,
  },
  {
    id: 'aisha-malik',
    name: 'Aisha Malik',
    email: 'aisha.m@cortracker360.com',
    roleId: 'contributor',
    active: true,
  },
  {
    id: 'rohan-shetty',
    name: 'Rohan Shetty',
    email: 'rohan.s@cortracker360.com',
    roleId: 'contributor',
    active: true,
  },
  {
    id: 'resource-manager-demo',
    name: 'Resource Manager Demo',
    email: 'resourcemgr.demo@cortracker360.com',
    roleId: 'resource-manager',
    active: true,
  },
  {
    id: 'karthik-rao',
    name: 'Karthik Rao',
    email: 'karthik.r@cortracker360.com',
    roleId: 'resource-manager',
    active: true,
  },
];

const SEED_CANDIDATES: CandidateAccount[] = [
  { id: 'jordan-alvarez', name: 'Jordan Alvarez', email: 'jordan.alvarez@cortracker360.com', active: true },
  { id: 'priya-natarajan', name: 'Priya Natarajan', email: 'priya.n@cortracker360.com', active: true },
  { id: 'mateo-fernandez', name: 'Mateo Fernandez', email: 'mateo.f@perfectsolutionsgroup.com', active: true },
  { id: 'wei-chen', name: 'Wei Chen', email: 'wei.c@cortracker360.com', active: true },
  { id: 'fatima-sheikh', name: 'Fatima Sheikh', email: 'fatima.s@cortracker360.com', active: true },
  { id: 'daniel-osei', name: 'Daniel Osei', email: 'daniel.o@perfectsolutionsgroup.com', active: true },
  { id: 'sara-whitmore', name: 'Sara Whitmore', email: 'sara.w@cortracker360.com', active: true },
  { id: 'arjun-mehta', name: 'Arjun Mehta', email: 'arjun.m@cortracker360.com', active: true },
  { id: 'nikhil-rao', name: 'Nikhil Rao', email: 'nikhil.r@cortracker360.com', active: true },
  { id: 'tomas-silva', name: 'Tomas Silva', email: 'tomas.s@cortracker360.com', active: true },
  { id: 'grace-kim', name: 'Grace Kim', email: 'grace.k@cortracker360.com', active: true },
  { id: 'omar-haddad', name: 'Omar Haddad', email: 'omar.h@perfectsolutionsgroup.com', active: false },
];

@Component({
  imports: [],
  selector: 'app-manager-roles-access',
  templateUrl: './roles-access.html',
})
export class ManagerRolesAccess {
  protected readonly allMenus = ALL_MENUS;
  protected readonly allPermissions = ALL_PERMISSIONS;

  protected readonly roles = signal<Role[]>(SEED_ROLES);
  protected readonly selectedRoleId = signal(SEED_ROLES[0].id);

  protected readonly staffAccounts = signal<StaffAccount[]>(SEED_STAFF);
  protected readonly candidateAccounts = signal<CandidateAccount[]>(SEED_CANDIDATES);
  protected readonly peopleTab = signal<PeopleTab>('Staff');

  protected readonly isAddingUser = signal(false);
  protected readonly newUserName = signal('');
  protected readonly newUserEmail = signal('');
  protected readonly newUserRoleId = signal('contributor');
  protected readonly addUserError = signal('');

  protected readonly selectedRole = computed(
    () => this.roles().find((role) => role.id === this.selectedRoleId()) ?? this.roles()[0],
  );

  protected readonly assignableRoles = computed(() =>
    this.roles().filter((role) => !role.builtIn || role.id === 'super-administrator'),
  );

  peopleCountFor(roleId: string): number {
    const staffCount = this.staffAccounts().filter((account) => account.roleId === roleId).length;
    const candidateCount = roleId === 'candidate' ? this.candidateAccounts().length : 0;
    return staffCount + candidateCount;
  }

  selectRole(id: string): void {
    this.selectedRoleId.set(id);
  }

  addNewRole(): void {
    const id = `role-${this.roles().length + 1}`;
    const newRole: Role = {
      id,
      name: 'New role',
      description: '',
      builtIn: false,
      menuKeys: [],
      permissionKeys: [],
    };
    this.roles.update((roles) => [...roles, newRole]);
    this.selectedRoleId.set(id);
  }

  updateRoleName(value: string): void {
    this.updateSelectedRole((role) => ({ ...role, name: value }));
  }

  updateRoleDescription(value: string): void {
    this.updateSelectedRole((role) => ({ ...role, description: value }));
  }

  toggleMenu(key: string): void {
    if (this.selectedRole().builtIn) {
      return;
    }
    this.updateSelectedRole((role) => ({
      ...role,
      menuKeys: role.menuKeys.includes(key)
        ? role.menuKeys.filter((menuKey) => menuKey !== key)
        : [...role.menuKeys, key],
    }));
  }

  togglePermission(key: string): void {
    if (this.selectedRole().builtIn) {
      return;
    }
    this.updateSelectedRole((role) => ({
      ...role,
      permissionKeys: role.permissionKeys.includes(key)
        ? role.permissionKeys.filter((permissionKey) => permissionKey !== key)
        : [...role.permissionKeys, key],
    }));
  }

  private updateSelectedRole(updater: (role: Role) => Role): void {
    const id = this.selectedRoleId();
    this.roles.update((roles) => roles.map((role) => (role.id === id ? updater(role) : role)));
  }

  setPeopleTab(tab: PeopleTab): void {
    this.peopleTab.set(tab);
  }

  openAddUser(): void {
    this.peopleTab.set('Staff');
    this.newUserName.set('');
    this.newUserEmail.set('');
    this.newUserRoleId.set(this.assignableRoles()[0]?.id ?? 'contributor');
    this.addUserError.set('');
    this.isAddingUser.set(true);
  }

  cancelAddUser(): void {
    this.isAddingUser.set(false);
    this.addUserError.set('');
  }

  setNewUserName(value: string): void {
    this.newUserName.set(value);
  }

  setNewUserEmail(value: string): void {
    this.newUserEmail.set(value);
  }

  setNewUserRoleId(value: string): void {
    this.newUserRoleId.set(value);
  }

  saveNewUser(): void {
    const name = this.newUserName().trim();
    const email = this.newUserEmail().trim();

    if (!name || !email.includes('@')) {
      this.addUserError.set('Enter a name and a valid email to add a user.');
      return;
    }

    const id = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${this.staffAccounts().length + 1}`;
    this.staffAccounts.update((accounts) => [
      ...accounts,
      { id, name, email, roleId: this.newUserRoleId(), active: true },
    ]);

    this.isAddingUser.set(false);
    this.addUserError.set('');
  }

  setStaffRole(accountId: string, roleId: string): void {
    this.staffAccounts.update((accounts) =>
      accounts.map((account) => (account.id === accountId ? { ...account, roleId } : account)),
    );
  }

  toggleStaffActive(accountId: string): void {
    this.staffAccounts.update((accounts) =>
      accounts.map((account) =>
        account.id === accountId ? { ...account, active: !account.active } : account,
      ),
    );
  }

  toggleCandidateActive(accountId: string): void {
    this.candidateAccounts.update((accounts) =>
      accounts.map((account) =>
        account.id === accountId ? { ...account, active: !account.active } : account,
      ),
    );
  }

  roleName(roleId: string): string {
    return this.roles().find((role) => role.id === roleId)?.name ?? roleId;
  }

  initials(name: string): string {
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.charAt(0) ?? '';
    const second = parts.length > 1 ? (parts[parts.length - 1]?.charAt(0) ?? '') : '';
    return (first + second).toUpperCase();
  }
}
