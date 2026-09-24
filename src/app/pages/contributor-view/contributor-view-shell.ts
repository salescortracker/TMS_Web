import { Component } from '@angular/core';
import { Layout } from '../../layout/layout';
import { CONTRIBUTOR_VIEW_NAV_ITEMS } from '../../shared/contributor-view-nav';

@Component({
  imports: [Layout],
  selector: 'app-contributor-view-shell',
  templateUrl: './contributor-view-shell.html',
})
export class ContributorViewShell {
  protected readonly navItems = CONTRIBUTOR_VIEW_NAV_ITEMS;
}
