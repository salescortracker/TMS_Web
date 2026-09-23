import { Component } from '@angular/core';
import { Layout } from '../../layout/layout';
import { SUPER_ADMIN_MANAGER_NAV_ITEMS } from '../../shared/super-admin-manager-nav';

@Component({
  imports: [Layout],
  selector: 'app-super-admin-manager-shell',
  templateUrl: './super-admin-manager-shell.html',
})
export class SuperAdminManagerShell {
  protected readonly navItems = SUPER_ADMIN_MANAGER_NAV_ITEMS;
}
