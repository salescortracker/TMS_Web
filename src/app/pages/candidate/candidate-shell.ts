import { Component } from '@angular/core';
import { Layout } from '../../layout/layout';
import { CANDIDATE_NAV_ITEMS } from '../../shared/candidate-nav';

@Component({
  imports: [Layout],
  selector: 'app-candidate-shell',
  templateUrl: './candidate-shell.html',
})
export class CandidateShell {
  protected readonly navItems = CANDIDATE_NAV_ITEMS;
}
