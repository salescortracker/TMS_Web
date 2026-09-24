import { Component } from '@angular/core';
import { Layout } from '../../layout/layout';
import { RESOURCE_MANAGER_VIEW_NAV_ITEMS } from '../../shared/resource-manager-view-nav';

@Component({
  imports: [Layout],
  selector: 'app-resource-manager-view-shell',
  templateUrl: './resource-manager-view-shell.html',
})
export class ResourceManagerViewShell {
  protected readonly navItems = RESOURCE_MANAGER_VIEW_NAV_ITEMS;
}
