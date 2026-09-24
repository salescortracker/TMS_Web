import { Component } from '@angular/core';
import { Layout } from '../../layout/layout';
import { EDITOR_CONTRIBUTOR_NAV_ITEMS } from '../../shared/editor-contributor-nav';

@Component({
  imports: [Layout],
  selector: 'app-editor-contributor-shell',
  templateUrl: './editor-contributor-shell.html',
})
export class EditorContributorShell {
  protected readonly navItems = EDITOR_CONTRIBUTOR_NAV_ITEMS;
}
