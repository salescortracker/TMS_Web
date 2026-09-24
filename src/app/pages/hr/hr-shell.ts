import { Component } from '@angular/core';
import { Layout } from '../../layout/layout';
import { HR_NAV_ITEMS } from '../../shared/hr-nav';

@Component({
  imports: [Layout],
  selector: 'app-hr-shell',
  templateUrl: './hr-shell.html',
})
export class HrShell {
  protected readonly navItems = HR_NAV_ITEMS;
}
