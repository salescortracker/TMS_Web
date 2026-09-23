import { Component, inject, input } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

export interface NavItem {
  label: string;
  path: string;
  disabled?: boolean;
}

@Component({
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  selector: 'app-layout',
  templateUrl: './layout.html',
})
export class Layout {
  private readonly router = inject(Router);

  readonly navItems = input<NavItem[]>([]);
  readonly userName = input('');
  readonly userRole = input('');
  readonly notificationCount = input(0);

  protected get userInitial(): string {
    return this.userName().trim().charAt(0).toUpperCase();
  }

  logOut(): void {
    this.router.navigateByUrl('/login');
  }
}
