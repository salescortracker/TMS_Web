import { Component } from '@angular/core';
import { Layout } from '../../layout/layout';
import { SUPER_ADMIN_NAV_ITEMS } from '../../shared/super-admin-nav';

@Component({
  imports: [Layout],
  selector: 'app-super-admin-shell',
  templateUrl: './super-admin-shell.html',
})
export class SuperAdminShell {
  protected readonly navItems = SUPER_ADMIN_NAV_ITEMS;
}
